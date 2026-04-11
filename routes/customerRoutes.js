import { Router } from 'express';
import customerController from '../controllers/customerController.js';

const router = Router();

// Customer menu view (QR code target)
router.get('/r/:restaurantId/table/:tableId', customerController.showMenu);

// Place order
router.post('/r/:restaurantId/table/:tableId/order', customerController.placeOrder);

// Order status page
router.get('/order/:orderId/status', customerController.orderStatus);

// Order status API (for polling)
router.get('/api/order/:orderId/status', customerController.orderStatusApi);

export default router;
