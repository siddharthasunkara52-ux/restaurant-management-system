const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(statusCode).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message,
    });
  }

  res.status(statusCode).render('error', {
    title: 'Error',
    statusCode,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message,
    restaurant: req.session?.restaurant || null,
  });
};

const notFound = (req, res) => {
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(404).json({ success: false, error: 'Route not found' });
  }
  res.status(404).render('error', {
    title: '404 Not Found',
    statusCode: 404,
    message: 'The page you are looking for does not exist.',
    restaurant: req.session?.restaurant || null,
  });
};

export { errorHandler, notFound };
