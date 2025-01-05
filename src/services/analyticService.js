import Models from '../models/analyticModel.js'; // Importa el objeto de modelos
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';
import dotenv from 'dotenv'; // Import dotenv for environment variables
dotenv.config(); // Load environment variables
import mongoose from 'mongoose';


export const getAnalyticById = async (id) => {
  try {
    const analytic = await Models.UserAnalytic.findById(id);
    if (!analytic) {
      throw new NotFoundError('Analytic not found');
    }
    return analytic;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError('Error fetching analytic by ID', error);
  }
};


export const getAnalyticByUserId = async (userId) => {
  try {
    const analyticByUser = await Models.UserAnalytic.find({ userId }); // Busca por userId
    if (analyticByUser.length === 0) {
      throw new NotFoundError('Analytic not found for the specified userId');
    }
    return analyticByUser;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError('Error fetching analytic by userId', error);
  }
};


//Obtener todas las notificaciones
export const getAllAnalytics = async () => {
  try {
    return await Models.UserAnalytic.find({});
  } catch (error) {
    throw new BadRequestError('Error fetching analytics', error);
  }
};

// Leer análisis de itinerarios (con filtros opcionales)
export const getItineraryAnalytics = async (filters = {}) => {
  try {
    const { numberOfItineraryComments, commentsPerItinerary, numberOfItineraryRatings } = filters;
    return await Models.ItineraryAnalytic.find({ numberOfItineraryComments, commentsPerItinerary }, { numberOfItineraryRatings: 0, commentsPerItinerary: 0 }); //{numberOfItineraryRatings:1, commentsPerItinerary:1}
  } catch (error) {
    console.error('Error fetching itinerary analytics:', error);
    throw new BadRequestError('Error fetching itinerary analytics', error);
  }
};

export const getOrCreateAnalyticById = async (id, analyticData) => {
  try {
    console.log('ID recibido:', id); // Imprime el id recibido para depuración

    // Verifica si el id es un ObjectId válido
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      // Si el id no es válido, genera uno nuevo
      console.log('ID no válido o no proporcionado, generando uno nuevo');
      id = new mongoose.Types.ObjectId();
    }

    // Busca el análisis en la base de datos por id
    let analytic = await Models.UserAnalytic.findById(id);

    // Si ya existe, lo retornamos
    if (analytic) {
      return analytic;
    }

    // Si no existe, creamos un nuevo análisis
    const newAnalytic = new Models.UserAnalytic({
      _id: id, // Usa el ID proporcionado o generado para el nuevo análisis
      ...analyticData, // Usa los datos adicionales que se pasan
    });

    // Guarda el nuevo análisis en la base de datos
    analytic = await newAnalytic.save();
    return analytic;
  } catch (error) {
    console.error('Error in getOrCreateAnalyticById:', error);
    if (error.name === 'ValidationError') {
      throw new BadRequestError('Validation error creating analytic', error);
    }
    throw new BadRequestError('Error fetching or creating analytic', error);
  }
};

// Crear una nueva analítica
export const createAnalytic = async (analyticData) => {
  try {
    const newAnalytic = new Models.UserAnalytic(analyticData);
    return await newAnalytic.save();
  } catch (error) {
    console.error('Error creating analytic:', error);
    throw new BadRequestError('Error creating analytic', error);
  }
};

// Guardar o actualizar analítica
export const saveAnalytic = async (id, analyticData) => {
  try {
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      // Si el `id` es válido, intentamos buscar la analítica existente
      const existingAnalytic = await Models.UserAnalytic.findById(id);

      if (existingAnalytic) {
        // Comprobar si ha pasado más de un día desde la última actualización
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        if (existingAnalytic.analysisDate < oneDayAgo) {
        
          return await updateAnalytic(id, analyticData);
        } else {
          console.log('No se actualizó la analítica porque no ha pasado suficiente tiempo');
          return existingAnalytic;
        }
      } else {
        throw new Error(`Analytic with id ${id} not found`);
      }
    } else {
      // Si no hay un `id` válido, creamos una nueva analítica
      const newAnalytic = await createAnalytic(analyticData);
      console.log('Nueva analítica creada');
      return newAnalytic;
    }
  } catch (error) {
    console.error('Error saving or updating analytic:', error);
    throw error; // Lanza el error para ser manejado por el controlador
  }
};


export const updateAnalytic = async (id, updateData) => {
  try {

    const analytic = await Models.UserAnalytic.findByIdAndUpdate(id, updateData, { new: true });

    if (!analytic) {
      throw new NotFoundError('Analytic not found');
    }
    return analytic;
  } catch (error) {

    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError('Error updating analytic', error);
  }
};


export const deleteAnalytic = async (id) => {
  try {
    const analytic = await Models.UserAnalytic.findByIdAndDelete(id);
    if (!analytic) {
      throw new NotFoundError('Analytic not found');
    }
    return analytic;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError('Error deleting analytic', error);
  }
};

export default {
  getAnalyticById,
  getAllAnalytics,
  createAnalytic,
  getAnalyticByUserId,
  getItineraryAnalytics,
  getOrCreateAnalyticById,
  updateAnalytic,
  deleteAnalytic,
  saveAnalytic
};

