import { describe, it, expect, vi, afterEach } from 'vitest';
import Models from '../models/analyticModel.js';
import {
  getAnalyticById,
  getAnalyticByUserId,
  getAllAnalytics,
  createAnalytic,
  getOrCreateAnalyticById,
  updateAnalytic,
  deleteAnalytic,
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
    },
    userPublicationAnalytic: {
      averageLike: 3.5,
      totalLikesCount: 100,
      commentsPerPublication: 5,
      totalCommentsCount: 50,
    },
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

    await expect(getAnalyticByUserId('nonExistentUserId')).rejects.toThrow(NotFoundError);
    expect(Models.UserAnalytic.find).toHaveBeenCalledWith({ userId: 'nonExistentUserId' });
  });

  it('[+] should return all analytics', async () => {
    const mockAnalytics = [mockAnalytic];
    Models.UserAnalytic.find.mockResolvedValue(mockAnalytics);

    const result = await getAllAnalytics();
    expect(result).toEqual(mockAnalytics);
    expect(Models.UserAnalytic.find).toHaveBeenCalled();
  });

  it('[+] should create a new analytic', async () => {
    Models.UserAnalytic.mockImplementation(() => ({
      save: vi.fn().mockResolvedValue(mockAnalytic),
    }));

    const result = await createAnalytic(mockAnalytic);
    expect(result).toEqual(mockAnalytic);
    expect(Models.UserAnalytic).toHaveBeenCalledWith(mockAnalytic);
  });

  it('[+] should create an analytic if not found by ID', async () => {
    Models.UserAnalytic.findById = vi.fn().mockResolvedValue(null);
    Models.UserAnalytic.mockImplementation(() => ({
      save: vi.fn().mockResolvedValue(mockAnalytic),
    }));
    const result = await getOrCreateAnalyticById('63e2d6c1f1eabc1234567890', mockAnalytic);
    expect(result).toEqual(mockAnalytic);
    expect(Models.UserAnalytic.findById).toHaveBeenCalledWith('63e2d6c1f1eabc1234567890');
    expect(Models.UserAnalytic).toHaveBeenCalledWith({
      _id: '63e2d6c1f1eabc1234567890',
      ...mockAnalytic,
    });
  });

  it('[+] should get or create an analytic by ID (existing)', async () => {
    Models.UserAnalytic.findById.mockResolvedValue(mockAnalytic);

    const result = await getOrCreateAnalyticById('63e2d6c1f1eabc1234567890', mockAnalytic);
    expect(result).toEqual(mockAnalytic);
    expect(Models.UserAnalytic.findById).toHaveBeenCalledWith('63e2d6c1f1eabc1234567890');
  });

  it('[+] should update an existing analytic', async () => {
    const updatedAnalytic = {
      ...mockAnalytic,
      userItineraryAnalytic: {
        ...mockAnalytic.userItineraryAnalytic,
        totalCommentsCount: 20
      }
    };
    Models.UserAnalytic.findByIdAndUpdate.mockResolvedValue(updatedAnalytic);

    const result = await updateAnalytic('63e2d6c1f1eabc1234567890', { userItineraryAnalytic: { totalCommentsCount: 20 } });
    expect(result).toEqual(updatedAnalytic);
    expect(Models.UserAnalytic.findByIdAndUpdate).toHaveBeenCalledWith('63e2d6c1f1eabc1234567890', { userItineraryAnalytic: { totalCommentsCount: 20 } }, { new: true });
  });

  it('[-] should throw NotFoundError when updating non-existent analytic', async () => {
    Models.UserAnalytic.findByIdAndUpdate.mockResolvedValue(null);

    await expect(updateAnalytic('nonExistentId', { userItineraryAnalytic: { totalCommentsCount: 20 } }))
      .rejects.toThrow(NotFoundError);
    expect(Models.UserAnalytic.findByIdAndUpdate).toHaveBeenCalledWith('nonExistentId', { userItineraryAnalytic: { totalCommentsCount: 20 } }, { new: true });
  });

  it('[+] should delete an existing analytic', async () => {
    Models.UserAnalytic.findByIdAndDelete.mockResolvedValue(mockAnalytic);

    const result = await deleteAnalytic('63e2d6c1f1eabc1234567890');
    expect(result).toEqual(mockAnalytic);
    expect(Models.UserAnalytic.findByIdAndDelete).toHaveBeenCalledWith('63e2d6c1f1eabc1234567890');
  });

  it('[-] should throw NotFoundError when deleting non-existent analytic', async () => {
    Models.UserAnalytic.findByIdAndDelete.mockResolvedValue(null);

    await expect(deleteAnalytic('nonExistentId')).rejects.toThrow(NotFoundError);
    expect(Models.UserAnalytic.findByIdAndDelete).toHaveBeenCalledWith('nonExistentId');
  });

});
