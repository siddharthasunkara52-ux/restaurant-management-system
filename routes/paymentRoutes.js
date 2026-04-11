import { Router } from 'express';
import paymentController from '../controllers/paymentController.js';

const router = Router();

router.post('/create', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.patch('/:orderId/mark-paid', paymentController.markPaid);

export default router;
