import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Validator to ensure a valid MongoDB ID
export const validateId = (req, res, next) => {
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid ID format')
    .run(req) // Ejecuta la validación sobre la solicitud
    .then(() => next()) // Si pasa la validación, continúa al siguiente middleware
    .catch((err) => next(err)); // Si hay un error, lo pasamos al middleware de error
};

// Validator for creating or updating analytics
export const validateAnalyticBody = (req, res, next) => {
  Promise.all([
    body('userId').custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid userId format').run(req),
    body('userItineraryAnalytic.totalCommentsCount').isInt({ min: 0 }).withMessage('Total comments count must be a non-negative integer').run(req),
    body('userItineraryAnalytic.avgComments').isFloat({ min: 0 }).withMessage('Average comments must be a non-negative number').run(req),
    body('userItineraryAnalytic.totalReviewsCount').isInt({ min: 0 }).withMessage('Total reviews count must be a non-negative integer').run(req),
    body('userItineraryAnalytic.averageReviewScore').isFloat({ min: 0, max: 10 }).withMessage('Average review score must be between 0 and 10').run(req),
    body('userItineraryAnalytic.bestItineraryByAvgReviewScore').optional().isString().withMessage('Best itinerary by average review score must be a string').run(req),
    body('userPublicationAnalytic.totalCommentsCount').isInt({ min: 0 }).withMessage('Total comments count must be a non-negative integer').run(req),
    body('userPublicationAnalytic.commentsPerPublication').isFloat({ min: 0 }).withMessage('Comments per publication must be a non-negative number').run(req),
    body('userPublicationAnalytic.totalLikesCount').isInt({ min: 0 }).withMessage('Total likes count must be a non-negative integer').run(req),
    body('userPublicationAnalytic.averageLike').isFloat({ min: 0 }).withMessage('Average like must be a non-negative number').run(req),
  ])
    .then(() => next()) // Si todas las validaciones pasaron, continúa con el siguiente middleware
    .catch((err) => next(err)); // Si hubo un error, lo pasamos al middleware de error
};

// Validator for query filters
export const validateFilters = (req, res, next) => {
  param('userId') // Usamos 'param' para validación de parámetros en la URL
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid userId format')
    .run(req) // Ejecuta la validación sobre la solicitud
    .then(() => next()) // Si pasa la validación, continúa al siguiente middleware
    .catch((err) => next(err)); // Si hay un error, lo pasamos al middleware de error
};

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

