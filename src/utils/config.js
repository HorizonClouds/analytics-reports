import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  kafkaBroker: process.env.KAFKA_BROKER || 'localhost:9092',
  kafkaTopic: process.env.KAFKA_TOPIC || 'logs',
  logFilePath: process.env.LOG_FILE_PATH || 'src/logs/logfile.log',
  dbUri: process.env.MONGO_URI || 'mongodb://localhost:27017/analytics-reports',
  jwtSecret: process.env.JWT_SECRET || 'horizon-secret',
  jwtServiceName: process.env.JWT_SERVICE_NAME || 'notifications-service',
  kafkaServiceName: process.env.KAFKA_SERVICE_NAME || 'NOTIFICATIONS',
  kafkaEnabled: process.env.KAFKA_ENABLED === 'true',
  logLevel: process.env.LOGLEVEL || 'INFO',
  gatewayUrl: process.env.GATEWAY_URL || 'http://localhost:6900',
};

export default config; 