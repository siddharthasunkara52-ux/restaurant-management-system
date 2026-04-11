const authMiddleware = (req, res, next) => {
  if (req.session && req.session.restaurant) {
    return next();
  }
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/auth/login');
};

export default authMiddleware;
