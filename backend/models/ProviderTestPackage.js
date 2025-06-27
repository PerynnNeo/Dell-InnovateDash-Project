const mongoose = require('mongoose');

const providerTestPackageSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthcareProvider',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScreeningTest',
    required: true
  },
  packageName: {
    type: String,
    required: true
  },
  packageUrl: {
    type: String,
    required: true
  },
  price: {
    amount: Number,
    currency: {
      type: String,
      default: 'SGD'
    },
    subsidized: {
      amount: Number,
      eligibility: String
    }
  },
  availability: {
    locations: [String],
    onlineBooking: {
      type: Boolean,
      default: false
    },
    walkIn: {
      type: Boolean,
      default: true
    }
  },
  specializations: {
    highRisk: {
      type: Boolean,
      default: false
    },
    familyHistory: {
      type: Boolean,
      default: false
    },
    fastTrack: {
      type: Boolean,
      default: false
    }
  },
  priority: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  additionalInfo: {
    waitTime: String,
    requirements: [String],
    includes: [String]
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
providerTestPackageSchema.index({ providerId: 1, testId: 1 });
providerTestPackageSchema.index({ testId: 1, priority: -1 });

module.exports = mongoose.models.ProviderTestPackage || mongoose.model('ProviderTestPackage', providerTestPackageSchema);