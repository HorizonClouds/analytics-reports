import express from 'express';
import * as reportController from '../controllers/reportController.js';
import { validateId, validateReportBody, handleValidationErrors, validateFilters } from '../middlewares/reportValidator.js';
import { checkAuth, checkPlan, checkRole, checkAddon } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas para obtener reportes
router.get('/v1/reports', reportController.getAllReports);
router.get('/v1/reports/:id', validateId, handleValidationErrors, reportController.getReportById);
router.get('/v1/reports/user/:userId', validateFilters, handleValidationErrors, reportController.getReportByUserId);

// Rutas para crear, actualizar y eliminar reportes
router.post('/v1/reports', checkAuth(), validateReportBody, handleValidationErrors, reportController.createReport);
router.put('/v1/reports/:id', validateId, validateReportBody, handleValidationErrors, reportController.updateReport);
router.delete('/v1/reports/:id', validateId, handleValidationErrors, reportController.deleteReport);

export default router;