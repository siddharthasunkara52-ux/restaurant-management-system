// server.js
// Entry point for RestaurantOS — runs fully on localhost

import dotenv from 'dotenv';
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
// Route imports
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import kitchenRoutes from './routes/kitchenRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import qrRoutes from './routes/qrRoutes.js';

dotenv.config(); // Load .env variables FIRST before any other imports

// ---------------------------------------------------------------------------
// ES-module replacement for __dirname (not available natively in ESM)
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ---------------------------------------------------------------------------
// App setup
// ---------------------------------------------------------------------------
const app  = express();
const PORT = process.env.PORT || 3000;

// --- View engine ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Body parsers ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static files (CSS, JS, uploaded images, etc.) ---
// Files in /public are served at the root URL, e.g. /css/style.css
app.use(express.static(path.join(__dirname, 'public')));

// --- Session middleware ---
// NOTE: On localhost, cookie.secure must be FALSE (no HTTPS locally)
app.use(session({
  secret: process.env.SESSION_SECRET || 'local-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,      // ← must be false for http://localhost
    httpOnly: true,     // prevents JS from reading the cookie (security best-practice)
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  },
}));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Root — redirect to dashboard if already logged in, otherwise to login page
app.get('/', (req, res) => {
  if (req.session && req.session.restaurant) {
    return res.redirect('/admin/dashboard');
  }
  res.redirect('/auth/login');
});

app.use('/auth',    authRoutes);
app.use('/admin',   adminRoutes);
app.use('/',        customerRoutes);  // handles /r/:rid/table/:tid etc.
app.use('/kitchen', kitchenRoutes);
app.use('/qr',      qrRoutes);
app.use('/payment', paymentRoutes);

// ---------------------------------------------------------------------------
// Error handling (must be registered AFTER all routes)
// ---------------------------------------------------------------------------
app.use(notFound);     // 404 handler
app.use(errorHandler); // global error handler

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const startServer = async () => {
  try {
    // Verify DB connection before accepting requests
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
    process.exit(1); // Exit with failure code so you notice the crash immediately
  }
};

startServer();

export default app;