const mongoose = require('mongoose');

const healthcareProviderSchema = new mongoose.Schema({
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
  description: {
    type: String,
    required: true
  },
  website: {
    type: String,
    required: true
  },

  contactInfo: {
    phone: String,
    email: String,
    address: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.HealthcareProvider || mongoose.model('HealthcareProvider', healthcareProviderSchema);
