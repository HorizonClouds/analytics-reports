import { describe, it, vi, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  getAnalyticById,
  getAnalyticByUserId,
  createAnalyticByUserId,
  getAllAnalytics,
  createAnalytic,
  updateAnalytic,
  deleteAnalytic,
  getOrCreateAnalyticById
} from '../services/analyticService.js';
import Models from '../models/analyticModel.js';
import { itineraryService } from '../services/itineraryService.js';

const exampleAnalytic = {
  userId: new mongoose.Types.ObjectId(),
  userItineraryAnalytic: {
    totalCommentsCount: 10,
    avgComments: 2,
    totalReviewsCount: 5,
    averageReviewScore: 4.5,
    bestItineraryByAvgReviewScore: new mongoose.Types.ObjectId()
  },
  userPublicationAnalytic: {
    averageLike: 3.5,
    totalLikesCount: 100,
    commentsPerPublication: 5,
    totalCommentsCount: 50
  }
};

const anotherAnalytic = {
  userId: new mongoose.Types.ObjectId(),
  userItineraryAnalytic: {
    totalCommentsCount: 20,
    avgComments: 4,
    totalReviewsCount: 10,
    averageReviewScore: 4.0,
    bestItineraryByAvgReviewScore: new mongoose.Types.ObjectId()
  },
  userPublicationAnalytic: {
    averageLike: 4.0,
    totalLikesCount: 200,
    commentsPerPublication: 10,
    totalCommentsCount: 100
  },
  data: { someField: 'anotherValue' }
};

describe('[Integration][Service] Analytic Tests', () => {
  let analyticId;
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
    const analytic = await createAnalytic(exampleAnalytic);
    analyticId = analytic._id.toString();
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  it('[+] should CREATE an analytic', async () => {
    const result = await createAnalytic(anotherAnalytic);
    expect(result.userId.toString()).toBe(anotherAnalytic.userId.toString());
    const dbAnalytic = await Models.UserAnalytic.findById(result._id);
    expect(dbAnalytic).not.toBeNull();
    expect(dbAnalytic.userId.toString()).toBe(anotherAnalytic.userId.toString());
  });

  it('[+] should CREATE an analytic by userId', async () => {
    const userId = exampleAnalytic.userId.toString();
    const itineraries = [
      {
        userId: userId,
        name: 'Adventure in the Andes',
        description: 'A thrilling 5-day adventure across the Andes.',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-03-05'),
        activities: [
          { title: 'Mountain Hike', duration: 5, location: 'Andes' },
          { title: 'Camping', duration: 12, location: 'Base Camp' },
        ],
        comments: [
          { userId: userId, message: 'Amazing trip!', date: new Date() },
          { userId: userId, message: 'Loved it!', date: new Date() }
        ],
        reviews: [
          { userId: userId, score: 4, comment: 'Great experience!' },
          { userId: userId, score: 5, comment: 'Fantastic!' }
        ],
        category: 'Adventure',
        _id: new mongoose.Types.ObjectId()
      }
    ];

    vi.spyOn(itineraryService, 'fetchItinerariesByUser').mockResolvedValue(itineraries);

    const result = await createAnalyticByUserId(userId);

    const totalCommentsCount = itineraries.reduce((sum, itinerary) => sum + itinerary.comments.length, 0);
    const totalReviewsCount = itineraries.reduce((sum, itinerary) => sum + itinerary.reviews.length, 0);
    const avgComments = totalCommentsCount / itineraries.length;
    const averageReviewScore = itineraries.reduce((sum, itinerary) => sum + itinerary.reviews.reduce((scoreSum, review) => scoreSum + review.score, 0), 0) / totalReviewsCount;
    const bestItinerary = itineraries.reduce((best, itinerary) => {
      const avgScore = itinerary.reviews.reduce((scoreSum, review) => scoreSum + review.score, 0) / itinerary.reviews.length;
      return avgScore > best.avgScore ? { itineraryId: itinerary._id, avgScore } : best;
    }, { avgScore: 0 }).itineraryId;

    expect(result.userId.toString()).toBe(userId);
    expect(result.userItineraryAnalytic.totalCommentsCount).toBe(totalCommentsCount);
    expect(result.userItineraryAnalytic.avgComments).toBe(avgComments);
    expect(result.userItineraryAnalytic.totalReviewsCount).toBe(totalReviewsCount);
    expect(result.userItineraryAnalytic.averageReviewScore).toBe(averageReviewScore);
    expect(result.userItineraryAnalytic.bestItineraryByAvgReviewScore.toString()).toBe(bestItinerary.toString());

    const dbAnalytic = await Models.UserAnalytic.findById(result._id);
    expect(dbAnalytic).not.toBeNull();
    expect(dbAnalytic.userId.toString()).toBe(userId);
  });

  it('[+] should GET an analytic by ID', async () => {
    const result = await getAnalyticById(analyticId);
    expect(result._id.toString()).toBe(analyticId);
    expect(result.userId.toString()).toBe(exampleAnalytic.userId.toString());

    const dbAnalytic = await Models.UserAnalytic.findById(analyticId);
    expect(dbAnalytic).not.toBeNull();
    expect(dbAnalytic.userId.toString()).toBe(exampleAnalytic.userId.toString());
  });

  it('[-] should return NOT FOUND for non-existent analytic ID', async () => {
    const invalidId = new mongoose.Types.ObjectId();
    await expect(getAnalyticById(invalidId.toString())).rejects.toThrow('Analytic not found');
  });

  it('[+] should GET analytics by userId', async () => {
    const result = await getAnalyticByUserId(exampleAnalytic.userId.toString());
    expect(result).toHaveLength(1);
    expect(result[0].userId.toString()).toBe(exampleAnalytic.userId.toString());
  });

  it('[-] should return NOT FOUND for analytics by non-existent userId', async () => {
    await expect(getAnalyticByUserId('nonExistentUser')).rejects.toThrow('Error fetching analytic by userId');
  });

  it('[+] should GET all analytics', async () => {
    const result = await getAllAnalytics();
    expect(result).toHaveLength(1);
    expect(result[0].userId.toString()).toBe(exampleAnalytic.userId.toString());
  });

  it('[+] should UPDATE an analytic', async () => {
    const updateData = { 'userItineraryAnalytic.totalCommentsCount': 15 };
    const result = await updateAnalytic(analyticId, updateData);
    expect(result.userItineraryAnalytic.totalCommentsCount).toBe(updateData['userItineraryAnalytic.totalCommentsCount']);

    const dbAnalytic = await Models.UserAnalytic.findById(analyticId);
    expect(dbAnalytic.userItineraryAnalytic.totalCommentsCount).toBe(updateData['userItineraryAnalytic.totalCommentsCount']);
  });

  it('[-] should return NOT FOUND when updating non-existent analytic', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const updateData = { 'userItineraryAnalytic.totalCommentsCount': 15 };
    await expect(updateAnalytic(nonExistentId, updateData)).rejects.toThrow('Analytic not found');
  });

  it('[+] should DELETE an analytic', async () => {
    const result = await deleteAnalytic(analyticId);
    expect(result._id.toString()).toBe(analyticId);

    const dbAnalytic = await Models.UserAnalytic.findById(analyticId);
    expect(dbAnalytic).toBeNull();
  });

  it('[-] should return NOT FOUND when deleting non-existent analytic', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    await expect(deleteAnalytic(nonExistentId)).rejects.toThrow('Analytic not found');
  });

  it('[+] should GET or CREATE an analytic by ID', async () => {
    const newId = new mongoose.Types.ObjectId().toString();
    const analyticData = {
      userId: new mongoose.Types.ObjectId(),
      userItineraryAnalytic: {
        totalCommentsCount: 15,
        avgComments: 3,
        totalReviewsCount: 7,
        averageReviewScore: 4.2,
        bestItineraryByAvgReviewScore: new mongoose.Types.ObjectId()
      },
      userPublicationAnalytic: {
        averageLike: 3.8,
        totalLikesCount: 150,
        commentsPerPublication: 8,
        totalCommentsCount: 60
      },
      data: { someField: 'newValue' }
    };
    const result = await getOrCreateAnalyticById(newId, analyticData);

    expect(result._id.toString()).toBe(newId);
    expect(result.userId.toString()).toBe(analyticData.userId.toString());

    const dbAnalytic = await Models.UserAnalytic.findById(newId);
    expect(dbAnalytic).not.toBeNull();
    expect(dbAnalytic.userId.toString()).toBe(analyticData.userId.toString());
  });

  it('[+] should RETURN existing analytic for getOrCreateAnalyticById', async () => {
    const result = await getOrCreateAnalyticById(analyticId, exampleAnalytic);
    expect(result._id.toString()).toBe(analyticId);
    expect(result.userId.toString()).toBe(exampleAnalytic.userId.toString());
  });

});
