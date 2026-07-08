import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { createNotification } from "./notificationController.js";
import { decrypt } from "../utils/cryptoUtils.js";
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

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId")
      .populate("items.productId");

    // Sync any pending refunds from Razorpay
    await syncPendingRefunds(orders);

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
    const { status, rejectReason } = req.body;

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
    const previousPaymentStatus = order.paymentStatus;

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

    // ⭐ AUTOMATIC REFUND VIA RAZORPAY: If order is online, paid, has payment ID, and status transitions to cancelled, refunded, or return_approved
    if (['cancelled', 'refunded', 'return_approved'].includes(status) && order.paymentMethod === 'online' && previousPaymentStatus === 'success' && order.razorpayPaymentId) {
      if (razorpayInstance) {
        try {
          console.log(`[AUTOMATIC REFUND] Initiating Razorpay refund for Order ${order._id}, Payment ID: ${order.razorpayPaymentId}`);
          const refundResult = await razorpayInstance.payments.refund(order.razorpayPaymentId, {
            amount: Math.round(order.totalAmount * 100), // in paise
            notes: {
              orderId: order._id.toString(),
              reason: `Admin changed status to ${status}`
            }
          });
          console.log(`[AUTOMATIC REFUND SUCCESS] Razorpay refund successful for Order ${order._id}. Refund ID: ${refundResult.id}`);
          
          order.paymentStatus = 'refunded';
          const refundIsProcessed = refundResult.status === 'processed';
          order.refundDetails = {
            refundId: refundResult.id,
            refundAmount: order.totalAmount || 0,
            refundStatus: refundIsProcessed ? 'processed' : 'pending',
            refundedAt: new Date(),
            notes: `Automatic refund initiated via Razorpay. Refund ID: ${refundResult.id}`
          };
          if (refundIsProcessed) {
            order.status = 'refunded';
          }
        } catch (refErr) {
          const refundError = refErr.error?.description || refErr.description || refErr.message || JSON.stringify(refErr);
          console.error(`[AUTOMATIC REFUND FAILED] Razorpay refund failed for Order ${order._id}:`, refundError);
          return res.status(500).json({
            message: `Failed to process automatic refund via Razorpay: ${refundError}. Order status not updated.`,
            error: refundError
          });
        }
      } else {
        console.warn(`[AUTOMATIC REFUND] Razorpay instance not configured. Cannot process refund for Order ${order._id}`);
        return res.status(500).json({
          message: "Payment gateway is not configured. Cannot process automatic refund."
        });
      }
    } else if (['cancelled', 'refunded'].includes(status)) {
      // COD or manual payment refund tracking fallback
      if (order.paymentStatus === 'success') {
        order.paymentStatus = 'refunded';
      }
      
      if (!order.refundDetails || !order.refundDetails.refundAmount) {
        order.refundDetails = {
          refundAmount: order.totalAmount || 0,
          refundStatus: 'processed',
          refundedAt: new Date(),
          notes: 'Refund recorded for COD / Manual order'
        };
      }
      console.log(`[REFUND] Order ${order._id} marked as cancelled/refunded. COD/Manual refund tracking recorded.`);
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
    if (status === 'return_rejected') {
      order.returnRejectReason = rejectReason || "Rejected by admin";
    }
    await order.save();

    // ⭐ MED-1: Context-aware notification messages
    const notificationMessages = {
      cancelled: { title: "Order Cancelled", message: `Your order #${order._id.toString().slice(-6)} has been cancelled by the admin.` },
      refunded: { title: "Refund Processed", message: `Your refund of ₹${order.totalAmount} for order #${order._id.toString().slice(-6)} has been processed.` },
      return_approved: { title: "Return Approved", message: `Your return request for order #${order._id.toString().slice(-6)} has been approved. Please ship the item back.` },
      return_rejected: { title: "Return Rejected", message: `Your return request for order #${order._id.toString().slice(-6)} has been reviewed and was not approved.${rejectReason ? ` Reason: ${rejectReason}` : ''}` },
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

    // ⭐ AUTOMATIC REFUND: If order is online, paid, and has razorpayPaymentId
    if (order.paymentMethod === 'online' && order.paymentStatus === 'success' && order.razorpayPaymentId) {
      if (razorpayInstance) {
        try {
          console.log(`[AUTOMATIC REFUND] Initiating Razorpay refund for Order ${order._id}, Payment ID: ${order.razorpayPaymentId}`);
          const refundResult = await razorpayInstance.payments.refund(order.razorpayPaymentId, {
            amount: Math.round(order.totalAmount * 100),
            notes: {
              orderId: order._id.toString(),
              reason: "Admin cancelled order via cancel endpoint"
            }
          });
          console.log(`[AUTOMATIC REFUND SUCCESS] Razorpay refund successful for Order ${order._id}. Refund ID: ${refundResult.id}`);
          order.paymentStatus = "refunded";
          order.refundDetails = {
            refundId: refundResult.id,
            refundAmount: order.totalAmount || 0,
            refundStatus: 'processed',
            refundedAt: new Date(),
            notes: `Automatic refund processed via Razorpay. Refund ID: ${refundResult.id}`
          };
        } catch (refErr) {
          const refundError = refErr.error?.description || refErr.description || refErr.message || JSON.stringify(refErr);
          console.error(`[AUTOMATIC REFUND FAILED] Razorpay refund failed for Order ${order._id}:`, refundError);
          return res.status(500).json({
            message: `Failed to process automatic refund via Razorpay: ${refundError}. Order not cancelled.`,
            error: refundError
          });
        }
      } else {
        return res.status(500).json({
          message: "Payment gateway is not configured. Cannot process automatic refund."
        });
      }
    } else {
      order.paymentStatus = "failed";
    }
    order.status = "cancelled";
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