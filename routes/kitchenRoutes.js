import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import kitchenController from '../controllers/kitchenController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', kitchenController.dashboard);
router.patch('/orders/:id/status', kitchenController.updateStatus);
router.get('/api/orders', kitchenController.getActiveOrders);

export default router;
