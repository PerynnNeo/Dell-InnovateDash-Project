const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  getCurrentUser
} = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Routes
// POST /api/auth/register
router.post('/register', registerValidation, registerUser);

// POST /api/auth/login
router.post('/login', loginValidation, loginUser);

// GET /api/auth/me (protected route)
router.get('/me', auth, getCurrentUser);

module.exports = router;