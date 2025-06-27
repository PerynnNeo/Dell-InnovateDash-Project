const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  qid: {
    type: String,
    required: true
  },
  optionId: {
    type: String,
    required: true
  }
});

const quizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: String,
    required: true,
    ref: 'Quiz'
  },
  userId: {
    type: String,
    default: null // null for anonymous users
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true
  },
  knowledgeLevel: {
    type: String,
    enum: ['High', 'Medium', 'Low', 'Very Low'],
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  hasSignedUp: {
    type: Boolean,
    default: false
  },
  signUpDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for analytics queries
quizAttemptSchema.index({ quizId: 1, createdAt: -1 });
quizAttemptSchema.index({ hasSignedUp: 1 });
quizAttemptSchema.index({ persona: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);