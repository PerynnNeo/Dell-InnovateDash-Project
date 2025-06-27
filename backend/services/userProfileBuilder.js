const LifestyleQuizAttempt = require('../models/LifeStyleQuizAttempt');
const QuizAttempt = require('../models/QuizAttempt');
const LifestyleQuiz = require('../models/LifeStyleQuiz');

async function getUserProfileForChat(userId) {
  try {
    console.log('Building profile for user:', userId);
    
    const [latestLifestyle, latestKnowledge] = await Promise.all([
      LifestyleQuizAttempt.findOne({ userId }).sort({ createdAt: -1 }),
      QuizAttempt.findOne({ userId }).sort({ createdAt: -1 })
    ]);

    console.log('Found lifestyle attempt:', latestLifestyle ? 'Yes' : 'No');
    console.log('Found knowledge attempt:', latestKnowledge ? 'Yes' : 'No');

    if (!latestLifestyle && !latestKnowledge) {
      console.log('No quiz data found for user');
      return null;
    }

    const profile = {
      hasLifestyleData: !!latestLifestyle,
      hasKnowledgeData: !!latestKnowledge,
      lastQuizDate: latestLifestyle?.createdAt || latestKnowledge?.createdAt
    };

    if (latestLifestyle) {
      profile.riskLevel = latestLifestyle.riskLevel;
      profile.riskFactors = extractRiskFactors(latestLifestyle);
      profile.categoryBreakdown = latestLifestyle.categoryBreakdown;
      profile.percentageScore = latestLifestyle.percentageScore;
      
      console.log('Lifestyle profile:', {
        riskLevel: profile.riskLevel,
        riskFactors: profile.riskFactors,
        percentageScore: profile.percentageScore
      });
    }

    if (latestKnowledge) {
      profile.knowledgeLevel = latestKnowledge.knowledgeLevel;
      profile.knowledgeScore = latestKnowledge.score;
      
      console.log('Knowledge profile:', {
        knowledgeLevel: profile.knowledgeLevel,
        knowledgeScore: profile.knowledgeScore
      });
    }

    console.log('Final profile:', profile);
    return profile;
  } catch (error) {
    console.error('Error building user profile for chat:', error);
    return null;
  }
}

function extractRiskFactors(lifestyleAttempt) {
  const riskFactors = [];
  
  console.log('Extracting risk factors from attempt:', lifestyleAttempt._id);
  console.log('Answers count:', lifestyleAttempt.answers.length);
  
  // Extract specific risk factors from answers
  lifestyleAttempt.answers.forEach(answer => {
    const questionId = answer.qid;
    console.log(`Question ${questionId}: points = ${answer.points}`);
    
    // Map question IDs to risk factors
    switch (questionId) {
      case 'q1': // Age
        if (answer.points >= 6) riskFactors.push('Older age');
        break;
      case 'q2': // Previous cancer
        if (answer.points > 0) riskFactors.push('Previous cancer history');
        break;
      case 'q3': // Smoking
        if (answer.points >= 5) riskFactors.push('Smoking');
        break;
      case 'q4': // BMI
        if (answer.points >= 6) riskFactors.push('High BMI');
        break;
      case 'q5': // Family history
        if (answer.points >= 6) riskFactors.push('Family cancer history');
        break;
      case 'q6': // Alcohol
        if (answer.points >= 7) riskFactors.push('High alcohol consumption');
        break;
      case 'q7': // Exercise
        if (answer.points >= 6) riskFactors.push('Low physical activity');
        break;
      case 'q8': // Diet
        if (answer.points >= 6) riskFactors.push('Low fruit/vegetable intake');
        break;
      case 'q9': // Processed meat
        if (answer.points >= 6) riskFactors.push('High processed meat consumption');
        break;
      case 'q11': // Screening
        if (answer.points >= 6) riskFactors.push('Overdue for screening');
        break;
      case 'q12': // Sun protection
        if (answer.points >= 6) riskFactors.push('Inadequate sun protection');
        break;
      case 'q13': // Sleep
        if (answer.points >= 6) riskFactors.push('Poor sleep quality');
        break;
      case 'q14': // Stress
        if (answer.points >= 6) riskFactors.push('High stress levels');
        break;
    }
  });

  console.log('Extracted risk factors:', riskFactors);
  return riskFactors;
}

function generatePersonalizedRecommendations(profile) {
  const recommendations = [];

  if (!profile) return recommendations;

  console.log('Generating recommendations for profile:', profile.riskLevel);

  // Risk-based recommendations
  if (profile.riskLevel === 'HIGH_RISK') {
    recommendations.push('Consider consulting a healthcare provider for personalized screening plan');
    recommendations.push('Focus on modifiable risk factors like smoking cessation and diet');
  } else if (profile.riskLevel === 'MODERATE_RISK') {
    recommendations.push('Continue healthy habits and consider regular screening');
  } else if (profile.riskLevel === 'LOW_RISK') {
    recommendations.push('Maintain your healthy lifestyle and stay up-to-date with screenings');
  }

  // Factor-specific recommendations
  if (profile.riskFactors && profile.riskFactors.includes('Smoking')) {
    recommendations.push('Smoking cessation programs can significantly reduce your cancer risk');
  }
  if (profile.riskFactors && profile.riskFactors.includes('High BMI')) {
    recommendations.push('Weight management through diet and exercise can lower cancer risk');
  }
  if (profile.riskFactors && profile.riskFactors.includes('Overdue for screening')) {
    recommendations.push('Schedule your overdue cancer screenings as soon as possible');
  }

  console.log('Generated recommendations:', recommendations);
  return recommendations;
}

module.exports = {
  getUserProfileForChat,
  extractRiskFactors,
  generatePersonalizedRecommendations
}; 