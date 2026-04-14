<<<<<<< HEAD
# RestaurantOS — Restaurant Management System

A production-ready full-stack Restaurant Management System with QR-based ordering, admin/kitchen dashboards, and Razorpay payment integration.

## Features

- 🏪 Multi-restaurant support
- 📱 QR-based table ordering system
- 👨‍🍳 Real-time kitchen dashboard (kanban board)
- 📊 Admin dashboard with analytics
- 🍕 Full menu management with categories & images
- 🪑 Table management with QR code generation
- 💳 Razorpay payment integration ready
- 🎨 Premium dark-themed UI with glassmorphism

## Tech Stack

- **Backend:** Node.js + Express (ES Modules)
- **Database:** PostgreSQL
- **Frontend:** EJS + Vanilla CSS/JS
- **Auth:** bcrypt + express-session

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 2. Database Setup
```bash
# Create database and tables
psql -U postgres -f schema.sql
```

### 3. Environment Variables
```bash
# Copy example env file
cp .env.example .env

# Edit with your database credentials
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/restaurant_db
```

### 4. Install & Run
```bash
npm install
npm run dev
```

### 5. Open
Navigate to `http://localhost:3000` → Register your restaurant → Start managing!

## Project Structure

```
├── server.js              # Express app entry point
├── config/
│   └── db.js              # PostgreSQL connection pool
├── models/
│   ├── Restaurant.js      # Restaurant CRUD + stats
│   ├── Category.js        # Category CRUD
│   ├── MenuItem.js        # Menu item CRUD
│   ├── Table.js           # Table CRUD + QR
│   └── Order.js           # Order CRUD + items
├── controllers/
│   ├── authController.js  # Login/Register/Logout
│   ├── adminController.js # Dashboard, menu, tables, orders
│   ├── customerController.js # Menu view, ordering
│   ├── kitchenController.js  # Kitchen dashboard
│   ├── qrController.js    # QR code generation
│   └── paymentController.js  # Razorpay integration
├── routes/
│   ├── authRoutes.js
│   ├── adminRoutes.js
│   ├── customerRoutes.js
│   ├── kitchenRoutes.js
│   ├── qrRoutes.js
│   └── paymentRoutes.js
├── middleware/
│   ├── auth.js            # Session auth middleware
│   └── errorHandler.js    # Global error handler
├── views/
│   ├── auth/              # Login & Register
│   ├── admin/             # Dashboard, Menu, Tables, Orders
│   ├── kitchen/           # Kanban order board
│   ├── customer/          # Menu & Order status
│   └── partials/          # Sidebar, etc.
├── public/
│   ├── css/style.css      # Full design system
│   └── uploads/           # Menu item images
├── schema.sql             # PostgreSQL schema
├── .env.example
└── package.json
```

## QR Ordering Flow

1. Admin adds tables → QR codes are generated
2. Customer scans QR → Opens `http://host/r/:restaurantId/table/:tableId`
3. Customer browses menu → Adds items to cart → Places order
4. Order appears on Kitchen Dashboard → Kitchen updates status
5. Customer sees real-time status updates on their phone

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/auth/login` | Login |
| GET/POST | `/auth/register` | Register |
| GET | `/admin/dashboard` | Admin dashboard |
| GET/POST | `/admin/menu` | Menu management |
| GET/POST | `/admin/categories` | Category management |
| GET/POST | `/admin/tables` | Table management |
| GET | `/admin/orders` | Order management |
| GET | `/r/:rid/table/:tid` | Customer menu |
| POST | `/r/:rid/table/:tid/order` | Place order |
| GET | `/order/:id/status` | Order tracking |
| GET | `/kitchen` | Kitchen dashboard |
| GET | `/qr/:tableId` | Generate QR code |
| GET | `/qr/:tableId/download` | Download QR PNG |

## License

ISC
=======
# FoodCheck
>>>>>>> 6ea0e8d13221a20d75f2c4520aca41c739fc2dd0
