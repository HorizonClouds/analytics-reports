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
  getOrCreateAnalyticById,
  saveAnalytic
} from '../services/analyticService.js';
import Models from '../models/analyticModel.js';
import { itineraryService } from '../services/itineraryService.js';

const exampleAnalytic = {
  userId: new mongoose.Types.ObjectId().toString(),
  resourceId: new mongoose.Types.ObjectId().toString(), // Nuevo campo
  userItineraryAnalytic: {
    totalCommentsCount: 10,
    avgComments: 2,
    totalReviewsCount: 5,
    averageReviewScore: 4.5,
    bestItineraryByAvgReviewScore: new mongoose.Types.ObjectId(),
  },
  userPublicationAnalytic: {
    averageLike: 3.5,
    totalLikesCount: 100,
    commentsPerPublication: 5,
    totalCommentsCount: 50,
  },
};

const anotherAnalytic = {
  userId: new mongoose.Types.ObjectId().toString(),
  resourceId: new mongoose.Types.ObjectId().toString(), // Nuevo campo
  userItineraryAnalytic: {
    totalCommentsCount: 20,
    avgComments: 4,
    totalReviewsCount: 10,
    averageReviewScore: 4.0,
    bestItineraryByAvgReviewScore: new mongoose.Types.ObjectId(),
  },
  userPublicationAnalytic: {
    averageLike: 4.0,
    totalLikesCount: 200,
    commentsPerPublication: 10,
    totalCommentsCount: 100,
  },
  data: { someField: 'anotherValue' },
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

  it('[+] should GET all analytics', async () => {
    const result = await getAllAnalytics();
    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe(exampleAnalytic.userId);
    expect(result[0].resourceId).toBe(exampleAnalytic.resourceId); // Validar resourceId
  });

  it('[+] should GET an analytic by ID', async () => {
    const result = await getAnalyticById(analyticId);
    expect(result._id.toString()).toBe(analyticId);
    expect(result.userId).toBe(exampleAnalytic.userId);
    expect(result.resourceId).toBe(exampleAnalytic.resourceId); // Validar resourceId

    const dbAnalytic = await Models.UserAnalytic.findById(analyticId);
    expect(dbAnalytic).not.toBeNull();
    expect(dbAnalytic.resourceId).toBe(exampleAnalytic.resourceId); // Validar resourceId
  });

  it('[-] should return NOT FOUND for non-existent analytic ID', async () => {
    const invalidId = new mongoose.Types.ObjectId();
    await expect(getAnalyticById(invalidId.toString())).rejects.toThrow('Analytic not found');
  });

  it('[+] should UPDATE an analytic', async () => {
    const updateData = { resourceId: new mongoose.Types.ObjectId().toString() }; // Actualizar resourceId
    const result = await updateAnalytic(analyticId, updateData);
    expect(result.resourceId).toBe(updateData.resourceId); // Validar cambio de resourceId

    const dbAnalytic = await Models.UserAnalytic.findById(analyticId);
    expect(dbAnalytic.resourceId).toBe(updateData.resourceId); // Validar cambio en base de datos
  });

  it('[+] should DELETE an analytic', async () => {
    const result = await deleteAnalytic(analyticId);
    expect(result._id.toString()).toBe(analyticId);

    const dbAnalytic = await Models.UserAnalytic.findById(analyticId);
    expect(dbAnalytic).toBeNull();
  });

  it('[+] should GET analytics by userId', async () => {
    const result = await getAnalyticByUserId(exampleAnalytic.userId);
    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe(exampleAnalytic.userId);
    expect(result[0].resourceId).toBe(exampleAnalytic.resourceId); // Validar resourceId
  });

  it('[+] should SAVE a new analytic', async () => {
    const result = await saveAnalytic(null, anotherAnalytic);
    expect(result.resourceId).toBe(anotherAnalytic.resourceId); // Validar resourceId

    const dbAnalytic = await Models.UserAnalytic.findById(result._id);
    expect(dbAnalytic.resourceId).toBe(anotherAnalytic.resourceId); // Validar resourceId
  });
});
