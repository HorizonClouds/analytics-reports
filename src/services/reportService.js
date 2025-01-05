import Models from '../models/reportModel.js';
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';

export const getReportById = async (id) => {
  try {
    const report = await Models.Report.findById(id);
    if (!report) {
      throw new NotFoundError('Report not found');
    }
    return report;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError('Error fetching report by ID', error);
  }
};

export const getReportByUserId = async (userId) => {
  try {
    const reports = await Models.Report.find({ userId });
    if (reports.length === 0) {
      throw new NotFoundError('No reports found for the specified userId');
    }
    return reports;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError('Error fetching reports by userId', error);
  }
};

export const createReport = async (reportData) => {
    try {
      const newReport = new Models.Report(reportData);
      return await newReport.save();
    } catch (error) {
      throw new BadRequestError('Error creating report', error);
    }
  };

export default {
    getReportById,
    createReport,
    getReportByUserId
  };
