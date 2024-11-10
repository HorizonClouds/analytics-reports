// Base class for custom application errors
class AppError extends Error {
  constructor(
    message,
    statusCode = 500,
    details = null,
    appCode = 'UNKNOWN_ERROR'
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.appCode = appCode; // Add unique application error code for categorization

    // Preserve the stack trace for easier debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Common error examples
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details, appCode = 'NOT_FOUND') {
    super(message, 404, details, appCode);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details, appCode = 'BAD_REQUEST') {
    super(message, 400, details, appCode);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid data', details, appCode = 'VALIDATION_ERROR') {
    // Attach detailed information about validation errors
    super(message, 400, details, appCode);
  }
}

export default AppError;
