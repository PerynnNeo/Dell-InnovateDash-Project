// backend/routes/lifestyleQuiz.js
const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const {
  getActiveLifestyleQuiz,
  submitLifestyleQuizAttempt,
  getUserLifestyleQuizAttempts
} = require('../controllers/lifeStyleQuizController');

// All lifestyle quiz routes require authentication
router.use(auth);

// Get active lifestyle quiz
router.get('/active', getActiveLifestyleQuiz);

// Submit lifestyle quiz attempt
router.post('/submit', submitLifestyleQuizAttempt);

// Get user's quiz attempts history
router.get('/attempts', getUserLifestyleQuizAttempts);

module.exports = router;