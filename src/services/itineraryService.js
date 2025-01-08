import axios from 'axios';
import { getServiceUrl } from '../utils/infraestructure.js';
import logger from '../utils/logger.js';
import jwt from 'jsonwebtoken';
import config from '../utils/config.js';

export const itineraryService = {
    fetchItinerariesByUser: async (userId) => {
        try {
            const itinerariesServiceUrl = await getServiceUrl('itineraries');
            console.log("PRUEBA itinerariesServiceUrl", itinerariesServiceUrl);
            if (!itinerariesServiceUrl) {
                logger.error('Cannot retrieve forecast data: Itineraries service URL not found.');
                return null;
            }
            console.log();
            const token = jwt.sign({ serviceId: 'analytics-reports-service', message: "Hello From analytics reports Service" }, config.jwtSecret, {});
            // Obtener los itinerarios desde el microservicio
            const response = await axios.get(`${itinerariesServiceUrl}/api/v1/itineraries`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });   
            console.log(response.data);         
            // Filtrar los itinerarios que coinciden con el userId
            const itineraries = response.data;
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
