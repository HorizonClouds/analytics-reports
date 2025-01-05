import express from 'express';
import * as analyticController from '../controllers/analyticController.js';
import { validateId, validateAnalyticBody, handleValidationErrors, validateFilters } from '../middlewares/analyticValidator.js';

const router = express.Router();

// Define routes
router.get('/v1/analytics/:id', validateId, handleValidationErrors, analyticController.getAnalyticById);
router.get('/v1/analytics', analyticController.getAllAnalytics);
router.post('/v1/analytics', validateAnalyticBody, handleValidationErrors, analyticController.createAnalytic);
router.get('/v1/analytics/user/:userId', validateFilters, handleValidationErrors, analyticController.getAnalyticByUserId);

router.put('/v1/analytics/:id', validateId, validateAnalyticBody, handleValidationErrors, analyticController.updateAnalytic);
router.delete('/v1/analytics/:id', validateId, handleValidationErrors, analyticController.deleteAnalytic);
router.post('/v1/analytics/saveAnalytic/:id?', validateAnalyticBody, handleValidationErrors, analyticController.saveAnalytic);

export default router;