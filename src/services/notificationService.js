import Models from '../models/notificationModel.js'; // Importa el objeto de modelos
import {BadRequestError } from '../utils/customErrors.js';

export const getAllNotifications = async () => {
    try {
        return await Models.ItineraryAnalytic.find({});
    } catch (error) {
        throw new BadRequestError('Error fetching notifications', error);
    }
};

export const createNotification = async (notificationData) => {
    try {
        const newNotification = new Models.ItineraryAnalytic(notificationData); 
        return await newNotification.save();
    } catch (error) {
      console.error('Error creating notification:', error);  // Agregar logs para depuración
      throw new BadRequestError('Error creating notification', error);  // Pasar el error al controlador
    }
  };
export default { getAllNotifications, createNotification };

