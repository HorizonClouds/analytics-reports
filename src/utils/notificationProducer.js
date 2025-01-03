// producer.js

import { Kafka } from 'kafkajs';
import config from './config.js'; // Asegúrate de que la configuración esté correcta

let kafkaIsReady = false;
let retryInterval = 1000;

const kafka = new Kafka({
  clientId: 'report-service',
  brokers: [config.kafkaBroker], // Broker de Kafka
});

const producer = kafka.producer();

const runProducer = async () => {
  try {
    // Conectar al productor
    await producer.connect();
    console.log('Producer connected successfully');
    kafkaIsReady = true;
  } catch (error) {
    console.error('Error connecting producer:', error);
  }
};

runProducer();

const sendNotificationToKafka = async (notificationData, retryCount = 5) => {
  try {

    if (!kafkaIsReady) {
        if (retryCount > 0) {
          retryCount--;  // Decrementamos el contador de reintentos
          console.log(`Producer not ready, retrying in ${retryInterval}ms. Retries left: ${retryCount}`);
          await new Promise(resolve => setTimeout(resolve, retryInterval));  // Esperamos el intervalo de tiempo
          return sendNotificationToKafka(notificationData, retryCount);  // Llamada recursiva con el nuevo retryCount
        } else {
          console.error('Producer not ready, no retries left');
          return;  // Si no hay reintentos restantes, salimos
        }
      }
    // Enviar el mensaje a Kafka
    console.log('Sending message to Kafka...');
    
    await producer.send({
      topic: 'notification',  // Tema de Kafka
      messages: [{ value: JSON.stringify(notificationData) }], // Mensaje de notificación
    });
    
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// Exportamos las funciones necesarias
export {sendNotificationToKafka};
