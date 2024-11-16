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
      // Manejo de errores de validación
      if (error.name === 'ValidationError') {
        res.sendError(new ValidationError('Validation failed', error.errors));
      } else {
        // Manejo de otros errores generales
        res.sendError(
          new ValidationError(
            'An error occurred while creating the itinerary analytic',
            [{ msg: error.message }]
          )
        );
      }
    }
};
  
export const getItineraryAnalytics = async (req, res, next) => {
    try {
      const filters = req.query; // Filtros opcionales enviados en la solicitud
      const analytics = await notificacionService.getItineraryAnalytics(filters);
      res.sendSuccess(analytics);
    } catch (error) {
      res.sendError(error);
    }
};
  
export const updateItineraryAnalytic = async (req, res, next) => {
    try {
      const { id } = req.params; // ID del análisis a actualizar
      const updateData = req.body;
      const updatedAnalytic = await notificacionService.updateItineraryAnalytic(id, updateData);
      res.sendSuccess(updatedAnalytic);
    } catch (error) {
      res.sendError(error);
    }
};
  
export const deleteItineraryAnalytic = async (req, res, next) => {
    try {
      const { id } = req.params; // ID del análisis a eliminar
      await notificacionService.deleteItineraryAnalytic(id);
      res.sendSuccess({ message: 'Itinerary analytic deleted successfully' });
    } catch (error) {
      res.sendError(error);
    }
};