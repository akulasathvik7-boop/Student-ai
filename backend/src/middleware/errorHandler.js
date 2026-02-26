function errorHandler(err, req, res, next) {
  // Only log detailed errors in development or if it's a 500 error
  if (process.env.NODE_ENV !== "production" || !err.status || err.status >= 500) {
    console.error(`[Error Handler] ${req.method} ${req.url}`, err);
  }

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;

  // Format consistent error message object
  const errorResponse = {
    success: false,
    error: {
      message: err.message || "Something went wrong. Please try again later.",
      ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {})
    }
  };

  res.status(status).json(errorResponse);
}

module.exports = { errorHandler };

