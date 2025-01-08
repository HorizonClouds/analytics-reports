import { body, param, query, validationResult } from 'express-validator';

// Validator to ensure a valid string ID
export const validateId = (req, res, next) => {
  param('id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('ID must be a non-empty string')
    .run(req)
    .then(() => next())
    .catch((err) => next(err));
};

// Validator for creating a report
export const validateReportBody = (req, res, next) => {
  Promise.all([
    body('userId')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('userId must be a non-empty string')
      .run(req),

    body('type')
      .isIn(['publication', 'itinerary'])
      .withMessage('Type must be either "publication" or "itinerary"')
      .run(req),

    body('reason')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Reason must be a non-empty string')
      .run(req),

    // Opcional: validar description si lo tienes
    body('description')
      .optional()
      .isString()
      .trim()
      .withMessage('Description must be a string')
      .run(req),

    // Opcional: validar resourceId si lo tienes
    body('resourceId')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('ResourceId must be a non-empty string')
      .run(req)
  ])
    .then(() => next())
    .catch((err) => next(err));
};

// Validator for query filters
export const validateFilters = (req, res, next) => {
  Promise.all([
    param('userId')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('userId must be a non-empty string')
      .run(req),
    
    // Opcional: otros filtros que puedas necesitar
    query('type')
      .optional()
      .isIn(['publication', 'itinerary'])
      .withMessage('Type filter must be either "publication" or "itinerary"')
      .run(req),
    
    query('status')
      .optional()
      .isIn(['pending', 'resolved', 'rejected'])
      .withMessage('Status filter must be either "pending", "resolved", or "rejected"')
      .run(req)
  ])
    .then(() => next())
    .catch((err) => next(err));
};

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};