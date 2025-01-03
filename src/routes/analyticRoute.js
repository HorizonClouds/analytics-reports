import express from 'express';
import * as analyticController from '../controllers/analyticController.js';


const router = express.Router();

// Define routes
router.get('/v1/analytics/:id', analyticController.getAnalyticById);
router.get('/v1/analytics', analyticController.getAllAnalytics);
router.post('/v1/analytics', analyticController.createAnalytic); // Nueva ruta POST para crear análisis de itinerarios
router.get('/v1/analytics/user/:userId', analyticController.getAnalyticByUserId);
router.post('/v1/analytics/:id', analyticController.getOrCreateAnalytic);

router.put('/v1/analytics/:id', analyticController.updateAnalytic);
router.delete('/v1/analytics/:id', analyticController.deleteAnalytic);

export default router;