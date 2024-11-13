import express from 'express';
import { getAllNotifications, createNotification } from '../controllers/notificationController.js';

const router = express.Router();

// Define routes
router.get('/', getAllNotifications);
router.post('/', createNotification); // Nueva ruta POST para crear notificaciones

export default router;