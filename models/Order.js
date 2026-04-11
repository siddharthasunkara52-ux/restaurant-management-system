import {
  generateId,
  pool,
  query,
} from '../config/db.js';

const Order = {
  create: async ({ restaurant_id, table_id, customer_name, notes }) => {
    const id = generateId();
    await query(
      `INSERT INTO orders (id, restaurant_id, table_id, customer_name, notes) VALUES ($1, $2, $3, $4, $5)`,
      [id, restaurant_id, table_id, customer_name, notes]
    );
    const result = await query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0];
  },

  addItems: async (orderId, items) => {
    // Use a transaction for inserting multiple items
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const item of items) {
        const id = generateId();
        await client.query(
          `INSERT INTO order_items (id, order_id, menu_item_id, quantity, price, special_instructions) VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, orderId, item.menu_item_id, item.quantity, item.price, item.special_instructions || null]
        );
      }

      // Update total price
      const totalResult = await client.query(
        'SELECT COALESCE(SUM(price * quantity), 0) as total FROM order_items WHERE order_id = $1',
        [orderId]
      );

      await client.query(
        `UPDATE orders SET total_price = $1, updated_at = NOW() WHERE id = $2`,
        [totalResult.rows[0].total, orderId]
      );

      await client.query('COMMIT');

      const orderItems = await query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
      const order = await query('SELECT * FROM orders WHERE id = $1', [orderId]);

      return { items: orderItems.rows, order: order.rows[0] };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  findByRestaurant: async (restaurantId, { status } = {}) => {
    let sql = `SELECT o.*, t.table_number FROM orders o
               JOIN tables t ON o.table_id = t.id
               WHERE o.restaurant_id = $1`;
    const params = [restaurantId];

    if (status) {
      sql += ` AND o.status = $2`;
      params.push(status);
    }

    sql += ` ORDER BY o.created_at DESC`;

    const ordersResult = await query(sql, params);
    const orders = ordersResult.rows;

    // Attach items to each order
    for (const order of orders) {
      const itemsResult = await query(
        `SELECT oi.*, mi.name as item_name FROM order_items oi
         JOIN menu_items mi ON oi.menu_item_id = mi.id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      order.items = itemsResult.rows;
    }

    return orders;
  },

  findActiveByRestaurant: async (restaurantId) => {
    const ordersResult = await query(
      `SELECT o.*, t.table_number FROM orders o
       JOIN tables t ON o.table_id = t.id
       WHERE o.restaurant_id = $1 AND o.status NOT IN ('served', 'cancelled')
       ORDER BY 
         CASE o.status 
           WHEN 'pending' THEN 1 
           WHEN 'confirmed' THEN 2 
           WHEN 'preparing' THEN 3 
           WHEN 'ready' THEN 4 
         END,
         o.created_at ASC`,
      [restaurantId]
    );
    const orders = ordersResult.rows;

    // Attach items to each order
    for (const order of orders) {
      const itemsResult = await query(
        `SELECT oi.*, mi.name as item_name FROM order_items oi
         JOIN menu_items mi ON oi.menu_item_id = mi.id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      order.items = itemsResult.rows;
    }

    return orders;
  },

  findById: async (id) => {
    const orderResult = await query(
      `SELECT o.*, t.table_number, r.name as restaurant_name
       FROM orders o
       JOIN tables t ON o.table_id = t.id
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) return null;

    const order = orderResult.rows[0];
    const itemsResult = await query(
      `SELECT oi.*, mi.name as item_name FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE oi.order_id = $1`,
      [id]
    );

    return { ...order, items: itemsResult.rows };
  },

  updateStatus: async (id, status) => {
    await query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, id]
    );
    const result = await query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0];
  },

  updatePaymentStatus: async (id, paymentStatus, razorpayPaymentId) => {
    await query(
      `UPDATE orders SET payment_status = $1, razorpay_payment_id = $2, updated_at = NOW() WHERE id = $3`,
      [paymentStatus, razorpayPaymentId, id]
    );
    const result = await query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0];
  },

  setRazorpayOrderId: async (id, razorpayOrderId) => {
    await query(
      `UPDATE orders SET razorpay_order_id = $1, updated_at = NOW() WHERE id = $2`,
      [razorpayOrderId, id]
    );
    const result = await query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0];
  },

  getRecentByRestaurant: async (restaurantId, limit = 10) => {
    const result = await query(
      `SELECT o.*, t.table_number FROM orders o
       JOIN tables t ON o.table_id = t.id
       WHERE o.restaurant_id = $1
       ORDER BY o.created_at DESC LIMIT $2`,
      [restaurantId, limit]
    );
    return result.rows;
  },
};

export default Order;
