import cron from 'node-cron';
import Models from '../models/analyticModel.js'; // Ajusta la ruta según tu estructura de carpetas

const fetchNewAnalyticData = async (userId) => {
    // Aquí simulamos la obtención de datos de un microservicio
    return {
        userId,  // Aseguramos que se pasa el userId a los nuevos datos
        userItineraryAnalytic: {
            totalCommentsCount: Math.floor(Math.random() * 100), // Ejemplo de total de comentarios
            avgComments: Math.random() * 10, // Promedio de comentarios
            totalReviewsCount: Math.floor(Math.random() * 50), // Total de reseñas
            averageReviewScore: (Math.random() * 5).toFixed(2), // Calificación promedio de las reseñas
            bestItineraryByAvgReviewScore: null, // Puedes buscar un itinerario aquí
        },
        userPublicationAnalytic: {
            totalCommentsCount: Math.floor(Math.random() * 100), // Ejemplo de total de comentarios
            commentsPerPublication: Math.random() * 10, // Promedio de comentarios por publicación
            totalLikesCount: Math.floor(Math.random() * 200), // Total de "likes"
            averageLike: Math.random() * 20, // Promedio de "likes"
            bestPublicationByLikeCount: null, // Puedes buscar una publicación aquí
        },
    };
};

export const updateAnalyticsJob = async (id, userId) => {
    try {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);  // Establecer un día atrás desde hoy

        //const newData = await fetchNewAnalyticData(); lo que deberia ir en verdad
        const newData = await fetchNewAnalyticData(userId);  // Llamamos a la función para obtener los nuevos datos
        // Obtener los nuevos datos de analítica para un `userId` específico
        userId = newData.userId;
        // const userId = newData.userId; lo que deberia ir en verdad

        // Buscar las analíticas de este usuario cuya `analysisDate` sea más antigua que un día
        const analyticsToUpdate = await Models.UserAnalytic.find({
            _id: id, 
            userId,
            analysisDate: { $lt: oneDayAgo }
        });

        if (analyticsToUpdate.length === 0) {
            console.log(`No hay analíticas para actualizar para el usuario ${userId}`);
            // Si no hay una analítica para este usuario, creamos una nueva.
            const newAnalytic = new Models.UserAnalytic({
                userId,
                userItineraryAnalytic: newData.userItineraryAnalytic,
                userPublicationAnalytic: newData.userPublicationAnalytic,
                analysisDate: Date.now(),
            });

            // Guardar la nueva analítica en la base de datos
            await newAnalytic.save();
            console.log(`Nueva analítica creada para el usuario ${userId}`);
            return;
        }

        // Iterar sobre las analíticas encontradas y actualizarlas
        for (const analytic of analyticsToUpdate) {
            // Aquí actualizamos la analítica con los nuevos datos
            analytic.userItineraryAnalytic = newData.userItineraryAnalytic;
            analytic.userPublicationAnalytic = newData.userPublicationAnalytic;
            analytic.analysisDate = Date.now();  // Actualizamos la fecha del análisis

            // Guardamos la analítica actualizada
            await analytic.save();
            console.log(`Analítica actualizada para el usuario ${analytic.userId}`);
        }
    } catch (error) {
        console.error('Error actualizando analíticas:', error);
    }
};

// Configurar la tarea para que se ejecute todos los días a la medianoche
cron.schedule('0 0 * * *', updateAnalyticsJob);

export default updateAnalyticsJob;
