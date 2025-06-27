// seedLifestyleQuiz.js
const mongoose = require('mongoose');
const LifestyleQuiz = require('../models/LifeStyleQuiz');
require('dotenv').config();

const lifestyleQuizData = {
  _id: 'lifestyle_quiz-v1',
  title: 'Cancer Risk Assessment - Lifestyle Quiz',
  description:
    'Comprehensive lifestyle assessment to calculate personalized cancer risk scores using a weighted multiplier system',
  version: 1,
  questions: [
    // ------- PRIMARY (×4) -------
    {
      id: 'q1',
      questionNumber: 1,
      text: 'What is your age group?',
      type: 'single_choice',
      isRequired: true,
      category: 'primary',
      multiplier: 4,
      displayData: { shortName: 'Age', icon: '👤' },
      options: [
        { id: 'a', text: 'Under 25', points: 0 },
        { id: 'b', text: '25-34', points: 2 },
        { id: 'c', text: '35-44', points: 4 },
        { id: 'd', text: '45-54', points: 6 },
        { id: 'e', text: '55-64', points: 8 },
        { id: 'f', text: '65+', points: 10 }
      ],
      rationale: 'Age is the strongest non-modifiable risk factor.'
    },
    {
      id: 'q2',
      questionNumber: 2,
      text: 'Have you personally had cancer before?',
      type: 'single_choice',
      isRequired: true,
      category: 'primary',
      multiplier: 4,
      displayData: { shortName: 'Previous Cancer', icon: '🏥' },
      options: [
        { id: 'a', text: 'No previous cancer', points: 0 },
        { id: 'b', text: 'Yes, treated successfully >5 yr ago', points: 6 },
        { id: 'c', text: 'Yes, treated successfully <5 yr ago', points: 8 },
        { id: 'd', text: 'Yes, currently receiving treatment', points: 10 }
      ],
      rationale: 'Past cancer significantly raises future risk.'
    },
    {
      id: 'q3',
      questionNumber: 3,
      text: 'Do you currently smoke cigarettes or use tobacco products?',
      type: 'single_choice',
      isRequired: true,
      category: 'primary',
      multiplier: 4,
      displayData: {
        shortName: 'Smoking',
        icon: '🚬',
        simulatorConfig: { leftLabel: 'Never', rightLabel: 'Heavy Daily' }
      },
      options: [
        { id: 'a', text: 'Never smoked', points: 0 },
        { id: 'b', text: 'Former smoker (>1 yr)', points: 3 },
        { id: 'c', text: 'Occasional smoker', points: 5 },
        { id: 'd', text: 'Daily (1-10/day)', points: 7 },
        { id: 'e', text: 'Daily (11-20/day)', points: 8 },
        { id: 'f', text: 'Daily (21+/day)', points: 10 }
      ],
      rationale: 'Smoking is the top modifiable cancer risk.'
    },
    {
      id: 'q4',
      questionNumber: 4,
      text: 'What is your Body Mass Index (BMI) category?',
      type: 'single_choice',
      subText: 'Provide height and weight to calculate BMI',
      isRequired: true,
      category: 'primary',
      multiplier: 4,
      displayData: {
        shortName: 'BMI',
        icon: '⚖️',
        simulatorConfig: { leftLabel: 'Normal', rightLabel: 'Obese' }
      },
      options: [
        { id: 'a', text: 'Underweight (<18.5)', points: 4 },
        { id: 'b', text: 'Normal (18.5-24.9)', points: 0 },
        { id: 'c', text: 'Overweight (25-29.9)', points: 6 },
        { id: 'd', text: 'Obese (≥30)', points: 10 }
      ],
      rationale: 'High BMI contributes to several cancers.'
    },
    {
      id: 'q5',
      questionNumber: 5,
      text: 'Has anyone in your immediate family had cancer?',
      type: 'single_choice',
      isRequired: true,
      category: 'primary',
      multiplier: 4,
      displayData: { shortName: 'Family History', icon: '🧬' },
      options: [
        { id: 'a', text: 'No family history', points: 0 },
        { id: 'b', text: 'Yes breast cancer', points: 10 },
        { id: 'c', text: 'Yes colorectal cancer', points: 10 },
        { id: 'd', text: 'Yes lung cancer', points: 8 },
        { id: 'e', text: 'Yes other cancer', points: 6 },
        { id: 'f', text: 'Not sure', points: 4 }
      ],
      rationale: 'Genetic predisposition affects risk.'
    },

    // ------- SECONDARY (×2) -------
    {
      id: 'q6',
      questionNumber: 6,
      text: 'How often do you consume alcoholic beverages?',
      type: 'single_choice',
      isRequired: true,
      category: 'secondary',
      multiplier: 2,
      displayData: {
        shortName: 'Alcohol',
        icon: '🍺',
        simulatorConfig: { leftLabel: 'Never', rightLabel: 'Regular' }
      },
      options: [
        { id: 'a', text: 'Never/Rarely', points: 0 },
        { id: 'b', text: '1-2 days/wk', points: 3 },
        { id: 'c', text: '3-4 days/wk', points: 7 },
        { id: 'd', text: '5+ days/wk', points: 10 }
      ],
      rationale: 'Frequent drinking elevates several cancer risks.'
    },
    {
      id: 'q7',
      questionNumber: 7,
      text: 'How many days per week are you active ≥30 min?',
      type: 'single_choice',
      isRequired: true,
      category: 'secondary',
      multiplier: 2,
      displayData: {
        shortName: 'Exercise',
        icon: '🏃',
        simulatorConfig: { leftLabel: 'Daily', rightLabel: 'Never' }
      },
      options: [
        { id: 'a', text: '0 days', points: 10 },
        { id: 'b', text: '1-2 days', points: 6 },
        { id: 'c', text: '3-5 days', points: 3 },
        { id: 'd', text: '6+ days', points: 0 }
      ],
      rationale: 'Inactivity raises cancer risk.'
    },
    {
      id: 'q8',
      questionNumber: 8,
      text: 'How often do you eat fruits and vegetables?',
      type: 'single_choice',
      isRequired: true,
      category: 'secondary',
      multiplier: 2,
      displayData: {
        shortName: 'Fruits/Veg',
        icon: '🥗',
        simulatorConfig: { leftLabel: '5+ daily', rightLabel: 'Rarely' }
      },
      options: [
        { id: 'a', text: 'Rarely (<1/day)', points: 10 },
        { id: 'b', text: '1-2 servings', points: 6 },
        { id: 'c', text: '3-4 servings', points: 3 },
        { id: 'd', text: '5+ servings', points: 0 }
      ],
      rationale: 'Not enough fibre raises cancer risk.'
    },
    {
      id: 'q9',
      questionNumber: 9,
      text: 'How often do you eat processed or red meat?',
      type: 'single_choice',
      isRequired: true,
      category: 'secondary',
      multiplier: 2,
      displayData: {
        shortName: 'Processed Meat',
        icon: '🍖',
        simulatorConfig: { leftLabel: 'Never', rightLabel: 'Daily' }
      },
      options: [
        { id: 'a', text: 'Daily', points: 10 },
        { id: 'b', text: '4-6×/wk', points: 6 },
        { id: 'c', text: '1-3×/wk', points: 3 },
        { id: 'd', text: 'Rarely/Never', points: 0 }
      ],
      rationale: 'High intake boosts colorectal cancer risk.'
    },

    // ------- TERTIARY (×1) -------
    {
      id: 'q10',
      questionNumber: 10,
      text: 'What is your gender?',
      type: 'single_choice',
      isRequired: true,
      category: 'tertiary',
      multiplier: 1,
      displayData: { shortName: 'Gender', icon: '⚧️' },
      options: [
        { id: 'a', text: 'Male', points: 0 },
        { id: 'b', text: 'Female', points: 0 },
        { id: 'c', text: 'Prefer not to say', points: 0 }
      ],
      rationale: 'Collected for demographic analysis only.'
    },
    {
      id: 'q11',
      questionNumber: 11,
      text: 'When did you last have recommended cancer screening?',
      type: 'single_choice',
      isRequired: true,
      category: 'tertiary',
      multiplier: 1,
      displayData: { shortName: 'Screening', icon: '🩺' },
      options: [
        { id: 'a', text: 'Never', points: 10 },
        { id: 'b', text: 'Overdue', points: 6 },
        { id: 'c', text: 'Up to date', points: 0 },
        { id: 'd', text: 'Not applicable', points: 0 }
      ],
      rationale: 'Screening enables early detection.'
    },
    {
      id: 'q12',
      questionNumber: 12,
      text: 'How often do you protect yourself from sun exposure?',
      type: 'single_choice',
      isRequired: true,
      category: 'tertiary',
      multiplier: 1,
      displayData: {
        shortName: 'Sun Protection',
        icon: '☀️',
        simulatorConfig: { leftLabel: 'Always', rightLabel: 'Never' }
      },
      options: [
        { id: 'a', text: 'Always', points: 0 },
        { id: 'b', text: 'Sometimes', points: 3 },
        { id: 'c', text: 'Rarely', points: 6 },
        { id: 'd', text: 'Never', points: 10 }
      ],
      rationale: 'UV exposure is a major cause of skin cancer.'
    },
    {
      id: 'q13',
      questionNumber: 13,
      text: 'How would you describe your sleep quality?',
      type: 'single_choice',
      isRequired: true,
      category: 'tertiary',
      multiplier: 1,
      displayData: {
        shortName: 'Sleep',
        icon: '😴',
        simulatorConfig: { leftLabel: 'Good', rightLabel: 'Chronic issues' }
      },
      options: [
        { id: 'a', text: 'Good (7-8 h)', points: 0 },
        { id: 'b', text: 'Occasionally poor', points: 3 },
        { id: 'c', text: 'Frequently poor', points: 6 },
        { id: 'd', text: 'Chronic problems', points: 10 }
      ],
      rationale: 'Poor sleep affects immune function.'
    },
    {
      id: 'q14',
      questionNumber: 14,
      text: 'How would you rate your stress levels?',
      type: 'single_choice',
      isRequired: true,
      category: 'tertiary',
      multiplier: 1,
      displayData: {
        shortName: 'Stress',
        icon: '😰',
        simulatorConfig: { leftLabel: 'Low', rightLabel: 'Chronic' }
      },
      options: [
        { id: 'a', text: 'Low', points: 0 },
        { id: 'b', text: 'Moderate', points: 3 },
        { id: 'c', text: 'High', points: 6 },
        { id: 'd', text: 'Chronic high', points: 10 }
      ],
      rationale: 'Chronic stress promotes inflammation.'
    }
  ],

  scoring: {
    maxBasePoints: 10,
    maxTotalPoints: 320, // 5×(10×4) + 4×(10×2) + 4×(10×1)
    categoryMultipliers: { primary: 4, secondary: 2, tertiary: 1 },
    riskLevels: [
      {
        level: 'LOW_RISK',
        label: 'Low Risk',
        percentageRange: '0-30%',
        color: '#059669',
        description: 'Your lifestyle supports good health.'
      },
      {
        level: 'MODERATE_RISK',
        label: 'Moderate Risk',
        percentageRange: '31-60%',
        color: '#D97706',
        description: 'Consider improving some lifestyle factors.'
      },
      {
        level: 'HIGH_RISK',
        label: 'High Risk',
        percentageRange: '61-100%',
        color: '#DC2626',
        description:
          'Multiple factors raise your cancer risk. Consult a healthcare provider.'
      }
    ]
  }
};

const seedLifestyleQuiz = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await LifestyleQuiz.deleteMany({});
    console.log('Cleared existing lifestyle quizzes');

    await new LifestyleQuiz(lifestyleQuizData).save();
    console.log('Lifestyle Quiz created successfully!');

    console.log('\n=== QUIZ SUMMARY ===');
    console.log(`Total Questions: ${lifestyleQuizData.questions.length}`);
    console.log(`Max Risk Score: ${lifestyleQuizData.scoring.maxTotalPoints}`);
    console.log(
      'Risk Levels:',
      lifestyleQuizData.scoring.riskLevels.map(r => r.label).join(', ')
    );

    const maxPossibleScore = lifestyleQuizData.questions.reduce(
      (sum, q) => sum + Math.max(...q.options.map(o => o.points)) * q.multiplier,
      0
    );
    console.log('Max Possible Score from Questions:', maxPossibleScore);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding lifestyle quiz:', err);
    process.exit(1);
  }
};

seedLifestyleQuiz();
