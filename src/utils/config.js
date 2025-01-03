import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  kafkaBroker: process.env.KAFKA_BROKER || 'localhost:9092',
  kafkaTopic: process.env.KAFKA_TOPIC || 'logs',
  logFilePath: process.env.LOG_FILE_PATH || 'src/logs/logfile.log',
};

export default config; 
