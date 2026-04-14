import { query, generateId } from '../config/db.js';

const Table = {
  create: async ({ id, restaurant_id, table_number, capacity, qr_code_url }) => {
    const tableId = id || generateId();
    await query(
      `INSERT INTO tables (id, restaurant_id, table_number, capacity, qr_code_url) VALUES ($1, $2, $3, $4, $5)`,
      [tableId, restaurant_id, table_number, capacity || 4, qr_code_url || null]
    );
    const result = await query('SELECT * FROM tables WHERE id = $1', [tableId]);
    return result.rows[0];
  },

  findByRestaurant: async (restaurantId) => {
    const result = await query(
      'SELECT * FROM tables WHERE restaurant_id = $1 ORDER BY table_number ASC',
      [restaurantId]
    );
    return result.rows;
  },

  findById: async (id) => {
    const result = await query('SELECT * FROM tables WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  toggleActive: async (id) => {
    await query(
      'UPDATE tables SET is_active = NOT is_active WHERE id = $1',
      [id]
    );
    const result = await query('SELECT * FROM tables WHERE id = $1', [id]);
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await query('SELECT * FROM tables WHERE id = $1', [id]);
    const table = result.rows[0];
    await query('DELETE FROM tables WHERE id = $1', [id]);
    return table;
  },

  count: async (restaurantId) => {
    const result = await query(
      'SELECT COUNT(*) as count FROM tables WHERE restaurant_id = $1',
      [restaurantId]
    );
    return parseInt(result.rows[0].count);
  },
};

export default Table;
