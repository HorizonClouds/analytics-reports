import Models from '../models/analyticModel.js'; // Importa el objeto de modelos
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';
import dotenv from 'dotenv'; // Import dotenv for environment variables
dotenv.config(); // Load environment variables
import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { itineraryService } from '../services/itineraryService.js';

const calculateAverageScoreForItinerary = (itinerary, userId) => {
  const userReviews = itinerary.reviews.filter(review => review.userId.toString() === userId.toString());

  if (userReviews.length === 0) return 0; // Sin reseñas, la puntuación promedio es 0

  const totalScore = userReviews.reduce((sum, review) => sum + review.score, 0);
  return totalScore / userReviews.length;
};

const getBestItinerary = (itineraries, userId) => {
  console.log('Getting best itinerary for userId:', userId);

  // Verificar que tenemos datos válidos
  if (!itineraries?.data || !Array.isArray(itineraries.data)) {
    console.error('No valid itineraries data:', itineraries);
    return null;
  }

  // Función helper para calcular el score promedio de un itinerario
  const calculateAverageScoreForItinerary = (itinerary, userId) => {
    if (!itinerary.reviews || !Array.isArray(itinerary.reviews)) {
      console.log('No reviews found for itinerary:', itinerary._id);
      return 0;
    }

    const userReviews = itinerary.reviews.filter(review => {
      if (!review || !review.userId) return false;
      return review.userId === userId;
    });

    console.log('User reviews for itinerary', itinerary._id, ':', userReviews.length);

    if (userReviews.length === 0) return 0;

    const totalScore = userReviews.reduce((sum, review) => {
      const score = Number(review.score) || 0;
      console.log('Adding score:', score);
      return sum + score;
    }, 0);

    const averageScore = totalScore / userReviews.length;
    console.log('Average score for itinerary', itinerary._id, ':', averageScore);

    return averageScore;
  };

  // Calcular la puntuación promedio para cada itinerario
  const itinerariesWithScores = itineraries.data.map(itinerary => {
    const averageScore = calculateAverageScoreForItinerary(itinerary, userId);
    console.log('Calculated score for itinerary:', {
      itineraryId: itinerary._id,
      averageScore
    });

    return {
      itinerary,
      averageScore: averageScore || 0 // Asignar 0 si no hay puntuación válida
    };
  });

  console.log('All itineraries with scores:', 
    itinerariesWithScores.map(({ itinerary, averageScore }) => ({
      id: itinerary._id,
      score: averageScore
    }))
  );

  // Ordenar los itinerarios por la puntuación promedio en orden descendente
  const sortedItineraries = itinerariesWithScores.sort((a, b) => b.averageScore - a.averageScore);

  console.log('Sorted itineraries:', 
    sortedItineraries.map(({ itinerary, averageScore }) => ({
      id: itinerary._id,
      score: averageScore
    }))
  );

  // El primer itinerario es el mejor (con la mayor puntuación promedio)
  const bestItinerary = sortedItineraries[0]?.itinerary || null;

  console.log('Best itinerary found:', bestItinerary ? {
    id: bestItinerary._id,
    score: sortedItineraries[0].averageScore
  } : 'No valid itinerary found');

  return bestItinerary;
};

const calculateAverageReviewScore = (itineraries, userId) => {
  let totalScore = 0;
  let totalReviews = 0;

  // Verificar que tenemos datos válidos
  if (!itineraries?.data || !Array.isArray(itineraries.data)) {
    console.error('No valid itineraries data:', itineraries);
    return 0;
  }

  console.log('Calculating average review score for userId:', userId);

  // Recorremos todos los itinerarios
  itineraries.data.forEach(itinerary => {
    // Verificar que tenemos un array de reviews
    const reviews = Array.isArray(itinerary.reviews) ? itinerary.reviews : [];
    
    console.log('Processing itinerary:', itinerary._id);
    console.log('Reviews available:', reviews.length);

    // Filtramos las reseñas de este itinerario por el userId
    const userReviews = reviews.filter(review => {
      if (!review || !review.userId) return false;

      console.log('Comparing review:', {
        reviewUserId: review.userId,
        userId: userId,
        score: review.score,
        isMatch: review.userId === userId
      });

      return review.userId === userId;
    });

    console.log('User reviews found:', userReviews.length);

    // Sumamos las puntuaciones de las reseñas del usuario
    userReviews.forEach(review => {
      const score = Number(review.score) || 0;
      console.log('Adding score:', score);
      totalScore += score;
      totalReviews += 1;
    });
  });

  // Calculamos el promedio de la puntuación de las reseñas
  const averageReviewScore = totalReviews > 0 ? totalScore / totalReviews : 0;

  console.log('Final calculation:', {
    totalScore,
    totalReviews,
    averageReviewScore
  });

  return averageReviewScore;
};
const countCommentsAndReviews = (itineraries, userId) => {
  let totalCommentsCount = 0;
  let totalReviewsCount = 0;
  console.log(itineraries);
  // Recorremos todos los itinerarios del usuario
// Primero verificamos que tenemos los datos
if (!itineraries?.data || !Array.isArray(itineraries.data)) {
  console.error('No valid itineraries data:', itineraries);
  return { totalCommentsCount: 0, totalReviewsCount: 0 };
}

// Iteramos sobre itineraries.data
itineraries.data.forEach((itinerary) => {
  // Verificamos que tenemos acceso a los arrays
  const comments = Array.isArray(itinerary.comments) ? itinerary.comments : [];
  const reviews = Array.isArray(itinerary.reviews) ? itinerary.reviews : [];

  console.log('Processing itinerary:', itinerary._id);
  console.log('Full comments:', comments);
  console.log('Full reviews:', reviews);
  console.log('Looking for userId:', userId);

  // Para comentarios
  const userComments = comments.filter(comment => {
    if (!comment || !comment.userId) return false;
    
    console.log('Comparing comment:', {
      commentUserId: comment.userId,
      userId: userId,
      isMatch: comment.userId === userId
    });
    
    return comment.userId === userId;
  });

  // Para reviews
  const userReviews = reviews.filter(review => {
    if (!review || !review.userId) return false;
    
    console.log('Comparing review:', {
      reviewUserId: review.userId,
      userId: userId,
      isMatch: review.userId === userId
    });
    
    return review.userId === userId;
  });

  // Actualizamos los contadores
  totalCommentsCount += userComments.length;
  totalReviewsCount += userReviews.length;

  // Log de resultados por itinerario
  console.log('Results for itinerary', itinerary._id, {
    commentsFound: userComments.length,
    reviewsFound: userReviews.length,
    userComments,
    userReviews
  });
});

console.log('Final counts:', {
  totalCommentsCount,
  totalReviewsCount
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
    const itineraries = await itineraryService.fetchItinerariesByUser(userId);
    console.log("olaaaaaaaaaaaaaaaaaa", itineraries);
    if (!itineraries || itineraries.length === 0) {
      throw new NotFoundError('No itineraries found');
    }

    const { totalCommentsCount, totalReviewsCount } = countCommentsAndReviews(itineraries, userId);

    const avgComments = Math.floor(totalCommentsCount / itineraries.data.length);
    console.log(avgComments);

    // Calcular averageReviewScore
    const averageReviewScore = calculateAverageReviewScore(itineraries, userId);
    console.log("Average Review Score:", averageReviewScore);

    const bestItinerary = getBestItinerary(itineraries, userId);
    
    const analyticData = {
      userId,
      userItineraryAnalytic: {
        totalCommentsCount,
        avgComments,
        totalReviewsCount,
        averageReviewScore,
        bestItineraryByAvgReviewScore: bestItinerary?._id || null,
      },
    };
    console.log("Analytic Data:", analyticData);

    const analyticByUser = await Models.UserAnalytic.findOne({ userId });

    if (!analyticByUser) {
      return await createAnalytic(analyticData);
    } else {
      return await updateAnalytic(analyticByUser._id, analyticData);
    }
  } catch (error) {
    console.error("Error in createAnalyticByUserId:", error);
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError('Error fetching or updating analytic by userId', error);
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

