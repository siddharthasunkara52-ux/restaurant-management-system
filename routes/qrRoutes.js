import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import qrController from '../controllers/qrController.js';

const router = Router();

router.use(authMiddleware);

router.get('/:tableId', qrController.generateQR);
router.get('/:tableId/download', qrController.downloadQR);

export default router;
