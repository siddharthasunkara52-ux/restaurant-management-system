import { query, generateId } from '../config/db.js';

const Category = {
  create: async ({ restaurant_id, name, sort_order }) => {
    const id = generateId();
    await query(
      `INSERT INTO categories (id, restaurant_id, name, sort_order) VALUES ($1, $2, $3, $4)`,
      [id, restaurant_id, name, sort_order || 0]
    );
    const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0];
  },

  findByRestaurant: async (restaurantId) => {
    const result = await query(
      'SELECT * FROM categories WHERE restaurant_id = $1 ORDER BY sort_order ASC, name ASC',
      [restaurantId]
    );
    return result.rows;
  },

  findById: async (id) => {
    const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  update: async (id, { name, sort_order }) => {
    await query(
      'UPDATE categories SET name = $1, sort_order = $2 WHERE id = $3',
      [name, sort_order, id]
    );
    const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
    const cat = result.rows[0];
    await query('DELETE FROM categories WHERE id = $1', [id]);
    return cat;
  },
};

export default Category;
