const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Get active quiz for public access
const getActiveQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$questions' },
      { $sample: { size: 10 } }, // randomly pick 10 questions
      {
        $group: {
          _id: '$_id',
          title: { $first: '$title' },
          version: { $first: '$version' },
          questions: { $push: '$questions' }
        }
      }
    ]);

    if (!quiz || quiz.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active quiz found'
      });
    }

    // Strip correct answers for public
    const publicQuiz = {
      _id: quiz[0]._id,
      title: quiz[0].title,
      version: quiz[0].version,
      questions: quiz[0].questions.map(q => ({
        id: q.id,
        text: q.text,
        options: q.options.map(opt => ({
          id: opt.id,
          text: opt.text
        }))
      }))
    };

    res.status(200).json({
      success: true,
      data: publicQuiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz'
    });
  }
};

// Submit quiz attempt (anonymous users allowed)
const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Get the quiz with correct answers
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Calculate score
    let totalScore = 0;
    let correctAnswers = 0;
    
    answers.forEach(answer => {
      const question = quiz.questions.find(q => q.id === answer.qid);
      if (question) {
        const selectedOption = question.options.find(opt => opt.id === answer.optionId);
        if (selectedOption && selectedOption.isCorrect) {
          totalScore += selectedOption.weight;
          correctAnswers++;
        }
      }
    });

    // Determine Knowledge Level based on score
    let knowledgeLevel;
      if (totalScore >= 80) {
        knowledgeLevel = 'High';
      } else if (totalScore >= 60) {
        knowledgeLevel = 'Medium';
      } else if (totalScore >= 40) {
        knowledgeLevel = 'Low';
      } else {
        knowledgeLevel = 'Very Low';
      }

    // Create quiz attempt
    const attempt = new QuizAttempt({
      quizId,
      userId: req.user ? req.user._id : null, // null for anonymous
      answers,
      score: totalScore,
      knowledgeLevel,
      ipAddress,
      userAgent
    });

    await attempt.save();

    // Return results with explanations
    const results = {
      score: totalScore,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      knowledgeLevel,
      explanations: quiz.questions
        .filter(q => answers.find(a => a.qid === q.id))
        .map(q => {
        const userAnswer = answers.find(a => a.qid === q.id);
        const selectedOption = userAnswer ? 
          q.options.find(opt => opt.id === userAnswer.optionId) : null;
        
        return {
          questionId: q.id,
          questionText: q.text,
          selectedAnswer: selectedOption ? selectedOption.text : 'Not answered',
          isCorrect: selectedOption ? selectedOption.isCorrect : false,
          explanation: q.explanation
        };
      })
    };

    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        attemptId: attempt._id,
        results
      }
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz attempt'
    });
  }
};

// Get quiz analytics (admin only)
const getQuizAnalytics = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get basic stats
    const totalAttempts = await QuizAttempt.countDocuments({ 
      quizId, 
      ...dateFilter 
    });

    const signedUpUsers = await QuizAttempt.countDocuments({ 
      quizId, 
      hasSignedUp: true,
      ...dateFilter 
    });

    // Get persona distribution
    const personaStats = await QuizAttempt.aggregate([
      { $match: { quizId, ...dateFilter } },
      { $group: { _id: '$knowledgeLevel', count: { $sum: 1 } } }
    ]);

    // Get average score
    const scoreStats = await QuizAttempt.aggregate([
      { $match: { quizId, ...dateFilter } },
      { 
        $group: { 
          _id: null, 
          avgScore: { $avg: '$score' },
          minScore: { $min: '$score' },
          maxScore: { $max: '$score' }
        } 
      }
    ]);

    // Get daily attempt counts
    const dailyStats = await QuizAttempt.aggregate([
      { $match: { quizId, ...dateFilter } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          attempts: { $sum: 1 },
          signups: { $sum: { $cond: ['$hasSignedUp', 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAttempts,
        signedUpUsers,
        conversionRate: totalAttempts > 0 ? (signedUpUsers / totalAttempts * 100).toFixed(2) : 0,
        personaDistribution: personaStats,
        scoreStatistics: scoreStats[0] || { avgScore: 0, minScore: 0, maxScore: 0 },
        dailyStats
      }
    });

  } catch (error) {
    console.error('Error getting quiz analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
};

// function to link knowledge score to userId if user chose to SignUp
const linkQuizToUser = async (req, res) => {
  try {
    const { attemptId } = req.body;
    const userId = req.user._id; //user id 

    const attempt = await QuizAttempt.findByIdAndUpdate(
      attemptId,
      {
        userId: userId,
        hasSignedUp: true,
        signUpDate: new Date()
      },
      { new: true }
    );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz linked to user successfully',
      data: {
        score: attempt.score,
        persona: attempt.persona
      }
    });

  } catch (error) {
    console.error('Error linking quiz to user:', error);
    res.status(500).json({
      success: false,
      message: 'Error linking quiz attempt'
    });
  }
};

// Create new quiz (admin only)
const createQuiz = async (req, res) => {
  try {
    const { _id, title, questions } = req.body;

    // Deactivate previous quizzes
    await Quiz.updateMany({}, { isActive: false });

    const quiz = new Quiz({
      _id,
      title,
      questions,
      isActive: true,
      createdBy: req.user ? req.user.name : 'Admin'
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });

  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating quiz'
    });
  }
};

module.exports = {
  getActiveQuiz,
  submitQuizAttempt,
  getQuizAnalytics,
  createQuiz,
  linkQuizToUser
};