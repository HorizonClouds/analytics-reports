import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  getReportById,
  getReportByUserId,
  createReport,
  updateReport,
  deleteReport,
  getAllReports
} from '../services/reportService.js';
import Models from '../models/reportModel.js';
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';

const exampleReport = {
  userId: new mongoose.Types.ObjectId(), // ID del usuario que reporta
  type: 'publication',                  // Tipo de recurso reportado
  resourceId: new mongoose.Types.ObjectId(), // ID de la publicación asociada
  reason: 'Test reason'                 // Razón del reporte
};

const anotherReport = {
  userId: new mongoose.Types.ObjectId(), // ID de otro usuario que reporta
  type: 'itinerary',                    // Tipo de recurso reportado
  resourceId: new mongoose.Types.ObjectId(), // ID del itinerario asociado
  reason: 'Another test reason'         // Razón alternativa del reporte
};


describe('[Integration][Service] Report Tests', () => {
  let reportId;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const report = await createReport(exampleReport);
    reportId = report._id.toString();
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  it('[+] should CREATE a report', async () => {
    const result = await createReport(anotherReport);
    expect(result.userId.toString()).toBe(anotherReport.userId.toString());
    expect(result.type).toBe(anotherReport.type);
    expect(result.reason).toBe(anotherReport.reason);

    const dbReport = await Models.Report.findById(result._id);
    expect(dbReport).not.toBeNull();
    expect(dbReport.userId.toString()).toBe(anotherReport.userId.toString());
    expect(dbReport.type).toBe(anotherReport.type);
    expect(dbReport.reason).toBe(anotherReport.reason);
  });

  it('[+] should GET a report by ID', async () => {
    const result = await getReportById(reportId);
    expect(result).not.toBeNull();
    expect(result._id.toString()).toBe(reportId);
    expect(result.userId.toString()).toBe(exampleReport.userId.toString());
    expect(result.type).toBe(exampleReport.type);
    expect(result.reason).toBe(exampleReport.reason);
  });

  it('[-] should return NOT FOUND for non-existent report ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    await expect(getReportById(nonExistentId)).rejects.toThrow(NotFoundError);
  });

  it('[+] should GET reports by userId', async () => {
    const result = await getReportByUserId(exampleReport.userId.toString());
    expect(result).not.toBeNull();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].userId.toString()).toBe(exampleReport.userId.toString());
    expect(result[0].type).toBe(exampleReport.type);
    expect(result[0].reason).toBe(exampleReport.reason);
  });

  it('[-] should return NOT FOUND for reports by non-existent userId', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId().toString();
    await expect(getReportByUserId(nonExistentUserId)).rejects.toThrow(NotFoundError);
  });

  it('[+] should UPDATE a report', async () => {
    const updateData = { reason: 'Updated reason' };
    const result = await updateReport(reportId, updateData);
    expect(result.reason).toBe(updateData.reason);

    const dbReport = await Models.Report.findById(reportId);
    expect(dbReport.reason).toBe(updateData.reason);
  });

  it('[-] should return NOT FOUND when updating non-existent report', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const updateData = { reason: 'Updated reason' };
    await expect(updateReport(nonExistentId, updateData)).rejects.toThrow(NotFoundError);
  });

  it('[+] should DELETE a report', async () => {
    const result = await deleteReport(reportId);
    expect(result._id.toString()).toBe(reportId);

    const dbReport = await Models.Report.findById(reportId);
    expect(dbReport).toBeNull();
  });

  it('[-] should return NOT FOUND when deleting non-existent report', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    await expect(deleteReport(nonExistentId)).rejects.toThrow(NotFoundError);
  });

  it('[+] should GET all reports', async () => {
    const result = await getAllReports();
    expect(result).not.toBeNull();
    expect(result.length).toBeGreaterThan(0);
  });

  it('[+] should handle creation errors gracefully', async () => {
    const invalidReport = {
      userId: new mongoose.Types.ObjectId(),
      type: 'invalid_type', // Tipo no permitido
      reason: '' // Razón vacía
    };
    await expect(createReport(invalidReport)).rejects.toThrow();
  });

});
