import { Router } from 'express';
import authController from '../controllers/authController.js';

const router = Router();

router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.get('/register', authController.showRegister);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

export default router;
