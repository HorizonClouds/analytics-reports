import Models from '../models/reportModel.js';
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';
import logger from '../utils/logger.js';

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

export const updateReport = async (id, reportData) => {
  try {
    const updatedReport = await Models.Report.findByIdAndUpdate(id, reportData, { new: true });
    if (!updatedReport) {
      throw new NotFoundError('Report not found');
    }
    return updatedReport;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError('Error updating report', error);
  }
};

export const deleteReport = async (id) => {
  try {
    const deletedReport = await Models.Report.findByIdAndDelete(id);
    if (!deletedReport) {
      throw new NotFoundError('Report not found');
    }
    return deletedReport;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError('Error deleting report', error);
  }
};

export const getAllReports = async () => {
  try {
    return await Models.Report.find();
  } catch (error) {
    throw new BadRequestError('Error fetching all reports', error);
  }
};

export default {
  getReportById,
  getReportByUserId,
  createReport,
  updateReport,
  deleteReport,
  getAllReports
};
