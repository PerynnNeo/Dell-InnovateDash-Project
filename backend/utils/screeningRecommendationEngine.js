const HealthcareProvider = require('../models/HealthcareProvider');
const ScreeningTest = require('../models/ScreeningTest');
const ProviderTestPackage = require('../models/ProviderTestPackage');

/**
 * Extract user profile from quiz answers
 * Converts raw quiz responses into structured user profile for recommendation logic
 */
function extractUserProfile(answers, quiz) {
  const profile = {
    age: null,
    ageGroup: null,
    gender: null,
    previousCancer: null,
    smoking: null,
    bmi: null,
    familyHistory: null,
    alcohol: null,
    exercise: null,
    diet: null
  };

  answers.forEach(answer => {
    const question = quiz.questions.find(q => q.id === answer.qid);
    const selectedOption = question?.options.find(opt => opt.id === answer.optionId);
    
    if (!question || !selectedOption) return;

    switch (answer.qid) {
      case 'q1': // Age
        profile.ageGroup = selectedOption.text;
        profile.age = getAgeFromGroup(selectedOption.text);
        break;
      case 'q2': // Previous cancer
        profile.previousCancer = selectedOption.text;
        break;
      case 'q3': // Smoking
        profile.smoking = selectedOption.text;
        break;
      case 'q4': // BMI
        profile.bmi = selectedOption.text;
        break;
      case 'q5': // Family history
        profile.familyHistory = selectedOption.text;
        break;
      case 'q6': // Alcohol
        profile.alcohol = selectedOption.text;
        break;
      case 'q7': // Exercise
        profile.exercise = selectedOption.text;
        break;
      case 'q8': // Diet
        profile.diet = selectedOption.text;
        break;
      case 'q10': // Gender
        profile.gender = selectedOption.text;
        break;
    }
  });

  return profile;
}

/**
 * Convert age group text to numeric age for calculations
 */
function getAgeFromGroup(ageGroup) {
  const ageMap = {
    'Under 25': 22,
    '25-34': 30,
    '35-44': 40,
    '45-54': 50,
    '55-64': 60,
    '65+': 70
  };
  return ageMap[ageGroup] || 30;
}

/**
 * Get list of test codes that have available packages
 * Returns array of test codes to avoid recommending tests without providers
 */
async function getAvailableTestCodes() {
  try {
    const availableTests = await ProviderTestPackage.distinct('testId');
    const testCodes = await ScreeningTest.find({ 
      _id: { $in: availableTests }, 
      isActive: true 
    }).select('code');
    
    return testCodes.map(test => test.code);
  } catch (error) {
    console.error('Error fetching available test codes:', error);
    return [];
  }
}

/**
 * Main recommendation engine - BUSINESS LOGIC ONLY
 * Returns array of simple recommendation objects with test codes, priorities, and reasons
 * Controller handles all data fetching and UI formatting
 */
async function generateScreeningRecommendations(userProfile, quizAttempt) {
  const recommendations = [];
  const { age, gender, familyHistory, smoking, previousCancer, bmi, alcohol, diet, exercise } = userProfile;
  const riskScore = quizAttempt.percentageScore;
  
  // Get available test codes to avoid recommending unavailable tests
  const availableTests = await getAvailableTestCodes();
  
  // COLONOSCOPY RULES
  if (shouldRecommendColonoscopy(userProfile, riskScore) && availableTests.includes('COLONOSCOPY')) {
    recommendations.push({
      testCode: 'COLONOSCOPY',
      testName: 'Colonoscopy',
      priority: calculateColonoscopyPriority(userProfile, riskScore),
      reasons: getColonoscopyReasons(userProfile, riskScore)
    });
  }

  // MAMMOGRAM RULES (Female only)
  if (gender === 'Female' && 
      shouldRecommendMammogram(userProfile, riskScore) && 
      availableTests.includes('MAMMOGRAM')) {
    recommendations.push({
      testCode: 'MAMMOGRAM',
      testName: 'Mammogram',
      priority: calculateMammogramPriority(userProfile, riskScore),
      reasons: getMammogramReasons(userProfile, riskScore)
    });
  }

  // PAP SMEAR / HPV TEST RULES (Female only)
  if (gender === 'Female' && age >= 25) {
    const cervicalTestCode = age >= 30 ? 'HPV_TEST' : 'PAP_SMEAR';
    const testName = age >= 30 ? 'HPV Test' : 'Pap Smear';
    
    if (availableTests.includes(cervicalTestCode)) {
      recommendations.push({
        testCode: cervicalTestCode,
        testName: testName,
        priority: riskScore >= 31 ? 'Medium' : 'Low',
        reasons: [`Women ${age >= 30 ? '30+' : '25-29'} should undergo regular cervical cancer screening`]
      });
    }
  }

  // FIT TEST RULES
  if (shouldRecommendFIT(userProfile, riskScore) && availableTests.includes('FIT_TEST')) {
    recommendations.push({
      testCode: 'FIT_TEST',
      testName: 'FIT Test (Stool Analysis)',
      priority: calculateFITPriority(userProfile, riskScore),
      reasons: getFITReasons(userProfile, riskScore)
    });
  }

  // PSA TEST RULES (Male only)
  if (gender === 'Male' && 
      shouldRecommendPSA(userProfile, riskScore) && 
      availableTests.includes('PSA')) {
    recommendations.push({
      testCode: 'PSA',
      testName: 'PSA Test',
      priority: calculatePSAPriority(userProfile, riskScore),
      reasons: getPSAReasons(userProfile, riskScore)
    });
  }

  // LIVER SCREENING RULES
  if (shouldRecommendLiverScreening(userProfile, riskScore)) {
    const priority = calculateLiverScreeningPriority(userProfile, riskScore);
    
    // AFP Test
    if (availableTests.includes('AFP')) {
      recommendations.push({
        testCode: 'AFP',
        testName: 'Alpha-Fetoprotein (AFP)',
        priority: priority,
        reasons: ['High alcohol consumption increases liver cancer risk']
      });
    }
    
    // Liver Ultrasound  
    if (availableTests.includes('LIVER_ULTRASOUND')) {
      recommendations.push({
        testCode: 'LIVER_ULTRASOUND',
        testName: 'Liver Ultrasound',
        priority: priority,
        reasons: ['High alcohol consumption requires liver monitoring']
      });
    }
  }

  // LUNG SCREENING RULES
  if (shouldRecommendLungScreening(userProfile, riskScore) && availableTests.includes('LOW_DOSE_CT')) {
    recommendations.push({
      testCode: 'LOW_DOSE_CT',
      testName: 'Low-Dose CT Scan',
      priority: 'High',
      reasons: ['Heavy smoking history significantly increases lung cancer risk']
    });
  }

  // BASIC HEALTH SCREENING for high-risk individuals
  if (riskScore >= 31) {
    const basicTests = [
      { code: 'BLOOD_PRESSURE', name: 'Blood Pressure Test', reason: 'Regular monitoring for cardiovascular health' },
      { code: 'CHOLESTEROL', name: 'Cholesterol Test', reason: 'Dietary factors may affect cholesterol levels' },
      { code: 'DIABETES_SCREENING', name: 'Diabetes Screening', reason: 'BMI and lifestyle factors increase diabetes risk' }
    ];
    
    basicTests.forEach(test => {
      if (availableTests.includes(test.code)) {
        recommendations.push({
          testCode: test.code,
          testName: test.name,
          priority: 'Medium',
          reasons: [test.reason]
        });
      }
    });
  }

  // Sort by priority (High > Medium > Low)
  return recommendations.sort((a, b) => {
    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

// =================================================================
// BUSINESS RULE FUNCTIONS - Determine WHEN to recommend each test
// =================================================================

/**
 * Determine if colonoscopy should be recommended
 */
function shouldRecommendColonoscopy(profile, riskScore) {
  const { age, familyHistory, previousCancer, diet } = profile;
  
  if (familyHistory && familyHistory.includes('colorectal')) return true;
  if (age >= 45 && riskScore >= 61) return true;
  if (age >= 50) return true;
  if (previousCancer && !previousCancer.includes('No')) return true;
  
  return false;
}

/**
 * Calculate colonoscopy priority based on risk factors
 */
function calculateColonoscopyPriority(profile, riskScore) {
  const { familyHistory, age, previousCancer } = profile;
  
  if (familyHistory?.includes('colorectal') || 
      (previousCancer && !previousCancer.includes('No')) ||
      (age >= 45 && riskScore >= 61)) {
    return 'High';
  }
  if (age >= 50 || riskScore >= 31) return 'Medium';
  return 'Low';
}

/**
 * Generate reasons why colonoscopy is recommended
 */
function getColonoscopyReasons(profile, riskScore) {
  const reasons = [];
  const { familyHistory, age, previousCancer, diet } = profile;
  
  if (familyHistory?.includes('colorectal')) {
    reasons.push('Family history of colorectal cancer');
  }
  if (age >= 45 && riskScore >= 61) {
    reasons.push('Age 45+ with high risk factors');
  }
  if (age >= 50) {
    reasons.push('Standard screening age (50+)');
  }
  if (previousCancer && !previousCancer.includes('No')) {
    reasons.push('Previous cancer history');
  }
  
  return reasons;
}

/**
 * Determine if mammogram should be recommended
 */
function shouldRecommendMammogram(profile, riskScore) {
  const { age, familyHistory, previousCancer } = profile;
  
  if (age >= 50) return true;
  if (age >= 40 && riskScore >= 61) return true;
  if (familyHistory?.includes('breast')) return true;
  if (previousCancer && previousCancer.includes('breast')) return true;
  
  return false;
}

/**
 * Calculate mammogram priority based on risk factors
 */
function calculateMammogramPriority(profile, riskScore) {
  const { familyHistory, age, previousCancer } = profile;
  
  if (familyHistory?.includes('breast') || 
      (previousCancer && previousCancer.includes('breast')) ||
      (age >= 40 && riskScore >= 61)) {
    return 'High';
  }
  if (age >= 50) return 'Medium';
  return 'Low';
}

/**
 * Generate reasons why mammogram is recommended
 */
function getMammogramReasons(profile, riskScore) {
  const reasons = [];
  const { familyHistory, age, previousCancer } = profile;
  
  if (familyHistory?.includes('breast')) {
    reasons.push('Family history of breast cancer');
  }
  if (age >= 40 && riskScore >= 61) {
    reasons.push('Age 40+ with high risk factors');
  }
  if (age >= 50) {
    reasons.push('Standard screening age (50+)');
  }
  if (previousCancer && previousCancer.includes('breast')) {
    reasons.push('Previous breast cancer history');
  }
  
  return reasons;
}

/**
 * Determine if FIT test should be recommended
 */
function shouldRecommendFIT(profile, riskScore) {
  const { age, diet, alcohol, familyHistory } = profile;
  
  if (age >= 50) return true;
  if (familyHistory?.includes('colorectal')) return true;
  if (diet && (diet.includes('processed') || diet.includes('red meat'))) return true;
  if (alcohol && !alcohol.includes('Never')) return true;
  
  return false;
}

/**
 * Calculate FIT test priority based on risk factors
 */
function calculateFITPriority(profile, riskScore) {
  const { familyHistory, age } = profile;
  
  if (familyHistory?.includes('colorectal') || (age >= 50 && riskScore >= 61)) {
    return 'High';
  }
  if (age >= 50 || riskScore >= 31) return 'Medium';
  return 'Low';
}

/**
 * Generate reasons why FIT test is recommended
 */
function getFITReasons(profile, riskScore) {
  const reasons = [];
  const { age, diet, alcohol, familyHistory } = profile;
  
  if (age >= 50) reasons.push('Standard colorectal screening age');
  if (familyHistory?.includes('colorectal')) reasons.push('Family history of colorectal cancer');
  if (diet && (diet.includes('processed') || diet.includes('red meat'))) {
    reasons.push('High dietary risk factors');
  }
  if (alcohol && !alcohol.includes('Never')) {
    reasons.push('Alcohol consumption increases risk');
  }
  
  return reasons;
}

/**
 * Determine if PSA test should be recommended
 */
function shouldRecommendPSA(profile, riskScore) {
  const { age, familyHistory } = profile;
  
  if (age >= 50 && age <= 70) return true;
  if (familyHistory?.includes('prostate')) return true;
  
  return false;
}

/**
 * Calculate PSA test priority based on risk factors
 */
function calculatePSAPriority(profile, riskScore) {
  const { familyHistory, age } = profile;
  
  if (familyHistory?.includes('prostate')) return 'High';
  if (age >= 50 && riskScore >= 61) return 'Medium';
  return 'Low';
}

/**
 * Generate reasons why PSA test is recommended
 */
function getPSAReasons(profile, riskScore) {
  const reasons = [];
  const { familyHistory, age } = profile;
  
  if (age >= 50) reasons.push('Men 50-70 should discuss PSA screening');
  if (familyHistory?.includes('prostate')) reasons.push('Family history of prostate cancer');
  
  return reasons;
}

/**
 * Determine if liver screening should be recommended
 */
function shouldRecommendLiverScreening(profile, riskScore) {
  const { alcohol } = profile;
  
  if (alcohol && (alcohol.includes('5+') || alcohol.includes('3-4'))) return true;
  
  return false;
}

/**
 * Calculate liver screening priority based on risk factors
 */
function calculateLiverScreeningPriority(profile, riskScore) {
  const { alcohol } = profile;
  
  if (alcohol?.includes('5+')) return 'High';
  if (alcohol?.includes('3-4')) return 'Medium';
  return 'Low';
}

/**
 * Determine if lung screening should be recommended
 */
function shouldRecommendLungScreening(profile, riskScore) {
  const { age, smoking } = profile;
  
  if (age >= 55 && age <= 74 && 
      smoking && (smoking.includes('Daily (11-20/day)') || smoking.includes('Daily (21+/day)'))) {
    return true;
  }
  
  return false;
}

module.exports = {
  generateScreeningRecommendations,
  extractUserProfile
};