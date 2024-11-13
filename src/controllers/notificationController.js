import notificacionService from '../services/notificationService.js';
import { NotFoundError, ValidationError } from '../utils/customErrors.js';

const removeMongoFields = (data) => {
    if (Array.isArray(data)) {
        return data.map((item) => {
            const { __v, ...rest } = item.toObject();
            return rest;
        });
    } else {
        const { __v, ...rest } = data.toObject();
        return rest;
    }
};

export const getAllNotifications = async (req, res, next) => {
    try {
        const notifications = await notificacionService.getAllNotifications();
        res.sendSuccess(removeMongoFields(notifications));
    } catch (error) {
        res.sendError(error);
    }
};

export const createNotification = async (req, res, next) => {
    try {
        const notificationData = req.body; // Datos enviados en la solicitud POST
        const newNotification = await notificacionService.createNotification(notificationData);
        res.sendSuccess(newNotification);
    } catch (error) {
        res.sendError(error);
    }
};