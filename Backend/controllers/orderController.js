import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { createNotification } from "../controllers/notificationController.js";  // ⭐ UPDATED
import { encrypt, decrypt } from "../utils/cryptoUtils.js";
import razorpayInstance from "../config/razorpay.js";

// Helper to check and update order status from Razorpay for pending refunds
const syncPendingRefunds = async (orders) => {
  if (!razorpayInstance) return;

  const pendingRefundOrders = orders.filter(o => 
    ['return_approved', 'refund_initiated'].includes(o.status) && 
    o.refundDetails && 
    o.refundDetails.refundId && 
    o.refundDetails.refundStatus !== 'processed'
  );

  if (pendingRefundOrders.length === 0) return;

  for (const order of pendingRefundOrders) {
    try {
      console.log(`[REFUND SYNC] Fetching status for Refund ID: ${order.refundDetails.refundId}`);
      const refund = await razorpayInstance.refunds.fetch(order.refundDetails.refundId);
      
      console.log(`[REFUND SYNC] Refund status on Razorpay: ${refund.status}`);
      if (refund.status === 'processed') {
        order.status = 'refunded';
        order.paymentStatus = 'refunded';
        order.refundDetails.refundStatus = 'processed';
        order.refundDetails.notes = `Automatic refund processed via Razorpay. Refund ID: ${refund.id}`;
        await order.save();
        console.log(`[REFUND SYNC SUCCESS] Order ${order._id} auto-updated to 'refunded'`);
      }
    } catch (err) {
      console.error(`[REFUND SYNC FAILED] Error syncing refund for Order ${order._id}:`, err.message);
    }
  }
};


// ==============================
// 0. CORE ORDER EXECUTION HELPER (For fulfillment after payment)
// ==============================
export const executeOrderPlacement = async (customerId, orderData) => {
  const {
    shippingAddress,
    paymentMethod,
    items,
    sourceCartItems = [],
    razorpayDetails = null
  } = orderData;

  // ⭐ SECURITY FIX (VULN-2/4): Re-resolve ALL prices from the database
  // NEVER trust prices passed in from callers (especially the payment flow)
  const secureItems = [];
  for (const item of items) {
    // Validate quantity is a positive integer within bounds
    const quantity = parseInt(item.quantity, 10);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      throw new Error(`Invalid quantity (${item.quantity}) for product: ${item.productId}`);
    }

    const product = await Product.findOne({ _id: item.productId, is_deleted: { $ne: true } });
    if (!product) {
      throw new Error(`Product not found or unavailable: ${item.productId}`);
    }

    const serverPrice = product.pricing?.selling_price || product.price || 0;
    if (serverPrice <= 0) {
      throw new Error(`Invalid pricing for product: ${product.name}`);
    }

    // ⭐ PRODUCTION INCLUSIVE TAX CALCULATION (e.g., GST 18% Included in Selling Price)
    let taxRate = 0.18; // Default 18%
    if (product.tax_class === 'reduced') taxRate = 0.05;
    if (product.tax_class === 'exempt') taxRate = 0;

    const totalItemPrice = serverPrice * quantity;
    const baseItemPrice = totalItemPrice / (1 + taxRate);
    const itemTaxAmount = totalItemPrice - baseItemPrice;

    secureItems.push({
      productId: product._id,
      sku: product.sku,
      quantity: quantity,
      price: serverPrice, // ⭐ Server-resolved inclusive price (e.g., 1099)
      taxAmount: itemTaxAmount
    });
  }

  // 1. Calculate final totals from server-verified prices (Taxes are inclusive)
  const totalItemAmount = secureItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const taxTotal = secureItems.reduce((sum, item) => sum + item.taxAmount, 0);
  
  // Base subtotal excluding tax to store in database
  const subTotal = totalItemAmount - taxTotal;
  
  // Dynamic Shipping Logic
  const shippingFee = totalItemAmount >= 999 ? 0 : (paymentMethod === 'cod' ? 100 : 85);
  const totalAmount = totalItemAmount + shippingFee;

  // 2. ATOMIC STOCK DEDUCTION
  for (const item of secureItems) {
    const product = await Product.findOneAndUpdate(
      {
        _id: item.productId,
        stock: { $gte: item.quantity }
      },
      {
        $inc: { stock: -item.quantity, sold_count: item.quantity }
      },
      { new: true }
    );

    if (!product) {
      throw new Error(`Insufficient stock for product: ${item.productId}`);
    }

    // Alert for low stock
    if (product.stock <= product.low_stock_threshold) {
      console.warn(`LOW STOCK ALERT: Product ${product.name} (SKU: ${product.sku}) is below threshold.`);
      // Optional: Create admin notification
    }
  }

  // 3. Create E-com Order Record
  const order = await Order.create({
    customerId,
    items: secureItems,
    subTotal,
    taxTotal,
    shippingFee,
    totalAmount,
    shippingAddress,
    paymentMethod,
    status: paymentMethod === 'online' ? "paid" : "pending_payment",
    paymentStatus: paymentMethod === 'online' ? "success" : "pending",
    ...razorpayDetails // Spread razorpayOrderId, paymentId, signature if provided
  });

  // 4. NOTIFICATION
  await createNotification({
    userId: customerId,
    userType: "customer",
    title: paymentMethod === 'online' ? "Payment Received" : "Order Placed",
    message: paymentMethod === 'online'
      ? `Your payment of ₹${totalAmount} was successful. Order confirmed!`
      : "Your order has been initiated. Proceed with Cash on Delivery.",
    type: "order"
  });

  // 5. Remove items from Cart (if applicable)
  if (sourceCartItems.length > 0) {
    const itemIdsToRemove = sourceCartItems.map(item => item._id);
    await Cart.findOneAndUpdate(
      { customerId },
      { $pull: { items: { _id: { $in: itemIdsToRemove } } } }
    );
  }

  return await Order.findById(order._id).populate("items.productId");
};

export const createOrder = async (req, res) => {
  try {
    const customerId = req.user._id;
    const {
      shippingAddress,
      paymentMethod = "cod",
      cartItemIds = [],
      directItems = []
    } = req.body;

    // Online payments should not use this endpoint to 'initiate' orders anymore
    if (paymentMethod === 'online') {
      return res.status(400).json({
        message: "Online orders must be initiated through the payment gateway protocol."
      });
    }

    let orderItems = [];
    let sourceCartItems = [];

    // Resolve Items
    if (directItems && directItems.length > 0) {
      for (const item of directItems) {
        const product = await Product.findById(item.productId);
        if (!product) continue;
        orderItems.push({
          productId: product._id,
          quantity: item.quantity,
          price: product.pricing?.selling_price || product.price || 0,
        });
      }
    } else {
      const cart = await Cart.findOne({ customerId }).populate("items.productId");
      if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

      sourceCartItems = cart.items.filter(item => {
        if (!item.productId) return false;
        if (cartItemIds.length > 0) {
          return cartItemIds.includes(item.productId._id.toString()) || cartItemIds.includes(item._id.toString());
        }
        return true;
      });

      if (sourceCartItems.length === 0) return res.status(400).json({ message: "No selected items found in cart." });

      orderItems = sourceCartItems.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.pricing?.selling_price || item.productId.price || 0,
      }));
    }

    if (orderItems.length === 0) return res.status(400).json({ message: "No valid products encountered." });

    // Execute placement for COD
    const order = await executeOrderPlacement(customerId, {
      shippingAddress,
      paymentMethod: "cod",
      items: orderItems,
      sourceCartItems
    });

    return res.json({ message: "Order placed successfully via COD protocol.", order });

  } catch (err) {
    console.error("Order Creation Error:", err);
    return res.status(500).json({ message: "Failed to place order", error: err.message });
  }
};

// ==============================
// ⭐ GET MY ORDERS (CUSTOMER)
// ==============================
export const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user._id;

    const orders = await Order.find({ customerId })
      .populate("items.productId")
      .sort({ createdAt: -1 }); // Most recent first

    // Sync any pending refunds from Razorpay
    await syncPendingRefunds(orders);

    return res.json({
      count: orders.length,
      orders
    });

  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: err.message
    });
  }
};

// ==============================
// ⭐ GET ALL ORDERS (ADMIN)
// ==============================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("customerId", "name email phone")
      .populate("items.productId", "name images")
      .sort({ createdAt: -1 }); // Most recent first

    // ⭐ Decrypt Bank Details for Admin Hub
    const decryptedOrders = orders.map(order => {
      const orderObj = order.toObject();
      if (orderObj.refundAccountDetails) {
        if (orderObj.refundAccountDetails.accountNumber) {
          orderObj.refundAccountDetails.accountNumber = decrypt(orderObj.refundAccountDetails.accountNumber);
        }
        if (orderObj.refundAccountDetails.upiId) {
          orderObj.refundAccountDetails.upiId = decrypt(orderObj.refundAccountDetails.upiId);
        }
        // IFSC is usually fine, but encrypting it doesn't hurt. 
        // For now let's stick to sensitive ones.
      }
      return orderObj;
    });

    return res.json(decryptedOrders);

  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch all orders",
      error: err.message
    });
  }
};

// ==============================
// ⭐ CANCEL ORDER (CUSTOMER / ADMIN)
// ==============================
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, refundAccountDetails } = req.body;
    const userId = req.user._id;
    const userType = req.user.role === 'admin' ? 'admin' : 'customer';

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Security: Ensure customer can only cancel their own order
    if (userType === 'customer' && order.customerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to cancel this order" });
    }

    // Validation: Check if order can be cancelled
    const nonCancellableStatuses = ["shipped", "delivered", "cancelled", "returned", "return_requested"];
    if (nonCancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        message: `Order cannot be cancelled. Current status: ${order.status.replace('_', ' ')}`
      });
    }

    // Production Workflow: If already paid, handle refund logic
    if (order.paymentStatus === 'success') {
      order.status = 'cancellation_requested'; // Send to Admin for permission first
      order.deliveryAttempted = false; // Clearly indicate product stays in warehouse
      order.refundDetails = {
        refundStatus: 'pending',
        refundAmount: order.totalAmount,
        initiatedAt: new Date(),
        message: "Customer requested cancellation before delivery (Paid Online)"
      };
    } else {
      order.status = 'cancellation_requested'; // All cancellations now require admin approval
    }

    order.cancelReason = reason || "Cancelled by user";
    order.cancellationDate = new Date();

    // ⭐ REFD-DETAILS (For COD / Manual Online)
    if (refundAccountDetails) {
      try {
        let details = typeof refundAccountDetails === 'string'
          ? JSON.parse(refundAccountDetails)
          : refundAccountDetails;

        if (details.accountNumber) details.accountNumber = encrypt(details.accountNumber);
        if (details.upiId) details.upiId = encrypt(details.upiId);
        order.refundAccountDetails = details;
      } catch (err) {
        order.refundAccountDetails = refundAccountDetails;
      }
    }

    await order.save();

    // ⭐ SECURITY FIX (VULN-5): Only replenish stock when order is fully cancelled,
    // NOT when it's just a cancellation_requested (pending admin approval).
    // Stock will be restored by admin when they confirm the cancellation in adminOrderController.
    // This prevents phantom inventory from repeated request/reject cycles.

    // ⭐ NOTIFICATION
    await createNotification({
      userId: order.customerId,
      userType: "customer",
      title: "Order Cancelled",
      message: `Your order #${order._id.toString().slice(-6)} has been cancelled successfully.`,
      type: "order"
    });

    return res.json({
      message: "Order cancelled successfully",
      order
    });

  } catch (err) {
    console.error("Order Cancellation Error:", err);
    return res.status(500).json({ message: "Failed to cancel order", error: err.message });
  }
};

// ==============================
// ⭐ RETURN ORDER REQUEST (CUSTOMER)
// ==============================
export const returnOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, refundAccountDetails } = req.body;
    const customerId = req.user._id;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Security check
    if (order.customerId.toString() !== customerId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Validation: Must be delivered or previously rejected to return
    if (!['delivered', 'return_rejected'].includes(order.status)) {
      return res.status(400).json({ message: "Only delivered orders can be returned" });
    }

    // Amazon/Flipkart Level: Check return window (e.g., 7 days)
    const deliveryDate = order.deliveredAt || order.updatedAt; // Use explicit delivery date, fallback to updatedAt
    const daysSinceDelivery = (new Date() - new Date(deliveryDate)) / (1000 * 60 * 60 * 24);

    if (daysSinceDelivery > 7) {
      return res.status(400).json({ message: "Return window (7 days) has expired" });
    }

    order.status = 'return_requested';
    order.returnReason = reason;
    order.returnRequestDate = new Date();
    order.returnRejectReason = undefined; // Clear previous rejection reason

    // 📸 ⭐ HANDLE RETURN IMAGES & VIDEOS (MULTER)
    if (req.files) {
      if (req.files.images && req.files.images.length > 0) {
        order.returnImages = req.files.images.map((file) => file.path);
      }
      if (req.files.video && req.files.video.length > 0) {
        order.returnVideo = req.files.video[0].path;
      }
    }

    // ⭐ REFD-DETAILS (Encrypt Sensitive Data)
    if (refundAccountDetails) {
      try {
        let details = typeof refundAccountDetails === 'string'
          ? JSON.parse(refundAccountDetails)
          : refundAccountDetails;

        if (details.accountNumber) details.accountNumber = encrypt(details.accountNumber);
        if (details.upiId) details.upiId = encrypt(details.upiId);

        order.refundAccountDetails = details;
      } catch (err) {
        order.refundAccountDetails = refundAccountDetails;
      }
    }

    await order.save();

    // ⭐ NOTIFICATION (To Admin)
    // You would typically notify admin here too

    return res.json({
      message: "Return request submitted successfully",
      order
    });

  } catch (err) {
    return res.status(500).json({ message: "Failed to submit return request", error: err.message });
  }
};

// ==============================
// ⭐ UPDATE ORDER STATUS (ADMIN)
// ==============================
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      "pending_payment",
      "paid",
      "packed",
      "shipped",
      "delivered",
      "cancelled",
      "return_requested",
      "return_approved",
      "return_rejected",
      "returned",
      "refund_initiated",
      "refunded"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("customerId", "name email")
      .populate("items.productId", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ⭐ NOTIFICATION — Notify Customer about status update
    await createNotification({
      userId: order.customerId._id,
      userType: "customer",
      title: "Order Status Updated",
      message: `Your order status has been updated to: ${status.replaceAll('_', ' ')}`,
      type: "order"
    });

    return res.json({
      message: "Order status updated successfully",
      order
    });

  } catch (err) {
    return res.status(500).json({
      message: "Failed to update order status",
      error: err.message
    });
  }
};
