import Restaurant from '../models/Restaurant.js';
import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import Table from '../models/Table.js';
import Order from '../models/Order.js';

const customerController = {
  showMenu: async (req, res, next) => {
    try {
      const { restaurantId, tableId } = req.params;

      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return res.status(404).render('error', {
          title: 'Not Found',
          statusCode: 404,
          message: 'Restaurant not found',
          restaurant: null,
        });
      }

      const table = await Table.findById(tableId);
      if (!table || table.restaurant_id !== restaurantId) {
        return res.status(404).render('error', {
          title: 'Not Found',
          statusCode: 404,
          message: 'Table not found',
          restaurant: null,
        });
      }

      if (!table.is_active) {
        return res.status(400).render('error', {
          title: 'Table Inactive',
          statusCode: 400,
          message: 'This table is currently not active. Please ask the staff.',
          restaurant: null,
        });
      }

      const menuItems = await MenuItem.findAvailableByRestaurant(restaurantId);
      const categories = await Category.findByRestaurant(restaurantId);

      // Group menu items by category
      const menuByCategory = {};
      const uncategorized = [];

      for (const item of menuItems) {
        if (item.category_name) {
          if (!menuByCategory[item.category_name]) {
            menuByCategory[item.category_name] = [];
          }
          menuByCategory[item.category_name].push(item);
        } else {
          uncategorized.push(item);
        }
      }

      if (uncategorized.length > 0) {
        menuByCategory['Other'] = uncategorized;
      }

      res.render('customer/menu', {
        title: `${restaurant.name} - Menu`,
        restaurantData: restaurant,
        table,
        categories,
        menuByCategory,
        restaurantId,
        tableId,
        restaurant: null,
      });
    } catch (err) {
      next(err);
    }
  },

  placeOrder: async (req, res, next) => {
    try {
      const { restaurantId, tableId } = req.params;
      const { customer_name, notes, items } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ success: false, error: 'No items in order' });
      }

      // Validate items and get prices
      const orderItems = [];
      for (const item of items) {
        const menuItem = await MenuItem.findById(item.menu_item_id);
        if (!menuItem || !menuItem.is_available) {
          return res.status(400).json({
            success: false,
            error: `Item "${item.name || 'Unknown'}" is not available`,
          });
        }
        orderItems.push({
          menu_item_id: menuItem.id,
          quantity: parseInt(item.quantity),
          price: parseFloat(menuItem.price),
          special_instructions: item.special_instructions || null,
        });
      }

      const order = await Order.create({
        restaurant_id: restaurantId,
        table_id: tableId,
        customer_name: customer_name || 'Guest',
        notes,
      });

      const result = await Order.addItems(order.id, orderItems);

      res.json({
        success: true,
        order: result.order,
        redirectUrl: `/order/${order.id}/status`,
      });
    } catch (err) {
      next(err);
    }
  },

  orderStatus: async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).render('error', {
          title: 'Not Found',
          statusCode: 404,
          message: 'Order not found',
          restaurant: null,
        });
      }

      res.render('customer/orderStatus', {
        title: `Order #${order.id.substring(0, 8)}`,
        order,
        restaurant: null,
      });
    } catch (err) {
      next(err);
    }
  },

  orderStatusApi: async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      res.json({
        success: true,
        status: order.status,
        payment_status: order.payment_status,
        total_price: order.total_price,
        items: order.items,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default customerController;
