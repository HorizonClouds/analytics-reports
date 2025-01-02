
// notificationModels.js

import mongoose from 'mongoose';

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

  // FriendRequestNotification schema
const friendRequestNotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  friendRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notificationDate: { type: Date, required: true },
  notificationStatus: { type: String, enum: ['SEEN', 'NOT SEEN'], required: true },
});

  // PublicationCommentNotification schema
const publicationCommentNotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publicationCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true },
  notificationDate: { type: Date, required: true },
  notificationStatus: { type: String, enum: ['SEEN', 'NOT SEEN'], required: true },
});

  // PublicationLikeNotification schema
const publicationLikeNotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publicationLikedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication', required: true },
  notificationDate: { type: Date, required: true },
  notificationStatus: { type: String, enum: ['SEEN', 'NOT SEEN'], required: true },
});

  // ItineraryRatingNotification schema
const itineraryRatingNotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itineraryRatingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating', required: true },
  notificationDate: { type: Date, required: true },
  notificationStatus: { type: String, enum: ['SEEN', 'NOT SEEN'], required: true },
});

  // ItineraryCommentNotification schema
const itineraryCommentNotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itineraryCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true },
  notificationDate: { type: Date, required: true },
  notificationStatus: { type: String, enum: ['SEEN', 'NOT SEEN'], required: true },
});
  
const ItineraryAnalytic = mongoose.model('ItineraryAnalytic', itineraryAnalyticSchema);
const PublicationAnalytic = mongoose.model('PublicationAnalytic', publicationAnalyticSchema);
const ItineraryReport = mongoose.model('ItineraryReport', itineraryReportSchema);
const PublicationReport = mongoose.model('PublicationReport', publicationReportSchema);
const MessageNotification = mongoose.model('MessageNotification', messageNotificationSchema);
const FriendRequestNotification = mongoose.model('FriendRequestNotification', friendRequestNotificationSchema);
const PublicationCommentNotification = mongoose.model('PublicationCommentNotification', publicationCommentNotificationSchema);
const PublicationLikeNotification = mongoose.model('PublicationLikeNotification', publicationLikeNotificationSchema);
const ItineraryRatingNotification = mongoose.model('ItineraryRatingNotification', itineraryRatingNotificationSchema);
const ItineraryCommentNotification = mongoose.model('ItineraryCommentNotification', itineraryCommentNotificationSchema);
  
export default {
  ItineraryAnalytic,
  PublicationAnalytic,
  ItineraryReport,
  PublicationReport,
  MessageNotification,
  FriendRequestNotification,
  PublicationCommentNotification,
  PublicationLikeNotification,
  ItineraryRatingNotification,
  ItineraryCommentNotification
};