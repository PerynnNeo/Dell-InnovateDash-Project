const mongoose = require('mongoose');

const screeningTestSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['CANCER_SCREENING', 'GENERAL_HEALTH', 'SPECIALIZED']
  },
  description: {
    type: String,
    required: true
  },
  preparation: {
    type: String // What patient needs to do before test
  },
  duration: {
    type: String // How long the test takes
  },
  frequency: {
    type: String // How often it should be done
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.ScreeningTest || mongoose.model('ScreeningTest', screeningTestSchema);
