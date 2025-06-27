const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const {
  getActiveQuiz,
  submitQuizAttempt,
  getQuizAnalytics,
  createQuiz,
  linkQuizToUser
} = require('../controllers/quizController');

// You'll need to create these middleware functions
// const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/active', getActiveQuiz);
router.post('/submit', submitQuizAttempt);

// Protected routes ()
router.post('/link-attempt', auth, linkQuizToUser);
// router.get('/:quizId/analytics', auth, adminMiddleware, getQuizAnalytics);
// router.post('/create', auth, adminMiddleware, createQuiz);

// Temporary admin routes (remove in production)
router.get('/:quizId/analytics', getQuizAnalytics);
router.post('/create', createQuiz);

module.exports = router;