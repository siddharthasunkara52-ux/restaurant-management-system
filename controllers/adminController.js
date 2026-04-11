import Restaurant from '../models/Restaurant.js';
import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import Table from '../models/Table.js';
import Order from '../models/Order.js';

const adminController = {
  // ── Dashboard ──
  dashboard: async (req, res, next) => {
    try {
      const restaurantId = req.session.restaurant.id;
      const stats = await Restaurant.getStats(restaurantId);
      const recentOrders = await Order.getRecentByRestaurant(restaurantId, 10);

      res.render('admin/dashboard', {
        title: 'Dashboard',
        restaurant: req.session.restaurant,
        stats,
        recentOrders,
      });
    } catch (err) {
      next(err);
    }
  },

  // ── Menu Management ──
  menuList: async (req, res, next) => {
    try {
      const restaurantId = req.session.restaurant.id;
      const menuItems = await MenuItem.findByRestaurant(restaurantId);
      const categories = await Category.findByRestaurant(restaurantId);

      res.render('admin/menu', {
        title: 'Menu Management',
        restaurant: req.session.restaurant,
        menuItems,
        categories,
        success: req.query.success || null,
        error: req.query.error || null,
      });
    } catch (err) {
      next(err);
    }
  },

  menuCreate: async (req, res, next) => {
    try {
      const restaurantId = req.session.restaurant.id;
      const { category_id, name, description, price } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : null;

      await MenuItem.create({
        restaurant_id: restaurantId,
        category_id: category_id || null,
        name,
        description,
        price: parseFloat(price),
        image,
      });

      res.redirect('/admin/menu?success=Item added successfully');
    } catch (err) {
      next(err);
    }
  },

  menuUpdate: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { category_id, name, description, price } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : null;

      await MenuItem.update(id, {
        category_id: category_id || null,
        name,
        description,
        price: parseFloat(price),
        image,
      });

      res.redirect('/admin/menu?success=Item updated successfully');
    } catch (err) {
      next(err);
    }
  },

  menuToggle: async (req, res, next) => {
    try {
      await MenuItem.toggleAvailability(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  menuDelete: async (req, res, next) => {
    try {
      await MenuItem.delete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  // ── Category Management ──
  categoryList: async (req, res, next) => {
    try {
      const restaurantId = req.session.restaurant.id;
      const categories = await Category.findByRestaurant(restaurantId);

      res.render('admin/categories', {
        title: 'Categories',
        restaurant: req.session.restaurant,
        categories,
        success: req.query.success || null,
        error: req.query.error || null,
      });
    } catch (err) {
      next(err);
    }
  },

  categoryCreate: async (req, res, next) => {
    try {
      const restaurantId = req.session.restaurant.id;
      const { name, sort_order } = req.body;

      await Category.create({
        restaurant_id: restaurantId,
        name,
        sort_order: parseInt(sort_order) || 0,
      });

      res.redirect('/admin/categories?success=Category created');
    } catch (err) {
      next(err);
    }
  },

  categoryUpdate: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, sort_order } = req.body;
      await Category.update(id, { name, sort_order: parseInt(sort_order) || 0 });
      res.redirect('/admin/categories?success=Category updated');
    } catch (err) {
      next(err);
    }
  },

  categoryDelete: async (req, res, next) => {
    try {
      await Category.delete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  // ── Table Management ──
  tableList: async (req, res, next) => {
    try {
      const restaurantId = req.session.restaurant.id;
      const tables = await Table.findByRestaurant(restaurantId);
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

      res.render('admin/tables', {
        title: 'Table Management',
        restaurant: req.session.restaurant,
        tables,
        baseUrl,
        success: req.query.success || null,
        error: req.query.error || null,
      });
    } catch (err) {
      next(err);
    }
  },

  tableCreate: async (req, res, next) => {
    try {
      const restaurantId = req.session.restaurant.id;
      const { table_number, capacity } = req.body;

      await Table.create({
        restaurant_id: restaurantId,
        table_number: parseInt(table_number),
        capacity: parseInt(capacity) || 4,
      });

      res.redirect('/admin/tables?success=Table created');
    } catch (err) {
      if (err.code === '23505') {
        res.redirect('/admin/tables?error=Table number already exists');
      } else {
        next(err);
      }
    }
  },

  tableToggle: async (req, res, next) => {
    try {
      await Table.toggleActive(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  tableDelete: async (req, res, next) => {
    try {
      await Table.delete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  // ── Order Management ──
  orderList: async (req, res, next) => {
    try {
      const restaurantId = req.session.restaurant.id;
      const { status } = req.query;
      const orders = await Order.findByRestaurant(restaurantId, { status });

      res.render('admin/orders', {
        title: 'Orders',
        restaurant: req.session.restaurant,
        orders,
        currentStatus: status || 'all',
        success: req.query.success || null,
      });
    } catch (err) {
      next(err);
    }
  },

  orderUpdateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await Order.updateStatus(id, status);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
};

export default adminController;
