import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { createNotification } from "./notificationController.js";
import { decrypt } from "../utils/cryptoUtils.js";
import razorpayInstance from "../config/razorpay.js";

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId")
      .populate("items.productId");

    // ⭐ Decrypt Sensitive Bank/UPI Details for Admin View
    const decryptedOrders = orders.map(order => {
      const orderObj = order.toObject();
      if (orderObj.refundAccountDetails) {
        if (orderObj.refundAccountDetails.accountType === 'upi' && orderObj.refundAccountDetails.upiId) {
          orderObj.refundAccountDetails.upiId = decrypt(orderObj.refundAccountDetails.upiId);
        } else if (orderObj.refundAccountDetails.accountType === 'bank') {
          if (orderObj.refundAccountDetails.accountNumber) {
            orderObj.refundAccountDetails.accountNumber = decrypt(orderObj.refundAccountDetails.accountNumber);
          }
        }
      }
      return orderObj;
    });

    res.json(decryptedOrders);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const orders = await Order.find({ status })
      .populate("customerId")
      .populate("items.productId");

    res.json(orders);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { orderId, id } = req.params; // Accept both parameter names
    const orderIdToUse = orderId || id; // Use whichever is provided
    const { status } = req.body;

    const allowedStatus = [
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

    console.log(`[AdminUpdateOrder] ID: ${orderIdToUse}, Status: ${status}`);

    if (!allowedStatus.includes(status)) {
      console.log('[AdminUpdateOrder] Invalid status');
      return res.status(400).json({ message: "Invalid status" });
    }

    // ⭐ Fetch order first (we need full data for refund/stock logic)
    const order = await Order.findById(orderIdToUse).populate("customerId");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const previousStatus = order.status;

    // Determine payment status based on order status
    if (status === 'cancelled') {
      if (order.paymentStatus === 'success') {
        // Will be updated to 'refunded' by the refund logic below
      } else {
        order.paymentStatus = 'failed';
      }
    } else if (status === 'paid' || status === 'shipped' || status === 'delivered') {
      order.paymentStatus = 'success';
    } else if (status === 'pending_payment') {
      order.paymentStatus = 'pending';
    } else if (status === 'refunded') {
      order.paymentStatus = 'refunded';
    }

    // ⭐ Store deliveredAt timestamp when marking as delivered (MED-4 fix)
    if (status === 'delivered' && previousStatus !== 'delivered') {
      order.deliveredAt = new Date();
    }

    // ⭐ MANUAL REFUND ONLY: Record refund details in DB for tracking, no API call
    if (status === 'refunded' || status === 'cancelled') {
      if (order.paymentStatus === 'success') {
        order.paymentStatus = 'refunded';
      }
      
      if (!order.refundDetails || !order.refundDetails.refundAmount) {
        order.refundDetails = {
          refundAmount: order.totalAmount || 0,
          refundStatus: 'processed',
          refundedAt: new Date(),
          notes: 'Manual refund processed by admin'
        };
      }
      console.log(`[REFUND] Order ${order._id} marked as cancelled/refunded. Manual refund tracking recorded.`);
    }

    // ⭐ CRITICAL-4: Restore stock when status transitions to cancelled or refunded
    if (['cancelled', 'refunded'].includes(status) && !['cancelled', 'refunded'].includes(previousStatus)) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: {
            stock: item.quantity,
            sold_count: -item.quantity
          }
        });
      }
      console.log(`[STOCK] Restored stock for order ${order._id} (status: ${previousStatus} → ${status})`);
    }

    // Update status
    order.status = status;
    await order.save();

    // ⭐ MED-1: Context-aware notification messages
    const notificationMessages = {
      cancelled: { title: "Order Cancelled", message: `Your order #${order._id.toString().slice(-6)} has been cancelled by the admin.` },
      refunded: { title: "Refund Processed", message: `Your refund of ₹${order.totalAmount} for order #${order._id.toString().slice(-6)} has been processed.` },
      return_approved: { title: "Return Approved", message: `Your return request for order #${order._id.toString().slice(-6)} has been approved. Please ship the item back.` },
      return_rejected: { title: "Return Rejected", message: `Your return request for order #${order._id.toString().slice(-6)} has been reviewed and was not approved.` },
      refund_initiated: { title: "Refund Initiated", message: `A refund has been initiated for your order #${order._id.toString().slice(-6)}. It will be processed shortly.` },
      shipped: { title: "Order Shipped", message: `Your order #${order._id.toString().slice(-6)} has been shipped!` },
      delivered: { title: "Order Delivered", message: `Your order #${order._id.toString().slice(-6)} has been delivered!` },
    };

    const notification = notificationMessages[status] || {
      title: "Order Status Updated",
      message: `Your order status has been updated to: ${status.replaceAll('_', ' ')}`
    };

    if (order.customerId) {
      await createNotification({
        userId: order.customerId._id,
        userType: "customer",
        title: notification.title,
        message: notification.message,
        type: "order"
      });
    }

    res.json({
      message: `Order status updated to ${status} by Admin`,
      order
    });

  } catch (err) {
    console.error('[AdminUpdateOrder] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // ⭐ Prevent double-cancellation
    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled." });
    }

    order.status = "cancelled";
    order.paymentStatus = "failed";
    await order.save();

    // ⭐ SECURITY FIX (VULN-11 + VULN-5): Restore stock when admin confirms cancellation
    // This is the authoritative stock restore point (customer cancel only requests, admin confirms)
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          stock: item.quantity,
          sold_count: -item.quantity
        }
      });
    }

    res.json({ message: "Order cancelled successfully. Stock restored.", order });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};