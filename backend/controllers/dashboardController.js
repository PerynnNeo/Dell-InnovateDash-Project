'use strict';

const LifestyleQuizAttempt = require('../models/LifeStyleQuizAttempt');
const LifestyleQuiz        = require('../models/LifeStyleQuiz');

/* ---------------- UI TEXT ---------------- */
const UI_TEXT = {
  title:             'MY CANCER RISK',
  riskBreakdownTitle: 'Risk Breakdown:',
  primaryButton:      'Try Risk Simulator',
  secondaryButton:    'Book Screening'
};

/* --------------- RISK COLORS -------------- */
const RISK_COLORS = {
  LOW_RISK: {
    primary: '#059669',
    light:   '#ECFDF5',
    border:  '#A7F3D0',
    hover:   '#047857'
  },
  MODERATE_RISK: {
    primary: '#D97706',
    light:   '#FFF7ED',
    border:  '#FED7AA',
    hover:   '#B45309'
  },
  HIGH_RISK: {
    primary: '#DC2626',
    light:   '#FEF2F2',
    border:  '#FECACA',
    hover:   '#B91C1C'
  }
};

/* ----------- HELPER FUNCTIONS ------------ */
const getUrgencyMessage = (riskLevel) => {
  switch (riskLevel) {
    case 'LOW_RISK':      return 'Maintain healthy habits and do regular screening.';
    case 'MODERATE_RISK': return 'Clean up a few habits and keep screening; early catch is half the battle.';
    case 'HIGH_RISK':     return 'Book a screening ASAP. Early catch means easier treatment.';
    default:              return 'Book a screening ASAP. Early catch means easier treatment.';
  }
};

const getSeverity = (impactScore) => {
  if (impactScore >= 28) return 'high';   // 7–10 points × 4
  if (impactScore >= 12) return 'medium'; // 6 points × 2 or 3–6 × 4
  return 'low';
};

const extractUserProfile = (answers, quiz) => {
  let age = null;
  let gender = null;

  answers.forEach((answer) => {
    const question       = quiz.questions.find((q) => q.id === answer.qid);
    const selectedOption = question?.options.find((opt) => opt.id === answer.optionId);
    if (!question || !selectedOption) return;

    if (answer.qid === 'q1')  age    = selectedOption.text; // age group
    if (answer.qid === 'q10') gender = selectedOption.text; // gender
  });

  return { age, gender };
};

/* --------- BUILD RISK BREAKDOWN ---------- */
const buildRiskBreakdown = (answers, quiz) => {
  const riskFactors = [];
  const maxTotalRiskScore = quiz.scoring.maxTotalPoints;

  // Debug logging
  console.log('=== BUILDING RISK BREAKDOWN ===');
  console.log('Total answers:', answers.length);
  console.log('Max total score:', maxTotalRiskScore);

  answers.forEach((answer) => {
    const question = quiz.questions.find((q) => q.id === answer.qid);
    const selectedOption = question?.options.find((opt) => opt.id === answer.optionId);

    if (question && selectedOption && question.displayData) {
      const score = answer.categoryScore || 0;
      const percentage = Math.round((score / maxTotalRiskScore) * 100);

      // Debug each factor
      console.log(`Question ${answer.qid} (${question.displayData.shortName}):`, {
        score: score,
        percentage: percentage,
        selectedOption: selectedOption.text,
        hasDisplayData: !!question.displayData
      });

      // ONLY include factors with score > 0 (non-zero risk factors) for Section 1
      if (score > 0) {
        riskFactors.push({
          id: answer.qid,
          icon: question.displayData.icon,
          name: question.displayData.shortName,
          points: score,
          percentage,
          description: selectedOption.text,
          severity: getSeverity(score),
          rationale: question.rationale,
          isModifiable: question.displayData.simulatorConfig ? true : false
        });
        console.log(`✅ Added factor: ${question.displayData.shortName} (+${score})`);
      } else {
        console.log(`❌ Skipped factor: ${question.displayData.shortName} (score: ${score})`);
      }
    } else {
      console.log(`⚠️ Missing data for question ${answer.qid}:`, {
        hasQuestion: !!question,
        hasSelectedOption: !!selectedOption,
        hasDisplayData: question?.displayData ? true : false
      });
    }
  });

  console.log(`Final risk factors count: ${riskFactors.length}`);
  console.log('Risk factors:', riskFactors.map(f => `${f.name}: +${f.points}`));

  // Sort by score (highest first) and return only non-zero factors for Section 1
  return riskFactors.sort((a, b) => b.points - a.points);
};

/* -------- BUILD ALL MODIFIABLE FACTORS -------- */
const buildAllModifiableFactors = (answers, quiz) => {
  const modifiableFactors = [];
  const maxTotalRiskScore = quiz.scoring.maxTotalPoints;

  // Define modifiable question IDs
  const MODIFIABLE_QUESTIONS = ['q3', 'q4', 'q6', 'q7', 'q8', 'q9', 'q12', 'q13', 'q14'];

  MODIFIABLE_QUESTIONS.forEach(questionId => {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question || !question.displayData) return;

    // Find user's answer for this question
    const userAnswer = answers.find((answer) => answer.qid === questionId);
    const selectedOption = userAnswer ? question.options.find((opt) => opt.id === userAnswer.optionId) : null;
    
    const score = userAnswer ? userAnswer.categoryScore || 0 : 0;
    const percentage = Math.round((score / maxTotalRiskScore) * 100);
    const description = selectedOption ? selectedOption.text : 'Not specified';

    modifiableFactors.push({
      id: questionId,
      icon: question.displayData.icon,
      name: question.displayData.shortName,
      points: score,
      percentage,
      description: description,
      rationale: question.rationale,
      simulatorConfig: question.displayData.simulatorConfig,
      basePoints: selectedOption ? selectedOption.points : 0,
      multiplier: question.multiplier,
      options: question.options
    });
  });

  return modifiableFactors.sort((a, b) => b.points - a.points);
};

/* -------- BUILD NON-MODIFIABLE FACTORS -------- */
const buildNonModifiableFactors = (answers, quiz) => {
  const nonModifiableFactors = [];
  const maxTotalRiskScore = quiz.scoring.maxTotalPoints;

  // Define non-modifiable question IDs (age, family history, previous cancer, etc.)
  const NON_MODIFIABLE_QUESTIONS = ['q1', 'q2', 'q5', 'q10', 'q11'];

  NON_MODIFIABLE_QUESTIONS.forEach(questionId => {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question || !question.displayData) return;

    // Find user's answer for this question
    const userAnswer = answers.find((answer) => answer.qid === questionId);
    const selectedOption = userAnswer ? question.options.find((opt) => opt.id === userAnswer.optionId) : null;
    
    const score = userAnswer ? userAnswer.categoryScore || 0 : 0;
    const percentage = Math.round((score / maxTotalRiskScore) * 100);
    const description = selectedOption ? selectedOption.text : 'Not specified';

    nonModifiableFactors.push({
      id: questionId,
      icon: question.displayData.icon,
      name: question.displayData.shortName,
      points: score,
      percentage,
      description: description,
      rationale: question.rationale,
      basePoints: selectedOption ? selectedOption.points : 0,
      multiplier: question.multiplier
    });
  });

  return nonModifiableFactors.sort((a, b) => b.points - a.points);
};

/* -------- GET DASHBOARD RISK DATA -------- */
const getDashboardRiskData = async (req, res) => {
  try {
    const userId = req.user._id;

    // latest attempt
    const latestAttempt = await LifestyleQuizAttempt
      .findOne({ userId })
      .sort({ createdAt: -1 });

    if (!latestAttempt) {
      return res.status(200).json({
        success:     true,
        hasQuizData: false,
        message:     'Complete your lifestyle assessment to see your personalized risk data',
        data:        { uiText: UI_TEXT }
      });
    }

    // quiz structure
    const quiz = await LifestyleQuiz.findById(latestAttempt.quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz data not found' });
    }

    // Debug the attempt data
    console.log('=== DASHBOARD DATA DEBUG ===');
    console.log('User ID:', userId);
    console.log('Latest attempt:', {
      id: latestAttempt._id,
      totalScore: latestAttempt.totalScore,
      percentageScore: latestAttempt.percentageScore,
      riskLevel: latestAttempt.riskLevel,
      answersCount: latestAttempt.answers.length
    });

    // profile + breakdown
    const { age, gender } = extractUserProfile(latestAttempt.answers, quiz);
    const riskBreakdown   = buildRiskBreakdown(latestAttempt.answers, quiz);
    const modifiableFactors = buildAllModifiableFactors(latestAttempt.answers, quiz);
    const nonModifiableFactors = buildNonModifiableFactors(latestAttempt.answers, quiz);
    const riskColors      = RISK_COLORS[latestAttempt.riskLevel] || RISK_COLORS.HIGH_RISK;

    const dashboardData = {
      userProfile: {
        name:   req.user.name,
        age:    age    || 'Unknown',
        gender: gender || 'Unknown'
      },
      riskScore: {
        current:     latestAttempt.totalScore,
        maximum:     latestAttempt.maxPossibleScore,
        level:       latestAttempt.riskData.label.toUpperCase(),
        percentage:  latestAttempt.percentageScore
      },
      riskBreakdown,
      modifiableFactors,
      nonModifiableFactors,
      colors: {
        highRisk:     RISK_COLORS.HIGH_RISK,
        moderateRisk: RISK_COLORS.MODERATE_RISK,
        lowRisk:      RISK_COLORS.LOW_RISK
      },
      uiText: {
        ...UI_TEXT,
        urgencyMessage: getUrgencyMessage(latestAttempt.riskLevel)
      }
    };

    console.log('=== FINAL DASHBOARD DATA ===');
    console.log('Risk breakdown count:', riskBreakdown.length);
    console.log('=== END DEBUG ===');

    return res.status(200).json({
      success:     true,
      hasQuizData: true,
      data:        dashboardData
    });
  } catch (err) {
    console.error('Error fetching dashboard risk data:', err);
    return res.status(500).json({ success: false, message: 'Error fetching dashboard data' });
  }
};

/* -------------- EXPORTS ------------------ */
module.exports = { getDashboardRiskData };