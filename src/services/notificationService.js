import Models from '../models/notificationModel.js'; // Importa el objeto de modelos
import {NotFoundError, BadRequestError } from '../utils/customErrors.js';

//Obtener todas las notificaciones
export const getAllNotifications = async () => {
    try {
        return await Models.ItineraryAnalytic.find({});
    } catch (error) {
        throw new BadRequestError('Error fetching notifications', error);
    }
};

//Crear un análisis de itinerarios
export const createItineraryAnalytic = async (analyticData) => {
    try {
      const newAnalytic = new Models.ItineraryAnalytic(analyticData);
      return await newAnalytic.save();
    } catch (error) {
      console.error('Error creating itinerary analytic:', error);
      throw new BadRequestError('Error creating itinerary analytic', error);
    }
};

// Leer análisis de itinerarios (con filtros opcionales)
export const getItineraryAnalytics = async (filters = {}) => {
    try {
      return await Models.ItineraryAnalytic.find(filters);
    } catch (error) {
      console.error('Error fetching itinerary analytics:', error);
      throw new BadRequestError('Error fetching itinerary analytics', error);
    }
};
  
  // Actualizar un análisis de itinerarios por ID
  export const updateItineraryAnalytic = async (id, updateData) => {
    try {
      return await Models.ItineraryAnalytic.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      console.error('Error updating itinerary analytic:', error);
      throw new BadRequestError('Error updating itinerary analytic', error);
    }
};
  
  // Eliminar un análisis de itinerarios por ID
  export const deleteItineraryAnalytic = async (id) => {
    try {
      return await Models.ItineraryAnalytic.findByIdAndDelete(id);
    } catch (error) {
      console.error('Error deleting itinerary analytic:', error);
      throw new BadRequestError('Error deleting itinerary analytic', error);
    }
};


export default { 
    getAllNotifications, 
    createItineraryAnalytic, 
    getItineraryAnalytics, 
    updateItineraryAnalytic, 
    deleteItineraryAnalytic
};

