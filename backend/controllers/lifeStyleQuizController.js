// backend/controllers/lifestyleQuizController.js
const LifestyleQuiz = require('../models/LifeStyleQuiz');
const LifestyleQuizAttempt = require('../models/LifeStyleQuizAttempt');

// Get active lifestyle quiz for authenticated users
const getActiveLifestyleQuiz = async (req, res) => {
  try {
    const quiz = await LifestyleQuiz.findOne().sort({ createdAt: -1 });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'No lifestyle quiz found'
      });
    }

    // Return quiz without points for security (users shouldn't see scoring)
    const publicQuiz = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      version: quiz.version,
      questions: quiz.questions.map(q => ({
        id: q.id,
        questionNumber: q.questionNumber,
        text: q.text,
        type: q.type,
        subText: q.subText,
        icon: q.icon,
        isRequired: q.isRequired,
        category: q.category,
        options: q.options.map(opt => ({
          id: opt.id,
          text: opt.text
          // Don't include points
        }))
      }))
    };

    res.status(200).json({
      success: true,
      data: publicQuiz
    });
  } catch (error) {
    console.error('Error fetching lifestyle quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lifestyle quiz'
    });
  }
};

// Submit lifestyle quiz attempt (authenticated users only)
const submitLifestyleQuizAttempt = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.user._id; // From auth middleware

    // Get the full quiz with scoring data
    const quiz = await LifestyleQuiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Lifestyle quiz not found'
      });
    }

    // Calculate detailed scores
    let totalScore = 0;
    let categoryScores = {
      primary: { score: 0, maxScore: 0 },
      secondary: { score: 0, maxScore: 0 },
      tertiary: { score: 0, maxScore: 0 }
    };

    const processedAnswers = answers.map(answer => {
      const question = quiz.questions.find(q => q.id === answer.qid);
      if (!question) {
        throw new Error(`Question ${answer.qid} not found`);
      }

      const selectedOption = question.options.find(opt => opt.id === answer.optionId);
      if (!selectedOption) {
        throw new Error(`Option ${answer.optionId} not found for question ${answer.qid}`);
      }

      const categoryScore = selectedOption.points * question.multiplier;
      totalScore += categoryScore;

      // Add to category breakdown
      categoryScores[question.category].score += categoryScore;

      return {
        qid: answer.qid,
        optionId: answer.optionId,
        points: selectedOption.points,
        multiplier: question.multiplier,
        categoryScore: categoryScore
      };
    });

    // Calculate max possible scores for each category
    quiz.questions.forEach(question => {
      const maxPoints = Math.max(...question.options.map(opt => opt.points));
      const maxCategoryScore = maxPoints * question.multiplier;
      categoryScores[question.category].maxScore += maxCategoryScore;
    });

    // Calculate percentage
    const maxPossibleScore = quiz.scoring.maxTotalPoints;
    const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);

    // Determine risk level based on percentage
    let riskLevel = 'LOW_RISK';
    let riskData = quiz.scoring.riskLevels[0]; // default to first (LOW_RISK)

    for (const level of quiz.scoring.riskLevels) {
      const [min, max] = level.percentageRange.split('-').map(s => parseInt(s.replace('%', '')));
      if (percentageScore >= min && percentageScore <= max) {
        riskLevel = level.level;
        riskData = level;
        break;
      }
    }

    // Create lifestyle quiz attempt
    const attempt = new LifestyleQuizAttempt({
      quizId,
      userId,
      answers: processedAnswers,
      totalScore,
      maxPossibleScore,
      percentageScore,
      riskLevel,
      riskData: {
        level: riskData.level,
        label: riskData.label,
        percentageRange: riskData.percentageRange,
        color: riskData.color,
        description: riskData.description
      },
      categoryBreakdown: categoryScores
    });

    await attempt.save();

    // Return results (percentage and risk level only)
    const results = {
      percentageScore,
      riskLevel: riskData.level,
      riskLabel: riskData.label,
      riskDescription: riskData.description,
      riskColor: riskData.color,
      categoryBreakdown: {
        primary: {
          score: categoryScores.primary.score,
          maxScore: categoryScores.primary.maxScore,
          percentage: Math.round((categoryScores.primary.score / categoryScores.primary.maxScore) * 100)
        },
        secondary: {
          score: categoryScores.secondary.score,
          maxScore: categoryScores.secondary.maxScore,
          percentage: Math.round((categoryScores.secondary.score / categoryScores.secondary.maxScore) * 100)
        },
        tertiary: {
          score: categoryScores.tertiary.score,
          maxScore: categoryScores.tertiary.maxScore,
          percentage: Math.round((categoryScores.tertiary.score / categoryScores.tertiary.maxScore) * 100)
        }
      }
    };

    res.status(201).json({
      success: true,
      message: 'Lifestyle quiz submitted successfully',
      data: {
        attemptId: attempt._id,
        results
      }
    });

  } catch (error) {
    console.error('Error submitting lifestyle quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting lifestyle quiz attempt'
    });
  }
};

// Get user's lifestyle quiz attempts
const getUserLifestyleQuizAttempts = async (req, res) => {
  try {
    const userId = req.user._id;

    const attempts = await LifestyleQuizAttempt.find({ userId })
      .sort({ createdAt: -1 })
      .select('-answers') // Don't return detailed answers
      .limit(10);

    res.status(200).json({
      success: true,
      data: attempts
    });

  } catch (error) {
    console.error('Error fetching user lifestyle quiz attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz attempts'
    });
  }
};

module.exports = {
  getActiveLifestyleQuiz,
  submitLifestyleQuizAttempt,
  getUserLifestyleQuizAttempts
};