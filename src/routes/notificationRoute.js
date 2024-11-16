import express from 'express';
import * as notificationController from '../controllers/notificationController.js';


const router = express.Router();

// Define routes
router.get('/v1/notifications', notificationController.getAllNotifications);
router.post('/v1/notifications', notificationController.createItineraryAnalytic); // Nueva ruta POST para crear análisis de itinerarios
router.get('/v1/notifications', notificationController.getItineraryAnalytics); // Nueva ruta GET para obtener análisis de itinerarios
router.put('/v1/notifications', notificationController.updateItineraryAnalytic); // Nueva ruta PUT para actualizar análisis de itinerarios
router.delete('/v1/notifications', notificationController.deleteItineraryAnalytic); // Nueva ruta DELETE para eliminar análisis de itinerarios
export default router;