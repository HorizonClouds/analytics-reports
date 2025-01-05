import { describe, it, expect, vi, afterEach } from 'vitest';
import Models from '../models/analyticModel.js';
import {
  getAnalyticById,
  getAnalyticByUserId,
  createAnalytic,
  updateAnalytic,
  deleteAnalytic,
  getAllAnalytics
} from '../services/analyticService.js';
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';

// Mock de los modelos
vi.mock('../models/analyticModel.js');

describe('[Component] Analytic Service', () => {
  const mockAnalytic = {
    _id: '63e2d6c1f1eabc1234567890',
    userId: '63e2d6c1f1eabc1234567891',
    userItineraryAnalytic: {
      totalCommentsCount: 10,
      avgComments: 2,
      totalReviewsCount: 5,
      averageReviewScore: 4.5,
      bestItineraryByAvgReviewScore: '63e2d6c1f1eabc1234567892'
    },
    userPublicationAnalytic: {
      averageLike: 3.5,
      totalLikesCount: 100,
      commentsPerPublication: 5,
      totalCommentsCount: 50
    }
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('[+] should return an analytic for a valid ID', async () => {
    Models.UserAnalytic.findById.mockResolvedValue(mockAnalytic);

    const result = await getAnalyticById('63e2d6c1f1eabc1234567890');
    expect(result).toEqual(mockAnalytic);
    expect(Models.UserAnalytic.findById).toHaveBeenCalledWith('63e2d6c1f1eabc1234567890');
  });

  it('[-] should throw NotFoundError for an invalid ID', async () => {
    Models.UserAnalytic.findById.mockResolvedValue(null);

    await expect(getAnalyticById('invalidId')).rejects.toThrow(NotFoundError);
    expect(Models.UserAnalytic.findById).toHaveBeenCalledWith('invalidId');
  });

  it('[+] should return analytics by userId', async () => {
    const mockAnalytics = [mockAnalytic];
    Models.UserAnalytic.find.mockResolvedValue(mockAnalytics);

    const result = await getAnalyticByUserId('63e2d6c1f1eabc1234567891');
    expect(result).toEqual(mockAnalytics);
    expect(Models.UserAnalytic.find).toHaveBeenCalledWith({ userId: '63e2d6c1f1eabc1234567891' });
  });

  it('[-] should throw NotFoundError for userId with no analytics', async () => {
    Models.UserAnalytic.find.mockResolvedValue([]);

    await expect(getAnalyticByUserId('nonExistentUserId')).rejects.toThrow('Analytic not found for the specified userId');
    expect(Models.UserAnalytic.find).toHaveBeenCalledWith({ userId: 'nonExistentUserId' });
  });

  it('[+] should create a new analytic', async () => {
    Models.UserAnalytic.mockImplementation(() => ({
      save: vi.fn().mockResolvedValue(mockAnalytic),
    }));

    const result = await createAnalytic(mockAnalytic);
    expect(result).toEqual(mockAnalytic);
    expect(Models.UserAnalytic).toHaveBeenCalledWith(mockAnalytic);
  });

  it('[+] should update an analytic', async () => {
    const updateData = { 'userItineraryAnalytic.totalCommentsCount': 15 };
    const updatedAnalytic = { ...mockAnalytic, userItineraryAnalytic: { ...mockAnalytic.userItineraryAnalytic, totalCommentsCount: 15 } };
    Models.UserAnalytic.findByIdAndUpdate.mockResolvedValue(updatedAnalytic);

    const result = await updateAnalytic(mockAnalytic._id, updateData);
    expect(result.userItineraryAnalytic.totalCommentsCount).toBe(updateData['userItineraryAnalytic.totalCommentsCount']);
    expect(Models.UserAnalytic.findByIdAndUpdate).toHaveBeenCalledWith(mockAnalytic._id, updateData, { new: true });
  });

  it('[-] should throw NotFoundError when updating non-existent analytic', async () => {
    Models.UserAnalytic.findByIdAndUpdate.mockResolvedValue(null);

    const updateData = { 'userItineraryAnalytic.totalCommentsCount': 15 };
    await expect(updateAnalytic('nonExistentId', updateData)).rejects.toThrow(NotFoundError);
    expect(Models.UserAnalytic.findByIdAndUpdate).toHaveBeenCalledWith('nonExistentId', updateData, { new: true });
  });

  it('[+] should delete an analytic', async () => {
    Models.UserAnalytic.findByIdAndDelete.mockResolvedValue(mockAnalytic);

    const result = await deleteAnalytic(mockAnalytic._id);
    expect(result).toEqual(mockAnalytic);
    expect(Models.UserAnalytic.findByIdAndDelete).toHaveBeenCalledWith(mockAnalytic._id);
  });

  it('[-] should throw NotFoundError when deleting non-existent analytic', async () => {
    Models.UserAnalytic.findByIdAndDelete.mockResolvedValue(null);

    await expect(deleteAnalytic('nonExistentId')).rejects.toThrow(NotFoundError);
    expect(Models.UserAnalytic.findByIdAndDelete).toHaveBeenCalledWith('nonExistentId');
  });

  it('[+] should return all analytics', async () => {
    const mockAnalytics = [mockAnalytic];
    Models.UserAnalytic.find.mockResolvedValue(mockAnalytics);

    const result = await getAllAnalytics();
    expect(result).toEqual(mockAnalytics);
    expect(Models.UserAnalytic.find).toHaveBeenCalled();
  });
});
