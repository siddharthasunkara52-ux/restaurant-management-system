
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './config/db.js';
import {
  errorHandler,
  notFound,
} from './middleware/errorHandler.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import kitchenRoutes from './routes/kitchenRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const app  = express();
const PORT = process.env.PORT || 3000;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'local-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,      
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
app.use('/auth',    authRoutes);
app.use('/admin',   adminRoutes);
app.use('/',        customerRoutes);  
app.use('/kitchen', kitchenRoutes);
app.use('/qr',      qrRoutes);
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
  ║   🍽️  RestaurantOS is running locally!   ║
  ║                                           ║
  ║   URL:  http://localhost:${PORT}             ║
  ║   DB:   PostgreSQL (local) ✅             ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('❌ Server failed to start:', err.message);
    process.exit(1); 
  }
};
startServer();
export default app;