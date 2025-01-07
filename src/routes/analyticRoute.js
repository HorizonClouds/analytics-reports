import express from 'express';
import * as analyticController from '../controllers/analyticController.js';
import { validateId, validateAnalyticBody, handleValidationErrors, validateFilters } from '../middlewares/analyticValidator.js';
import { checkAuth, checkPlan, checkRole, checkAddon } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Define routes
router.get('/v1/analytics/:id', validateId, handleValidationErrors, analyticController.getAnalyticById);
router.get('/v1/analytics', analyticController.getAllAnalytics);

//le meto el checkAuth como validador e inyecta el req.user.userId

router.post('/v1/analytics', checkAuth(), validateAnalyticBody, handleValidationErrors, analyticController.createAnalytic);

//le meto el checkAuth como validador e inyecta el req.user.userId
router.post('/v1/analytics/user/:userId?', checkAuth(), validateFilters, handleValidationErrors, analyticController.createAnalyticByUserId);

router.get('/v1/analytics/user/:userId', checkAuth(), validateFilters, handleValidationErrors, analyticController.getAnalyticByUserId);

router.put('/v1/analytics/:id', checkAuth(), validateId, validateAnalyticBody, handleValidationErrors, analyticController.updateAnalytic);
router.delete('/v1/analytics/:id', checkAuth(), validateId, handleValidationErrors, analyticController.deleteAnalytic);
router.post('/v1/analytics/saveAnalytic/:id?', validateAnalyticBody, handleValidationErrors, analyticController.saveAnalytic);

export default router;