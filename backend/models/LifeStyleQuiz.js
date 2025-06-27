const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
    default: 0
  }
});

const displayDataSchema = new mongoose.Schema({
  shortName: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  simulatorConfig: {
    leftLabel: String,
    rightLabel: String
  }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  questionNumber: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['single_choice', 'multiple_choice', 'calculated_bmi', 'text_input'],
    default: 'single_choice'
  },
  subText: {
    type: String,
    default: null
  },
  icon: {
    type: String,
    default: null // Will be populated later with emoji or icon class names
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    required: true,
    enum: ['primary', 'secondary', 'tertiary']
  },
  multiplier: {
    type: Number,
    required: true,
    enum: [1, 2, 4] // tertiary=1, secondary=2, primary=4
  },
  displayData: {
    type: displayDataSchema,
    required: false // Optional - only for questions that contribute to scoring
  },
  options: [optionSchema],
  rationale: {
    type: String,
    required: true
  }
});

const riskLevelSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ['LOW_RISK', 'MODERATE_RISK', 'HIGH_RISK']
  },
  label: {
    type: String,
    required: true
  },
  percentageRange: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

const scoringSchema = new mongoose.Schema({
  maxBasePoints: {
    type: Number,
    required: true,
    default: 10 // Each question has 0-10 base points
  },
  maxTotalPoints: {
    type: Number,
    required: true,
    default: 320 // Total after applying multipliers
  },
  categoryMultipliers: {
    primary: {
      type: Number,
      default: 4
    },
    secondary: {
      type: Number,
      default: 2
    },
    tertiary: {
      type: Number,
      default: 1
    }
  },
  riskLevels: [riskLevelSchema]
});

const lifestyleQuizSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    required: true,
    default: 1
  },
  questions: [questionSchema],
  scoring: scoringSchema
}, {
  timestamps: true
});

module.exports = mongoose.model('LifestyleQuiz', lifestyleQuizSchema);