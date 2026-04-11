import Order from '../models/Order.js';

const kitchenController = {
  dashboard: async (req, res, next) => {
    try {
      const restaurantId = req.session.restaurant.id;
      const orders = await Order.findActiveByRestaurant(restaurantId);

      const pending = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
      const preparing = orders.filter(o => o.status === 'preparing');
      const ready = orders.filter(o => o.status === 'ready');

      res.render('kitchen/dashboard', {
        title: 'Kitchen Dashboard',
        restaurant: req.session.restaurant,
        pending,
        preparing,
        ready,
        totalActive: orders.length,
      });
    } catch (err) {
      next(err);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
      }

      const order = await Order.updateStatus(id, status);
      res.json({ success: true, order });
    } catch (err) {
      next(err);
    }
  },

  getActiveOrders: async (req, res, next) => {
    try {
      const restaurantId = req.session.restaurant.id;
      const orders = await Order.findActiveByRestaurant(restaurantId);
      res.json({ success: true, orders });
    } catch (err) {
      next(err);
    }
  },
};

export default kitchenController;
