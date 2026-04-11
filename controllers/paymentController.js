import crypto from 'crypto';
import Razorpay from 'razorpay';

import Order from '../models/Order.js';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentController = {
  // 🧾 Create Razorpay Order
  createOrder: async (req, res, next) => {
    try {
      const { orderId } = req.body;

      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: "Order not found",
        });
      }

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(order.total_price * 100), // convert ₹ → paise
        currency: "INR",
        receipt: order.id.toString(),
      });

      // Save Razorpay order ID in DB (optional but recommended)
      await Order.setRazorpayOrderId(orderId, razorpayOrder.id);

      res.json({
        success: true,
        order: {
          id: order.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          razorpayOrderId: razorpayOrder.id,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // ✅ Verify Payment (SECURE)
  verifyPayment: async (req, res, next) => {
    try {
      const {
        orderId,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      } = req.body;

      // 🔐 Verify signature
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          error: "Invalid payment signature",
        });
      }

      // ✅ Mark order as paid
      await Order.updatePaymentStatus(
        orderId,
        "paid",
        razorpay_payment_id
      );

      res.json({
        success: true,
        message: "Payment verified successfully",
      });
    } catch (err) {
      next(err);
    }
  },

  // 🧾 Manual payment (optional)
  markPaid: async (req, res, next) => {
    try {
      const { orderId } = req.params;

      await Order.updatePaymentStatus(orderId, "paid", "manual_payment");

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};

export default paymentController;