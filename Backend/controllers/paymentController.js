import razorpayInstance from "../config/razorpay.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import { sendNotification } from "../utils/sendNotification.js";
import { executeOrderPlacement } from "./orderController.js";
import crypto from "crypto";


// ==============================
// 1. INITIATE PAYMENT ORDER (Before e-com Order exists)
// ==============================
export const createPaymentOrder = async (req, res) => {
  try {
    if (!razorpayInstance) return res.status(500).json({ message: "Payment gateway not configured" });

    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided for calculation." });
    }

    // ⭐ SECURITY: Validate quantities before processing
    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({ message: "Each item must have a productId." });
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
        return res.status(400).json({ message: `Invalid quantity for product ${item.productId}. Must be an integer between 1 and 100.` });
      }
    }

    // Securely calculate total on server side
    let totalAmount = 0;
    const resolvedItems = [];

    for (const item of items) {
      try {
        const product = await Product.findOne({ _id: item.productId, is_deleted: { $ne: true } });
        if (!product) {
          return res.status(400).json({ message: `Product not found or unavailable: ${item.productId}` });
        }

        // ⭐ SECURITY: Check stock availability at payment initiation
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
        }

        const price = product.pricing?.selling_price || product.price || 0;
        if (price <= 0) {
          return res.status(400).json({ message: `Invalid pricing for product: ${product.name}` });
        }

        totalAmount += price * item.quantity;
        resolvedItems.push({
          productId: product._id.toString(),
          quantity: item.quantity,
          price: price // Server-resolved price for logging only
        });
      } catch (findErr) {
        return res.status(400).json({ message: `Invalid product reference detected: ${item.productId}` });
      }
    }

    if (totalAmount <= 0) return res.status(400).json({ message: "Transaction total is 0 or negative. Verify pricing." });

    const options = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `init_${Date.now()}`,
    };

    const paymentOrder = await razorpayInstance.orders.create(options);

    return res.json({
      message: "Gateway sequence initiated.",
      paymentOrder,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Payment Initiation Error:", err.message);
    return res.status(500).json({ error: "Payment initiation failed. Please try again." });
  }
};


// =====================================
// 2. VERIFY & FINALIZE (Atomic Placement)
// =====================================
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData // items, address, cartSource
    } = req.body;

    const customerId = req.user._id;

    // ⭐ SECURITY: Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification details." });
    }

    if (!orderData || !orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ message: "Missing order data for fulfillment." });
    }

    // 1. Signature Verification
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(sign)
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: "Security Violation: Invalid Payment Signature Detected." });
    }

    // ⭐ SECURITY FIX (VULN-1/2/3): Re-resolve ALL prices from DB — NEVER trust client prices
    const secureItems = [];
    let serverCalculatedTotal = 0;

    for (const item of orderData.items) {
      if (!item.productId) {
        return res.status(400).json({ message: "Invalid item: missing productId." });
      }

      // Validate quantity
      const quantity = parseInt(item.quantity, 10);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        return res.status(400).json({ message: `Invalid quantity for product ${item.productId}.` });
      }

      const product = await Product.findOne({ _id: item.productId, is_deleted: { $ne: true } });
      if (!product) {
        return res.status(400).json({ message: `Product not found or unavailable: ${item.productId}` });
      }

      const serverPrice = product.pricing?.selling_price || product.price || 0;
      if (serverPrice <= 0) {
        return res.status(400).json({ message: `Invalid pricing for product: ${product.name}` });
      }

      secureItems.push({
        productId: product._id,
        quantity: quantity,
        price: serverPrice // ⭐ Server-resolved price, NOT from client
      });

      serverCalculatedTotal += serverPrice * quantity;
    }

    // ⭐ SECURITY FIX (VULN-3): Verify Razorpay paid amount matches server-calculated total
    try {
      const razorpayOrder = await razorpayInstance.orders.fetch(razorpay_order_id);
      const paidAmountPaise = razorpayOrder.amount; // Amount in paise
      const expectedAmountPaise = Math.round(serverCalculatedTotal * 100);

      // Allow a small tolerance for rounding (±1 paisa)
      if (Math.abs(paidAmountPaise - expectedAmountPaise) > 1) {
        console.error(`[SECURITY] Amount mismatch! Razorpay: ${paidAmountPaise}, Server: ${expectedAmountPaise}, Customer: ${customerId}`);
        return res.status(400).json({
          message: "Security Violation: Payment amount does not match order total. This incident has been logged."
        });
      }
    } catch (fetchErr) {
      console.error("[SECURITY] Failed to fetch Razorpay order for amount verification:", fetchErr.message);
      return res.status(500).json({ message: "Unable to verify payment amount. Please contact support." });
    }

    // 2. Fulfillment Logic - Create the order with server-verified data
    try {
      const order = await executeOrderPlacement(customerId, {
        shippingAddress: orderData.shippingAddress,
        sourceCartItems: orderData.sourceCartItems || [],
        items: secureItems, // ⭐ Using server-resolved prices
        paymentMethod: 'online',
        razorpayDetails: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature
        }
      });

      return res.json({
        message: "Payment verified. Fulfillment protocol executed.",
        order,
      });
    } catch (orderErr) {
      console.error("Placement error after payment:", orderErr.message);
      // Usually you'd initiate a refund here if stock deduction failed unexpectedly
      return res.status(500).json({
        message: "Payment received but fulfillment failed. Please contact protocol support for manual override.",
        error: orderErr.message
      });
    }

  } catch (err) {
    console.error("Verification logic error:", err.message);
    return res.status(500).json({ error: "Payment verification failed. Please contact support." });
  }
};

// 3. ABORT SEQUENCE (User cancelled modal)
export const paymentFailed = async (req, res) => {
  // No order record existed yet, so we just log or notify.
  return res.json({ message: "Sequence aborted by user. No database records initiated." });
};
