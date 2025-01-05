import { describe, it, expect, vi, afterEach } from 'vitest';
import Models from '../models/reportModel.js';
import {
  getReportById,
  getReportByUserId,
  createReport,
} from '../services/reportService.js';
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';

// Mock de los modelos
vi.mock('../models/reportModel.js');

describe('[Component] Report Service', () => {
  const mockReport = {
    _id: '63e2d6c1f1eabc1234567890',
    userId: '63e2d6c1f1eabc1234567891',
    type: 'publication',
    reason: 'Test reason',
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('[+] should return a report for a valid ID', async () => {
    Models.Report.findById.mockResolvedValue(mockReport);

    const result = await getReportById('63e2d6c1f1eabc1234567890');
    expect(result).toEqual(mockReport);
    expect(Models.Report.findById).toHaveBeenCalledWith('63e2d6c1f1eabc1234567890');
  });

  it('[-] should throw NotFoundError for an invalid ID', async () => {
    Models.Report.findById.mockResolvedValue(null);

    await expect(getReportById('invalidId')).rejects.toThrow(NotFoundError);
    expect(Models.Report.findById).toHaveBeenCalledWith('invalidId');
  });

  it('[+] should return reports by userId', async () => {
    const mockReports = [mockReport];
    Models.Report.find.mockResolvedValue(mockReports);

    const result = await getReportByUserId('63e2d6c1f1eabc1234567891');
    expect(result).toEqual(mockReports);
    expect(Models.Report.find).toHaveBeenCalledWith({ userId: '63e2d6c1f1eabc1234567891' });
  });

  it('[-] should throw NotFoundError for userId with no reports', async () => {
    Models.Report.find.mockResolvedValue([]);

    await expect(getReportByUserId('nonExistentUserId')).rejects.toThrow('No reports found for the specified userId');
    expect(Models.Report.find).toHaveBeenCalledWith({ userId: 'nonExistentUserId' });
  });

  it('[+] should create a new report', async () => {
    Models.Report.mockImplementation(() => ({
      save: vi.fn().mockResolvedValue(mockReport),
    }));

    const result = await createReport(mockReport);
    expect(result).toEqual(mockReport);
    expect(Models.Report).toHaveBeenCalledWith(mockReport);
  });

});
