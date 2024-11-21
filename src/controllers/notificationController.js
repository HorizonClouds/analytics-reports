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
      next(error);
    }
};

export const createItineraryAnalytic = async (req, res, next) => {
    try {
      // Llamada al servicio para crear un nuevo análisis de itinerario
      const newItineraryAnalytic = await notificacionService.createItineraryAnalytic(req.body);
  
      // Respuesta exitosa con los datos creados y mensaje
      res.sendSuccess(
        removeMongoFields(newItineraryAnalytic), // Limpia los campos internos de Mongo (_id, __v)
        'Itinerary Analytic created successfully',
        201 // Código de estado HTTP para creación exitosa
      );
    } catch (error) {
      next(error);
    }
};
  
export const getItineraryAnalytics = async (req, res, next) => {
    try {
      const filters = req.query; // Filtros opcionales enviados en la solicitud
      const analytics = await notificacionService.getItineraryAnalytics(filters);
      res.sendSuccess(analytics);
    } catch (error) {
      next(error);
    }
};
  
export const updateItineraryAnalytic = async (req, res, next) => {
    try {
      const { id } = req.params; // ID del análisis a actualizar
      const updateData = req.body;
      const updatedAnalytic = await notificacionService.updateItineraryAnalytic(id, updateData);
      res.sendSuccess(updatedAnalytic);
    } catch (error) {
      next(error);
    }
};
  
export const deleteItineraryAnalytic = async (req, res, next) => {
    try {
      const { id } = req.params;
      await notificacionService.deleteItineraryAnalytic(id);
      res.sendSuccess({ message: 'Itinerary analytic deleted successfully' });
    } catch (error) {
      next(error);
    }
};