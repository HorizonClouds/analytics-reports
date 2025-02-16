import reportService from '../services/reportService.js';
import { NotFoundError, ValidationError } from '../utils/customErrors.js';
import { sendNotificationToKafka } from '../utils/notificationProducer.js';

const removeMongoFields = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => {
      const { __v, ...rest } = item.toObject();
      return rest;
    });
  } else {
    const { __v, ...rest } = data.toObject();
    return rest;
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await reportService.getReportById(id);
    if (!report) throw new NotFoundError('Report not found');
    res.sendSuccess(removeMongoFields(report));
  } catch (error) {
    next(error);
  }
};

export const createReport = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    // Validar que notificationData tenga el campo "type"
    if (req.body && req.body.type === 'itinerary') {
      
      const transformedNotification = {
        userId: req.body.userId, // ID del usuario
        config: {
          email: true, // Asumiendo que siempre se enviará por email
        },
        type: req.body.type, // Tipo de notificación
        resourceId: req.body.resourceId, // ID del itinerario o publicación relacionado
        notificationStatus: 'NOT SEEN',  // Estado de la notificación (puedes ajustarlo según tus necesidades)
      };
      // Lógica para enviar la notificación a Kafka
      await sendNotificationToKafka(transformedNotification);
      res.sendSuccess(
        { message: 'Notification sent to Kafka successfully' },
        'Report processing completed successfully',
        200
      );
      const newReport = await reportService.createReport(req.body);
      res.sendSuccess(
        removeMongoFields(newReport),
        'Report created successfully',
        201
      );
      return newReport;
    }
  } catch (error) {
    next(error);
  }
};

export const getReportByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const reportByUser = await reportService.getReportByUserId(userId);
    res.sendSuccess(reportByUser);
  } catch (error) {
    next(error);
  }
};

export const updateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedReport = await reportService.updateReport(id, updateData);
    res.sendSuccess(removeMongoFields(updatedReport));
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    await reportService.deleteReport(id);
    res.sendSuccess({ message: 'Report deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllReports = async (req, res, next) => {
  try {
    const reports = await reportService.getAllReports();
    res.sendSuccess(removeMongoFields(reports));
  } catch (error) {
    next(error);
  }
};