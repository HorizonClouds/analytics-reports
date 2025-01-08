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

// Validator for creating or updating analytics
export const validateAnalyticBody = (req, res, next) => {
  Promise.all([
    body('userId')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('userId must be a non-empty string')
      .run(req),
    body('userItineraryAnalytic.totalCommentsCount')
      .isInt({ min: 0 })
      .withMessage('Total comments count must be a non-negative integer')
      .run(req),
    body('userItineraryAnalytic.avgComments')
      .isFloat({ min: 0 })
      .withMessage('Average comments must be a non-negative number')
      .run(req),
    body('userItineraryAnalytic.totalReviewsCount')
      .isInt({ min: 0 })
      .withMessage('Total reviews count must be a non-negative integer')
      .run(req),
    body('userItineraryAnalytic.averageReviewScore')
      .isFloat({ min: 0, max: 10 })
      .withMessage('Average review score must be between 0 and 10')
      .run(req),
    body('userItineraryAnalytic.bestItineraryByAvgReviewScore')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Best itinerary by average review score must be a non-empty string')
      .run(req),
    body('userPublicationAnalytic.totalCommentsCount')
      .isInt({ min: 0 })
      .withMessage('Total comments count must be a non-negative integer')
      .run(req),
    body('userPublicationAnalytic.commentsPerPublication')
      .isFloat({ min: 0 })
      .withMessage('Comments per publication must be a non-negative number')
      .run(req),
    body('userPublicationAnalytic.totalLikesCount')
      .isInt({ min: 0 })
      .withMessage('Total likes count must be a non-negative integer')
      .run(req),
    body('userPublicationAnalytic.averageLike')
      .isFloat({ min: 0 })
      .withMessage('Average like must be a non-negative number')
      .run(req),
  ])
    .then(() => next())
    .catch((err) => next(err));
};

// Validator for query filters
export const validateFilters = (req, res, next) => {
  param('userId')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('userId must be a non-empty string')
    .run(req)
    .then(() => next())
    .catch((err) => next(err));
};

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};