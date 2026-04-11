import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import authMiddleware from '../middleware/auth.js';
import adminController from '../controllers/adminController.js';

const router = Router();

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// All admin routes require auth
router.use(authMiddleware);

// Dashboard
router.get('/dashboard', adminController.dashboard);

// Menu
router.get('/menu', adminController.menuList);
router.post('/menu', upload.single('image'), adminController.menuCreate);
router.post('/menu/:id/update', upload.single('image'), adminController.menuUpdate);
router.patch('/menu/:id/toggle', adminController.menuToggle);
router.delete('/menu/:id', adminController.menuDelete);

// Categories
router.get('/categories', adminController.categoryList);
router.post('/categories', adminController.categoryCreate);
router.post('/categories/:id/update', adminController.categoryUpdate);
router.delete('/categories/:id', adminController.categoryDelete);

// Tables
router.get('/tables', adminController.tableList);
router.post('/tables', adminController.tableCreate);
router.patch('/tables/:id/toggle', adminController.tableToggle);
router.delete('/tables/:id', adminController.tableDelete);

// Orders
router.get('/orders', adminController.orderList);
router.patch('/orders/:id/status', adminController.orderUpdateStatus);

export default router;
