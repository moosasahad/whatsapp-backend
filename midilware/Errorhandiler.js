// / custom-errors.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = ${statusCode}.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

// error-middleware.js
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production: don't leak error details
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // Programming or unknown errors
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }
};

// Example usage in your Express app:
const express = require('express');
const app = express();

// Route example
app.get('/api/items/:id', async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      throw new NotFoundError('Item not found');
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// Authentication middleware example
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Please log in to access this resource');
    }
    // Verify token logic here
    next();
  } catch (err) {
    next(err);
  }
};

// Validation example
app.post('/api/items', async (req, res, next) => {
  try {
    if (!req.body.name) {
      throw new ValidationError('Name is required');
    }
    // Create item logic here
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// Global error handling middleware (should be last)
app.use(errorHandler);

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  errorHandler
};