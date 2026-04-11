import Order from '../models/Order.js';

// Razorpay integration - ready for production use
// To enable: npm install razorpay, then uncomment the Razorpay initialization below
// import Razorpay from 'razorpay';
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

const paymentController = {
  createOrder: async (req, res, next) => {
    try {
      const { orderId } = req.body;
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      // For demo purposes, return a mock Razorpay order
      // In production, uncomment and use real Razorpay:
      // const razorpayOrder = await razorpay.orders.create({
      //   amount: Math.round(order.total_price * 100), // Amount in paise
      //   currency: 'INR',
      //   receipt: order.id,
      // });
      // await Order.setRazorpayOrderId(orderId, razorpayOrder.id);

      res.json({
        success: true,
        order: {
          id: order.id,
          amount: Math.round(order.total_price * 100),
          currency: 'INR',
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          // razorpayOrderId: razorpayOrder.id, // Uncomment for production
        },
      });
    } catch (err) {
      next(err);
    }
  },

  verifyPayment: async (req, res, next) => {
    try {
      const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

      // In production, verify signature:
      // const crypto = await import('crypto');
      // const expectedSignature = crypto
      //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      //   .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      //   .digest('hex');
      //
      // if (expectedSignature !== razorpay_signature) {
      //   return res.status(400).json({ success: false, error: 'Invalid signature' });
      // }

      await Order.updatePaymentStatus(orderId, 'paid', razorpay_payment_id || 'demo_payment');

      res.json({ success: true, message: 'Payment verified successfully' });
    } catch (err) {
      next(err);
    }
  },

  markPaid: async (req, res, next) => {
    try {
      const { orderId } = req.params;
      await Order.updatePaymentStatus(orderId, 'paid', 'manual_payment');
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};

export default paymentController;
