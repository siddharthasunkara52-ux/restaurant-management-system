import { query, generateId } from '../config/db.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

const Restaurant = {
  create: async ({ name, email, password, phone, address }) => {
    const id = generateId();
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await query(
      `INSERT INTO restaurants (id, name, email, password, phone, address) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, name, email, hashedPassword, phone, address]
    );
    const result = await query('SELECT * FROM restaurants WHERE id = $1', [id]);
    return result.rows[0];
  },

  findByEmail: async (email) => {
    const result = await query('SELECT * FROM restaurants WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  findById: async (id) => {
    const result = await query('SELECT * FROM restaurants WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  update: async (id, { name, phone, address }) => {
    await query(
      `UPDATE restaurants SET name = $1, phone = $2, address = $3, updated_at = NOW() WHERE id = $4`,
      [name, phone, address, id]
    );
    const result = await query('SELECT * FROM restaurants WHERE id = $1', [id]);
    return result.rows[0];
  },

  updateLogo: async (id, logo) => {
    await query(
      `UPDATE restaurants SET logo = $1, updated_at = NOW() WHERE id = $2`,
      [logo, id]
    );
    const result = await query('SELECT * FROM restaurants WHERE id = $1', [id]);
    return result.rows[0];
  },

  comparePassword: async (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  getStats: async (restaurantId) => {
    const totalOrders = await query(
      'SELECT COUNT(*) as count FROM orders WHERE restaurant_id = $1',
      [restaurantId]
    );
    const todayOrders = await query(
      `SELECT COUNT(*) as count FROM orders WHERE restaurant_id = $1 AND DATE(created_at) = CURRENT_DATE`,
      [restaurantId]
    );
    const totalRevenue = await query(
      `SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE restaurant_id = $1 AND payment_status = 'paid'`,
      [restaurantId]
    );
    const todayRevenue = await query(
      `SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE restaurant_id = $1 AND payment_status = 'paid' AND DATE(created_at) = CURRENT_DATE`,
      [restaurantId]
    );
    const activeOrders = await query(
      `SELECT COUNT(*) as count FROM orders WHERE restaurant_id = $1 AND status NOT IN ('served', 'cancelled')`,
      [restaurantId]
    );
    const menuItems = await query(
      'SELECT COUNT(*) as count FROM menu_items WHERE restaurant_id = $1',
      [restaurantId]
    );

    return {
      totalOrders: parseInt(totalOrders.rows[0].count),
      todayOrders: parseInt(todayOrders.rows[0].count),
      totalRevenue: parseFloat(totalRevenue.rows[0].total) || 0,
      todayRevenue: parseFloat(todayRevenue.rows[0].total) || 0,
      activeOrders: parseInt(activeOrders.rows[0].count),
      menuItems: parseInt(menuItems.rows[0].count),
    };
  },
};

export default Restaurant;
