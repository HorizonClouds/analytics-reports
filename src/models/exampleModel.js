// notificationModels.js

import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'], // Validation: Name is required
    minlength: [3, 'Name must be at least 3 characters long'], // Validation: Minimum length
    maxlength: [50, 'Name must be at most 50 characters long'], // Validation: Maximum length
  },
  value: {
    type: Number,
    required: [true, 'Value is required'], // Validation: Value is required
    min: [0, 'Value must be a positive number'], // Validation: Minimum value
  },
});

// ItineraryAnalytic schema
const itineraryAnalyticSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  numberOfItineraryComments: { type: Number, required: true, min: 0 },
  commentsPerItinerary: { type: Number, required: true, min: 0 },
  numberOfItineraryRatings: { type: Number, required: true, min: 0 },
  averageItineraryRating: { type: Number, required: true, min: 0, max: 5 },
  bestItineraryRating: { type: Number, required: true, min: 0, max: 5 },
  analysisDate: { type: Date, required: true },
});

// PublicationAnalytic schema
const publicationAnalyticSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  numberOfPublicationComments: { type: Number, required: true, min: 0 },
  commentsPerPublication: { type: Number, required: true, min: 0 },
  numberOfPublicationLikes: { type: Number, required: true, min: 0 },
  averagePublicationLike: { type: Number, required: true, min: 0 },
  bestPublicationLike: { type: Number, required: true, min: 0 },
  analysisDate: { type: Date, required: true },
});

// ItineraryReport schema
const itineraryReportSchema = new mongoose.Schema({
  itineraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true, minlength: 3, maxlength: 255 },
});

// PublicationReport schema
const publicationReportSchema = new mongoose.Schema({
  publicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true, minlength: 3, maxlength: 255 },
});

// MessageNotification schema
const messageNotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
  notificationDate: { type: Date, required: true },
  notificationStatus: { type: String, enum: ['SEEN', 'NOT SEEN'], required: true },
});

const ExampleModel = mongoose.model('Example', exampleSchema);
const ItineraryAnalytic = mongoose.model('ItineraryAnalytic', itineraryAnalyticSchema);
const PublicationAnalytic = mongoose.model('PublicationAnalytic', publicationAnalyticSchema);
const ItineraryReport = mongoose.model('ItineraryReport', itineraryReportSchema);
const PublicationReport = mongoose.model('PublicationReport', publicationReportSchema);
const MessageNotification = mongoose.model('MessageNotification', messageNotificationSchema);

export default {
  ExampleModel,
  ItineraryAnalytic,
  PublicationAnalytic,
  ItineraryReport,
  PublicationReport,
  MessageNotification
};
