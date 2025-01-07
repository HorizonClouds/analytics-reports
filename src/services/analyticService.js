import Models from '../models/analyticModel.js'; // Importa el objeto de modelos
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';
import dotenv from 'dotenv'; // Import dotenv for environment variables
dotenv.config(); // Load environment variables
import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { itineraryService } from '../services/itineraryService.js';


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
// Crear una nueva analítica
export const createAnalytic = async (analyticData) => {
  try {
    //
    const newAnalytic = new Models.UserAnalytic(analyticData);
    logger.info("Creada analitica");
    return await newAnalytic.save();
  } catch (error) {
    console.error('Error creating analytic:', error);
    throw new BadRequestError('Error creating analytic', error);
  }
};
export const createAnalyticByUserId = async (userId) => {
  try {
    // Busca analíticas existentes en la base de datos
    const analyticByUser = await Models.UserAnalytic.findOne({ userId });

    const itineraries = await itineraryService.fetchItinerariesByUser(userId);

    const userItineraries = itineraries.filter(itinerary => itinerary.userId === userId);

    if (!itineraries || itineraries.length === 0) {
      throw new NotFoundError('No itineraries found');
    }

    const { totalCommentsCount, totalReviewsCount } = countCommentsAndReviews(userItineraries, userId);

    const avgComments = totalCommentsCount / itineraries.length;
    const averageReviewScore = calculateAverageReviewScore(userItineraries, userId);
    const bestItinerary = getBestItinerary(userItineraries, userId);

    // Prepara los datos analíticos calculados
    const analyticData = {
      userId,
      userItineraryAnalytic: {
        totalCommentsCount,
        avgComments,
        totalReviewsCount,
        averageReviewScore,
        bestItineraryByAvgReviewScore: bestItinerary?.itineraryId,
      },
    };

    if (!analyticByUser) {
      // Si no existe la analítica, crea una nueva
      const newAnalytic = await createAnalytic(analyticData);
      return newAnalytic;
    } else {
      // Si la analítica ya existe, actualízala
      const updatedAnalytic = await updateAnalytic(analyticByUser._id, analyticData);
      return updatedAnalytic;
    }
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError('Error fetching or updating analytic by userId', error);
  }
};

const calculateAverageScoreForItinerary = (itinerary, userId) => {
  // Filtrar las reseñas de este itinerario para el usuario especificado
  const userReviews = itinerary.reviews.filter(review => review.userId === userId);

  // Si hay reseñas, calcular el promedio de las puntuaciones
  if (userReviews.length > 0) {
    const totalScore = userReviews.reduce((sum, review) => sum + review.score, 0);
    return totalScore / userReviews.length;
  }

  // Si no hay reseñas, retornar 0 como puntuación
  return 0;
};

const getBestItinerary = (itineraries, userId) => {
  // Calcular la puntuación promedio para cada itinerario
  const itinerariesWithScores = itineraries.map(itinerary => ({
    itinerary,
    averageScore: calculateAverageScoreForItinerary(itinerary, userId)
  }));

  // Ordenar los itinerarios por la puntuación promedio en orden descendente
  const sortedItineraries = itinerariesWithScores.sort((a, b) => b.averageScore - a.averageScore);

  // El primer itinerario es el mejor (con la mayor puntuación promedio)
  return sortedItineraries[0]?.itinerary;
};

const calculateAverageReviewScore = (itineraries, userId) => {
  let totalScore = 0;
  let totalReviews = 0;

  // Recorremos todos los itinerarios
  itineraries.forEach(itinerary => {
    // Filtramos las reseñas de este itinerario por el userId
    const userReviews = itinerary.reviews.filter(review => review.userId === userId);

    // Sumamos las puntuaciones de las reseñas del usuario
    userReviews.forEach(review => {
      totalScore += review.score || 0;
      totalReviews += 1; // Contamos cuántas reseñas tiene este usuario
    });
  });

  // Calculamos el promedio de la puntuación de las reseñas
  const averageReviewScore = totalReviews > 0 ? totalScore / totalReviews : 0;

  return averageReviewScore;
};

const countCommentsAndReviews = (itineraries, userId) => {
  let totalCommentsCount = 0;
  let totalReviewsCount = 0;

  // Recorremos todos los itinerarios del usuario
  itineraries.forEach((itinerary) => {
    // Filtrar los comentarios del itinerario por el userId
    const userComments = itinerary.comments.filter(comment => comment.userId === userId);
    totalCommentsCount += userComments.length; // Sumar los comentarios de este itinerario

    // Filtrar las reseñas del itinerario por el userId
    const userReviews = itinerary.reviews.filter(review => review.userId === userId);
    totalReviewsCount += userReviews.length; // Sumar las reseñas de este itinerario
  });

  return { totalCommentsCount, totalReviewsCount };
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
    logger.info('ID recibido:', id); // Imprime el id recibido para depuración

    // Verifica si el id es un ObjectId válido
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      // Si el id no es válido, genera uno nuevo
      logger.info('ID no válido o no proporcionado, generando uno nuevo');
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
          logger.info('No se actualizó la analítica porque no ha pasado suficiente tiempo');
          return existingAnalytic;
        }
      } else {
        throw new Error(`Analytic with id ${id} not found`);
      }
    } else {
      // Si no hay un `id` válido, creamos una nueva analítica
      const newAnalytic = await createAnalytic(analyticData);
      logger.info('Nueva analítica creada');
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
  createAnalyticByUserId,
  getItineraryAnalytics,
  getOrCreateAnalyticById,
  getAnalyticByUserId,
  updateAnalytic,
  deleteAnalytic,
  saveAnalytic
};

