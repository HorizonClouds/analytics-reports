// server.js

import express from 'express'; // Import Express framework
import mongoose from 'mongoose'; // Import Mongoose for MongoDB
import { swaggerSetup } from './swagger.js'; // Import Swagger setup
import apiRouter from './routes/exampleRoute.js'; // Import API routes
import dotenv from 'dotenv'; // Import dotenv for environment variables
import standardizedResponse from './middlewares/standardResponse.js'; // Import custom response middleware
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config(); // Load environment variables

const app = express(); // Create an Express application
const port = process.env.BACKEND_PORT || 3000; // Define port

// Middlewares
app.use(express.json()); // Parse JSON bodies
app.use(standardizedResponse); // Use custom response middleware

// Routes
app.use('/api', apiRouter); // Use API routes

app.get('/', (req, res) => {
  // Redirect to API documentation
  res.redirect('/api-docs');
});

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

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(
    `API documentation is available at http://localhost:${port}/api-docs`
  );
});

export default app; // Export the Express application
