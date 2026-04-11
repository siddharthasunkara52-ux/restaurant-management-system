import Restaurant from '../models/Restaurant.js';

const authController = {
  showLogin: (req, res) => {
    res.render('auth/login', {
      title: 'Login',
      error: null,
      restaurant: null,
    });
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const restaurant = await Restaurant.findByEmail(email);

      if (!restaurant) {
        return res.render('auth/login', {
          title: 'Login',
          error: 'Invalid email or password',
          restaurant: null,
        });
      }

      const isValid = await Restaurant.comparePassword(password, restaurant.password);
      if (!isValid) {
        return res.render('auth/login', {
          title: 'Login',
          error: 'Invalid email or password',
          restaurant: null,
        });
      }

      req.session.restaurant = {
        id: restaurant.id,
        name: restaurant.name,
        email: restaurant.email,
        logo: restaurant.logo,
      };

      const returnTo = req.session.returnTo || '/admin/dashboard';
      delete req.session.returnTo;
      res.redirect(returnTo);
    } catch (err) {
      console.error('Login error:', err);
      res.render('auth/login', {
        title: 'Login',
        error: 'Something went wrong. Please try again.',
        restaurant: null,
      });
    }
  },

  showRegister: (req, res) => {
    res.render('auth/register', {
      title: 'Register',
      error: null,
      restaurant: null,
    });
  },

  register: async (req, res) => {
    try {
      const { name, email, password, confirmPassword, phone, address } = req.body;

      if (password !== confirmPassword) {
        return res.render('auth/register', {
          title: 'Register',
          error: 'Passwords do not match',
          restaurant: null,
        });
      }

      if (password.length < 6) {
        return res.render('auth/register', {
          title: 'Register',
          error: 'Password must be at least 6 characters',
          restaurant: null,
        });
      }

      const existing = await Restaurant.findByEmail(email);
      if (existing) {
        return res.render('auth/register', {
          title: 'Register',
          error: 'Email already registered',
          restaurant: null,
        });
      }

      const restaurant = await Restaurant.create({ name, email, password, phone, address });

      req.session.restaurant = {
        id: restaurant.id,
        name: restaurant.name,
        email: restaurant.email,
        logo: restaurant.logo,
      };

      res.redirect('/admin/dashboard');
    } catch (err) {
      console.error('Register error:', err);
      res.render('auth/register', {
        title: 'Register',
        error: 'Something went wrong. Please try again.',
        restaurant: null,
      });
    }
  },

  logout: (req, res) => {
    req.session.destroy(() => {
      res.redirect('/auth/login');
    });
  },
};

export default authController;
