import { Router } from 'express';
import customerController from '../controllers/customerController.js';
const router = Router();
router.get('/r/:restaurantId/table/:tableId', customerController.showMenu);
router.post('/r/:restaurantId/table/:tableId/order', customerController.placeOrder);
router.get('/order/:orderId/status', customerController.orderStatus);
router.get('/api/order/:orderId/status', customerController.orderStatusApi);
router.get('/api/receipt/:orderId', customerController.downloadReceipt);
export default router;
