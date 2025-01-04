import Models from '../models/reportModel.js'; // Importa el objeto de modelos
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';
import mongoose from 'mongoose'; // Necesario para manejar validaciones de Mongoose

export const getReportById = async (id) => {
  try {
    const report = await Models.Report.findById(id);
    if (!report) {
      throw new NotFoundError('Report not found');
    }
    return report;
  } catch (error) {
    throw new NotFoundError('Error fetching report by ID', error);
  }
};

export const getReportByUserId = async (userId) => {
  try {
    const reportByUser = await Models.Report.find({ userId }); // Busca por userId
    if (!reportByUser) {
      throw new NotFoundError('Report not found for the specified userId');
    }
    return reportByUser;
  } catch (error) {
    throw new NotFoundError('Error fetching report by userId', error);
  }
};

export const createReport = async (reportData) => {
  try {
    const newReport = new Models.Report(reportData);
    return await newReport.save();
  } catch (error) {
    // Si el error es un error de validación de Mongoose
    if (error instanceof mongoose.Error.ValidationError) {
      console.error('Validation error creating report:', error);
      // Puedes agregar detalles adicionales si es necesario
      throw new BadRequestError('Report validation failed', error);
    }

    // Si el error no es de validación, lanza el error genérico
    console.error('Error creating report:', error);
    throw new BadRequestError('Error creating report', error);
  }
};

export default {
    getReportById,
    createReport,
    getReportByUserId
  };
  