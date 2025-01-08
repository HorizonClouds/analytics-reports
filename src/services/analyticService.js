import Models from '../models/analyticModel.js'; // Importa el objeto de modelos
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';
import dotenv from 'dotenv'; // Import dotenv for environment variables
dotenv.config(); // Load environment variables
import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { itineraryService } from '../services/itineraryService.js';

const calculateAverageScoreForItinerary = (itinerary, userId) => {
  const userReviews = itinerary.reviews?.filter(review => review?.userId?.toString() === userId?.toString()) || [];
  if (!userReviews.length) return 0;
  const totalScore = userReviews.reduce((sum, review) => sum + (Number(review.score) || 0), 0);
  return totalScore / userReviews.length;
};

const getBestItinerary = (itineraries) => {
  if (!Array.isArray(itineraries?.data)) {
    console.error('Invalid itineraries data:', itineraries);
    return null;
  }

  // Calcular la puntuación promedio sin importar el usuario
  const itinerariesWithScores = itineraries.data.map(itinerary => ({
    itinerary,
    averageScore: calculateAverageScoreForItinerary(itinerary),
  }));

  // Ordenar itinerarios por puntuación promedio de mayor a menor
  const sortedItineraries = itinerariesWithScores.sort((a, b) => b.averageScore - a.averageScore);
  return sortedItineraries[0]?.itinerary || null;
};


const calculateAverageReviewScore = (itineraries) => {
  if (!Array.isArray(itineraries?.data)) {
    console.error('Invalid itineraries data:', itineraries);
    return 0;
  }

  let totalScore = 0, totalReviews = 0;

  itineraries.data.forEach(itinerary => {
    // Contar todas las reseñas sin filtrar por usuario
    totalScore += itinerary.reviews?.reduce((sum, review) => sum + (Number(review.score) || 0), 0) || 0;
    totalReviews += itinerary.reviews?.length || 0;
  });

  return totalReviews ? totalScore / totalReviews : 0;
};

const countCommentsAndReviews = (itineraries) => {
  if (!Array.isArray(itineraries?.data)) {
    console.error('Invalid itineraries data:', itineraries);
    return { totalCommentsCount: 0, totalReviewsCount: 0 }; // Garantizar que nunca sea undefined
  }

  let totalCommentsCount = 0, totalReviewsCount = 0;

  itineraries.data.forEach(itinerary => {
    // Contar todos los comentarios sin filtrar por usuario
    totalCommentsCount += itinerary.comments?.length || 0;

    // Contar todas las reseñas sin filtrar por usuario
    totalReviewsCount += itinerary.reviews?.length || 0;
  });

  return { totalCommentsCount, totalReviewsCount };
};


// Crear una analítica
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
    // Fetch itineraries by user
    const itineraries = await itineraryService.fetchItinerariesByUser(userId);
    console.log("Itineraries fetched:", itineraries);

    // Validación: Verificar si itineraries tiene la propiedad `data` y que sea un array
    if (!itineraries?.data || !Array.isArray(itineraries.data)) {
      console.error("Itineraries data is not valid:", itineraries);
      throw new TypeError('Expected itineraries.data to be an array');
    }

    // Filtrar itinerarios específicos del usuario
    const userItineraries = itineraries.data.filter(
      (itinerary) => itinerary.userId === userId // Comparación directa de strings
    );
    console.log("Filtered Itineraries:", userItineraries);

    if (userItineraries.length === 0) {
      throw new NotFoundError('No itineraries found for the specified user');
    }

    // Crear analítica para cada itinerario
    const analyticsResults = await Promise.all(
      userItineraries.map(async (itinerary) => {
        const { totalCommentsCount, totalReviewsCount } = countCommentsAndReviews({ data: [itinerary] });

        // Calcula el promedio de puntuaciones de las reviews
        const averageReviewScore = calculateAverageReviewScore({ data: [itinerary] });
        const avgComments = totalCommentsCount/userItineraries.length;
        // Validar mejor itinerario basado en promedio de puntuaciones
        const bestItineraryByAvgReviewScore = getBestItinerary({ data: [itinerary] });

        const analyticData = {
          userId,
          resourceId: itinerary._id, // `_id` es un string
          userItineraryAnalytic: {
            totalCommentsCount,
            avgComments,
            totalReviewsCount,
            averageReviewScore: isNaN(averageReviewScore) ? 0 : averageReviewScore,
            bestItineraryByAvgReviewScore: bestItineraryByAvgReviewScore || null,
          },
        };

        console.log("Analytic Data for Itinerary:", analyticData);

        // Verifica si ya existe un análisis para este itinerario
        const existingAnalytic = await Models.UserAnalytic.findOne({ resourceId: itinerary._id });

        if (!existingAnalytic) {
          // Crear nuevo análisis si no existe
          return await createAnalytic(analyticData);
        } else {
          // Actualizar análisis existente si ya existe
          return await updateAnalytic(existingAnalytic._id, analyticData);
        }
      })
    );

    return analyticsResults;
  } catch (error) {
    console.error('Error in createAnalyticByUserId:', {
      message: error.message,
      stack: error.stack,
    });
    throw new BadRequestError('Error fetching or updating analytics for user itineraries');
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
    console.log("algo:", userId);
    const analyticByUser = await Models.UserAnalytic.find({ userId }); // Busca por userId
    console.log(analyticByUser);
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

export const getOrCreateAnalyticById = async (id, analyticData) => {
  try {
    logger.info('ID recibido:', id);

    // Verify if id is a non-empty string
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      logger.info('ID no válido o no proporcionado, generando uno nuevo');
      id = Date.now().toString(); // Generate a timestamp-based ID
    }

    // Search for the analysis in the database by id
    let analytic = await Models.UserAnalytic.findById(id);

    // If it exists, return it
    if (analytic) {
      return analytic;
    }

    // If it doesn't exist, create a new analysis
    const newAnalytic = new Models.UserAnalytic({
      _id: id,
      ...analyticData,
    });

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
    if (id && typeof id === 'string' && id.trim().length > 0) {
      // If the id is valid, try to find the existing analytic
      const existingAnalytic = await Models.UserAnalytic.findById(id);

      if (existingAnalytic) {
        // Check if more than one day has passed since the last update
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
      // If there's no valid id, create a new analytic
      const newAnalytic = await createAnalytic(analyticData);
      logger.info('Nueva analítica creada');
      return newAnalytic;
    }
  } catch (error) {
    console.error('Error saving or updating analytic:', error);
    throw error;
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
  getOrCreateAnalyticById,
  getAnalyticByUserId,
  updateAnalytic,
  deleteAnalytic,
  saveAnalytic
};

