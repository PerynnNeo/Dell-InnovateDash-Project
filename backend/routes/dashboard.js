// backend/routes/dashboard.js
const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const {
  getDashboardRiskData
} = require('../controllers/dashboardController');

// All dashboard routes require authentication
router.use(auth);

// Get user's dashboard risk data
router.get('/risk-data', getDashboardRiskData);

module.exports = router;