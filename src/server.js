// server.js
import express from 'express'; // Import Express framework
import { swaggerSetup } from './swagger.js'; // Import Swagger setup
import dotenv from 'dotenv'; // Import dotenv for environment variables
import standardResponseMiddleware from './middlewares/standardResponseMiddleware.js'; // Import custom response middleware
import { MongoMemoryServer } from 'mongodb-memory-server';
import './models/analyticModel.js'; // Importa notificationModels.js para registrar modelos
import analyticRoute from './routes/analyticRoute.js';  // Asegúrate de que esté correctamente importado
import './models/reportModel.js'; // Importa notificationModels.js para registrar modelos
import reportRoute from './routes/reportRoute.js';  // Asegúrate de que esté correctamente importado
import errorHandler from './middlewares/errorHandler.js';
import { BadJsonError } from './utils/customErrors.js';
import connectDB from './db/connection.js';
import cors from 'cors'; // Import CORS middleware
import logger from './utils/logger.js';
import './cron/cron.js'; // Importa tu cron job
import { updateAnalyticsJob } from './cron/cron.js'; // Asegúrate de importar la función correctamente

dotenv.config(); // Load environment variables

const app = express(); // Create an Express application
const port = process.env.BACKEND_PORT || 6301; // Define port

// Middlewares
app.use(express.json()); // Parse JSON bodies
app.use(cors());
app.use(standardResponseMiddleware); 

// Middleware to handle JSON parsing errors
app.use((err, req, res, next) => {
  if (err) next(new BadJsonError('Invalid JSON', err.message));
  next();
});

// Routes
app.use('/api', analyticRoute);
app.use('/api', reportRoute);

//PRUEBA CRON
app.post('/api/updateAnalytics', async (req, res) => {
  try {
    //SIMULACION DE LO QUE NOS LLEGA DE OTROS MICROSERVICIOS
    const { userId, id} = req.body;  // Obtener el userId del cuerpo de la solicitud

    if (!userId) {
      return res.status(400).json({ message: 'Se requiere un userId' });
    }

    // Llamamos a la función de actualización de analíticas, pasando el userId
    await updateAnalyticsJob(id, userId);
    res.status(200).json({ message: 'Análisis actualizado con éxito' });
  } catch (error) {
    console.error('Error actualizando las analíticas', error);
    res.status(500).json({ message: 'Error al actualizar las analíticas', error: error.message });
  }
});

app.get('/', (req, res) => {
  // Redirect to API documentation
  res.redirect('/api-docs');
});

app.use(errorHandler);
// Swagger configuration
swaggerSetup(app);

// Connect to MongoDB
let mongoURI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/microservice';
if (process.env.NODE_ENV === 'test') {
  const mongod = new MongoMemoryServer(); // Fake MongoDB for testing
  await mongod.start();
  mongoURI = mongod.getUri();
  console.log(mongoURI);
}

connectDB()
  .then(() => {
    app.listen(port, () => {
      logger.info(`Server is running on http://localhost:${port}`);
      logger.info(`API documentation is available at http://localhost:${port}/api-docs`);
      logger.debug('Debugging information');
      logger.info('Service has started successfully reports');
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

export default app; // Export the Express application
