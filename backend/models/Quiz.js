const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  options: [{
    id: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    weight: {
      type: Number,
      default: 10
    }
  }],
  explanation: {
    type: String,
    required: true
  }
});

const quizSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  questions: [questionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'SCS Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);