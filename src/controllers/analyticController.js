import analyticService from '../services/analyticService.js';
import { NotFoundError, ValidationError } from '../utils/customErrors.js';
import mongoose from 'mongoose';

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
export const getAnalyticById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const analytic = await analyticService.getAnalyticById(id);
    if (!analytic) throw new NotFoundError('Analytic not found');
    res.sendSuccess(removeMongoFields(analytic));
  } catch (error) {
    next(error);
  }
};
export const createAnalytic = async (req, res, next) => {
  try {
    // Llamada al servicio para crear un nuevo análisis de itinerario
    const newAnalytic = await analyticService.createAnalytic(req.body);

    // Respuesta exitosa con los datos creados y mensaje
    res.sendSuccess(
      removeMongoFields(newAnalytic), // Limpia los campos internos de Mongo (_id, __v)
      'Analytic created successfully',
      201 // Código de estado HTTP para creación exitosa
    );
  } catch (error) {
    next(error);
  }
};

export const saveAnalytic = async (req, res, next) => {
  try {
    const { id } = req.params;  // Obtenemos el `id` de la URL
    const analyticData = req.body;  // Los datos de la analítica provienen del cuerpo de la solicitud

    // Si no pasamos el `id` (es decir, id está indefinido), se creará una nueva analítica
    let analytic;

    if (id) {
      // Si hay un `id` en la URL, intentamos actualizar la analítica existente
      analytic = await analyticService.saveAnalytic(id, analyticData);  // Llamamos al servicio para actualizar
    } else {
      // Si no hay `id`, creamos una nueva analítica
      analytic = await analyticService.saveAnalytic(null, analyticData);  // Llamamos al servicio para crear
    }

    return res.status(200).json({
      message: 'Analytic saved or updated successfully',
      data: analytic,  // Devolvemos la analítica creada o actualizada
    });
  } catch (error) {
    console.error('Error in saveAnalyticController:', error);
    return res.status(500).json({
      message: 'Error saving or updating analytic',
      error: error.message,
    });
  }
};


export const getAnalyticByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params; // Extrae userId de los parámetros de la solicitud
    const analyticByUser = await analyticService.getAnalyticByUserId(userId); // Llama al servicio para buscar la analítica
    res.sendSuccess(analyticByUser); // Devuelve la analítica encontrada
  } catch (error) {
    next(error);
  }
};

export const getAllAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticService.getAllAnalytics();
    res.sendSuccess(removeMongoFields(analytics));
  } catch (error) {
    next(error);
  }
};

export const getItineraryAnalytics = async (req, res, next) => {
  try {
    const filters = req.query; // Filtros opcionales enviados en la solicitud
    const analytics = await analyticService.getItineraryAnalytics(filters);
    res.sendSuccess(analytics);
  } catch (error) {
    next(error);
  }
};

export const getOrCreateAnalytic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const analyticData = req.body;

    // Llama al servicio para buscar o crear el análisis
    const analytic = await analyticService.getOrCreateAnalyticById(id, analyticData);
    res.status(200).json({
      message: 'Analytic fetched or created successfully',
      data: analytic,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error fetching or creating analytic',
      error: error.message,
    });
  }
};

export const updateAnalytic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedAnalytic = await analyticService.updateAnalytic(id, updateData);
    res.sendSuccess(removeMongoFields(updatedAnalytic));
  } catch (error) {
    next(error);
  };

}
export const deleteAnalytic = async (req, res, next) => {
  try {
    const { id } = req.params;
    await analyticService.deleteAnalytic(id);
    res.sendSuccess({ message: 'Analytic deleted successfully' });
  } catch (error) {
    next(error);
  }
}
