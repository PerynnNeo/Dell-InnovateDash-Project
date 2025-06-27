// backend/models/LifestyleQuizAttempt.js
const mongoose = require('mongoose');

const lifestyleAnswerSchema = new mongoose.Schema({
  qid: {
    type: String,
    required: true
  },
  optionId: {
    type: String,
    required: true
  },
  points: {
    type: Number,                          
    required: true
  },
  multiplier: {
    type: Number,
    required: true
  },
  categoryScore: {
    type: Number,
    required: true // points × multiplier
  }
});

const lifestyleQuizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: String,
    required: true,
    ref: 'LifestyleQuiz'
  },
  userId: {
    type: String,
    required: true, // Always required for lifestyle quiz (protected route)
    ref: 'User'
  },
  answers: [lifestyleAnswerSchema],
  totalScore: {
    type: Number,
    required: true // Sum of all categoryScores
  },
  maxPossibleScore: {
    type: Number,
    required: true // From quiz.scoring.maxTotalPoints
  },
  percentageScore: {
    type: Number,
    required: true // (totalScore / maxPossibleScore) * 100
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ['LOW_RISK', 'MODERATE_RISK', 'HIGH_RISK']
  },
  riskData: {
    level: String,
    label: String,
    percentageRange: String,
    color: String,
    description: String
  },
  categoryBreakdown: {
    primary: {
      score: Number,
      maxScore: Number
    },
    secondary: {
      score: Number,
      maxScore: Number
    },
    tertiary: {
      score: Number,
      maxScore: Number
    }
  }
}, {
  timestamps: true
});

// Index for user queries
lifestyleQuizAttemptSchema.index({ userId: 1, createdAt: -1 });
lifestyleQuizAttemptSchema.index({ quizId: 1, createdAt: -1 });

// Check if model already exists to prevent OverwriteModelError
module.exports = mongoose.models.LifestyleQuizAttempt || mongoose.model('LifestyleQuizAttempt', lifestyleQuizAttemptSchema);