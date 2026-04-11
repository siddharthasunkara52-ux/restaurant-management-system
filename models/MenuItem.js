import { query, generateId } from '../config/db.js';

const MenuItem = {
  create: async ({ restaurant_id, category_id, name, description, price, image }) => {
    const id = generateId();
    await query(
      `INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, restaurant_id, category_id || null, name, description, price, image]
    );
    const result = await query('SELECT * FROM menu_items WHERE id = $1', [id]);
    return result.rows[0];
  },

  findByRestaurant: async (restaurantId) => {
    const result = await query(
      `SELECT mi.*, c.name as category_name 
       FROM menu_items mi 
       LEFT JOIN categories c ON mi.category_id = c.id 
       WHERE mi.restaurant_id = $1 
       ORDER BY c.sort_order ASC, mi.name ASC`,
      [restaurantId]
    );
    return result.rows;
  },

  findAvailableByRestaurant: async (restaurantId) => {
    const result = await query(
      `SELECT mi.*, c.name as category_name 
       FROM menu_items mi 
       LEFT JOIN categories c ON mi.category_id = c.id 
       WHERE mi.restaurant_id = $1 AND mi.is_available = TRUE
       ORDER BY c.sort_order ASC, mi.name ASC`,
      [restaurantId]
    );
    return result.rows;
  },

  findById: async (id) => {
    const result = await query('SELECT * FROM menu_items WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  update: async (id, { category_id, name, description, price, image }) => {
    if (image) {
      await query(
        `UPDATE menu_items SET category_id = $1, name = $2, description = $3, price = $4, image = $5, updated_at = NOW() WHERE id = $6`,
        [category_id || null, name, description, price, image, id]
      );
    } else {
      await query(
        `UPDATE menu_items SET category_id = $1, name = $2, description = $3, price = $4, updated_at = NOW() WHERE id = $5`,
        [category_id || null, name, description, price, id]
      );
    }
    const result = await query('SELECT * FROM menu_items WHERE id = $1', [id]);
    return result.rows[0];
  },

  toggleAvailability: async (id) => {
    await query(
      `UPDATE menu_items SET is_available = NOT is_available, updated_at = NOW() WHERE id = $1`,
      [id]
    );
    const result = await query('SELECT * FROM menu_items WHERE id = $1', [id]);
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await query('SELECT * FROM menu_items WHERE id = $1', [id]);
    const item = result.rows[0];
    await query('DELETE FROM menu_items WHERE id = $1', [id]);
    return item;
  },
};

export default MenuItem;
