import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import kitchenRoutes from './routes/kitchenRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.get('/', (req, res) => {
  if (req.session && req.session.restaurant) {
    return res.redirect('/admin/dashboard');
  }
  res.redirect('/auth/login');
});

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', customerRoutes);
app.use('/kitchen', kitchenRoutes);
app.use('/qr', qrRoutes);
app.use('/payment', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await initDB();

    app.listen(PORT, () => {
      console.log(`
  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║   🍽️  RestaurantOS is running!            ║
  ║                                           ║
  ║   Local:  http://localhost:${PORT}           ║
  ║   Mode:   ${process.env.NODE_ENV || 'development'}                   ║
  ║   DB:     PostgreSQL ✅                   ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

export default app;
