import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import { generateReceiptPdf } from '../utils/pdfGenerator.js';
import { sendReceiptEmail } from '../utils/emailService.js';
let razorpay = null;
function getRazorpay() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}
const paymentController = {
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
      const subtotal = parseFloat(order.total_price);
      const gst = subtotal * 0.05;
      const finalTotal = subtotal + gst;
      const amountInPaise = Math.round(finalTotal * 100);
      console.log(`DEBUG PAYMENT: subtotal=${subtotal}, gst=${gst}, total=${finalTotal}, amountInPaise=${amountInPaise}`);
      const razorpayOrder = await getRazorpay().orders.create({
        amount: amountInPaise, 
        currency: "INR",
        receipt: order.id.toString(),
      });
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
  verifyPayment: async (req, res, next) => {
    try {
      const {
        orderId,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      } = req.body;
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
      await Order.updatePaymentStatus(
        orderId,
        "paid",
        razorpay_payment_id
      );
      try {
        const fullOrder = await Order.findById(orderId);
        if (fullOrder && fullOrder.customer_email) {
           const restaurant = await Restaurant.findById(fullOrder.restaurant_id);
           const pdfBuffer = await generateReceiptPdf(req.app, fullOrder, restaurant);
           await sendReceiptEmail(fullOrder.customer_email, pdfBuffer, fullOrder.id);
        }
      } catch (emailErr) {
         console.error("Email Dispatch Error inside Payment Verification:", emailErr);
      }
      res.json({
        success: true,
        message: "Payment verified successfully",
      });
    } catch (err) {
      next(err);
    }
  },
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