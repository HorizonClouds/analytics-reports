import {sendNotificationToKafka } from './notificationProducer.js';

const exampleNotification = {
    userId: '67791bdabbb0918e45fe1cc9',  // ID de un usuario existente (debería ser un ObjectId de MongoDB)
    config: {
      email: true, // Si deseas enviar notificaciones por correo
    },
    userEmail: "ismaelmesazyout@gmail.com",
    message: "Tienes una nueva tarea pendiente.",
    userName: "Ismael",
    type: 'report',  // Tipo de notificación
    resourceId: '60d4fe2b5e8e0c2c887c9351',  // ID del recurso relacionado (por ejemplo, el ID de un reporte)
    notificationStatus: 'NOT SEEN',  // Estado de la notificación
  };
  
sendNotificationToKafka(exampleNotification);
