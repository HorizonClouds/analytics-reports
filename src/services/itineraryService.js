import axios from 'axios';
import { getServiceUrl } from '../utils/infrastructure.js';
import logger from '../utils/logger.js';

export const itineraryService = {
    fetchItinerariesByUser: async (userId) => {
        try {
            const itinerariesServiceUrl = await getServiceUrl('itineraries');
            if (!itinerariesServiceUrl) {
                logger.error('Cannot retrieve forecast data: Itineraries service URL not found.');
                return null;
            }

            // Obtener los itinerarios desde el microservicio
            const response = await axios.get(`${itinerariesServiceUrl}/api/v1/itineraries`);
            // Filtrar los itinerarios que coinciden con el userId
            const itineraries = response.data.data;
            // Si no se encuentran itinerarios, podemos devolver null o un mensaje apropiado
            if (itineraries.length === 0) {
                logger.warn(`No itineraries found for userId: ${userId}`);
                return null;
            }

            return itineraries; // Devuelve los itinerarios filtrados
        } catch (error) {
            logger.error('Error fetching itineraries from microservice:', error);
            throw new Error('Error fetching itineraries from microservice');
        }
    },
};
