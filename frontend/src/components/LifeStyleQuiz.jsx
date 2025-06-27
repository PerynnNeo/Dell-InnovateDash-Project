// frontend/src/components/LifestyleQuiz.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Loader2, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { getActiveLifestyleQuiz, submitLifestyleQuizAttempt } from '../api/lifeStyleQuizApi';
import '../styles/onboarding.css';

const LifestyleQuiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [categories, setCategories] = useState([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);

  // Fetch lifestyle quiz from backend
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await getActiveLifestyleQuiz();
        if (response.success) {
          setQuiz(response.data);
          // Group questions by category
          const grouped = response.data.questions.reduce((acc, q) => {
            acc[q.category] = acc[q.category] || [];
            acc[q.category].push(q);
            return acc;
          }, {});
          const categoryOrder = ['primary', 'secondary', 'tertiary'];
          const sortedCategories = categoryOrder
            .map(categoryName => ({
              name: categoryName,
              questions: grouped[categoryName] || [],
            }))
            .filter(c => c.questions.length > 0);
          setCategories(sortedCategories);
        } else {
          setError('Failed to load lifestyle quiz');
        }
      } catch (err) {
        console.error('Error fetching lifestyle quiz:', err);
        setError('Unable to load lifestyle quiz. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, []);

  const handleAnswerSelect = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const nextCategory = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
    }
  };

  const prevCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    try {
      setSubmitting(true);
      
      const formattedAnswers = Object.entries(answers).map(([qid, optionId]) => ({
        qid,
        optionId
      }));

      const response = await submitLifestyleQuizAttempt({
        quizId: quiz._id,
        answers: formattedAnswers
      });

      if (response.success) {
        setResults(response.data.results);
        setShowResults(true);
      } else {
        setError('Failed to submit lifestyle quiz');
      }
    } catch (err) {
      console.error('Error submitting lifestyle quiz:', err);
      setError('Unable to submit lifestyle quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const restartQuiz = () => {
    setCurrentCategoryIndex(0);
    setAnswers({});
    setResults(null);
    setShowResults(false);
    setError(null);
  };

  const getRiskTheme = (riskLevel) => {
    switch (riskLevel) {
      case 'LOW_RISK':
        return {
          icon: <CheckCircle className="w-16 h-16" style={{ color: '#f472b6' }} />,
          color: '#f472b6', // light pink
          background: '#f472b6',
        };
      case 'MODERATE_RISK':
        return {
          icon: <Shield className="w-16 h-16" style={{ color: '#b0004e' }} />,
          color: '#b0004e',
          background: 'linear-gradient(135deg, #f472b6, #b0004e)',
        };
      case 'HIGH_RISK':
        return {
          icon: <AlertTriangle className="w-16 h-16" style={{ color: '#b0004e' }} />,
          color: '#b0004e',
          background: 'linear-gradient(135deg, #b0004e, #6a0dad)',
        };
      default:
        return {
          icon: <Heart className="w-16 h-16" style={{ color: '#b0004e' }} />,
          color: '#b0004e',
          background: 'linear-gradient(135deg, #b0004e, #6a0dad)',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#fff8fc'}}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin" style={{color: '#b0004e'}} />
          <p className="mt-4" style={{color: '#2d2d2d'}}>Loading your Lifestyle Risk Assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#fff8fc'}}>
        <div className="onboarding-box w-full text-center">
          <div className="mb-4 inline-block">
            <Heart className="w-16 h-16" style={{ color: '#b0004e' }} />
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#b0004e' }}>Oops! Something went wrong.</h2>
          <p className="mb-6" style={{color: '#2d2d2d'}}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    const riskTheme = getRiskTheme(results.riskLevel);
    
    const isGradient = riskTheme.background.includes('gradient');
    const scoreStyle = isGradient
      ? {
          background: riskTheme.background,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          display: 'inline-block',
        }
      : {
          color: riskTheme.color,
        };

    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#fff8fc' }}>
        <div className="onboarding-box w-full">
          {/* Results Header */}
          <div className="text-center mb-8">
            <div className="mb-4 inline-block">
              {riskTheme.icon}
            </div>
            <h2 className="text-3xl font-bold" style={{ color: '#b0004e' }}>Assessment Complete!</h2>
            <p style={{ color: '#2d2d2d' }}>Your personalized cancer risk assessment</p>
          </div>

          {/* Risk Score */}
          <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#fce4ec' }}>
            <div className="text-center">
              <div
                className="text-5xl font-bold mb-2"
                style={scoreStyle}
              >
                {results.percentageScore}%
              </div>
              <p className="text-xl mb-2" style={{ color: '#2d2d2d' }}>Cancer Risk Score</p>
              <div
                className="inline-block px-4 py-2 rounded-full text-white font-semibold mb-4"
                style={{ background: riskTheme.background }}
              >
                {results.riskLabel}
              </div>
              <p style={{ color: '#2d2d2d' }}>
                {results.riskDescription}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="text-white p-6 rounded-lg mb-6" style={{ backgroundColor: '#b0004e' }}>
              <h3 className="text-xl font-bold mb-2">🎯 Secure Your Health with Early Screening</h3>
              <p className="opacity-90 mb-4">
                Finding cancer early usually means simpler treatment, lower costs, and far better survival—book your screening today.
              </p>
            </div>

            <div className="buttons">
               <button onClick={restartQuiz} className="btn">
                  Retake Assessment
                </button>
              <Link to="/dashboard" className="btn">
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz interface
  if (!quiz || !categories || categories.length === 0) return null;

  const currentCategory = categories[currentCategoryIndex];
  const progress = ((currentCategoryIndex + 1) / categories.length) * 100;
  const isLastCategory = currentCategoryIndex === categories.length - 1;
  const allQuestionsInCategoryAnswered = currentCategory.questions.every(
    (q) => answers[q.id]
  );
  const allQuestionsAnswered =
    quiz.questions.length === Object.keys(answers).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fff8fc' }}>
      <div className="onboarding-box">
        {/* Header */}
        <div className="quiz-header">
          <div className="quiz-header-top">
            <h1 className="quiz-title">{quiz.title}</h1>
            <span className="quiz-category-counter">
              Category {currentCategoryIndex + 1} of {categories.length}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Questions for the current category */}
        <div>
          {currentCategory.questions.map(currentQ => (
            <div key={currentQ.id} className="question" style={{ marginBottom: '24px' }}>
              <div className="flex items-center mb-4">
                {currentQ.icon && (
                  <span className="text-2xl mr-3">{currentQ.icon}</span>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold" style={{ color: '#b0004e' }}>
                    {currentQ.text}
                  </h2>
                  {currentQ.subText && (
                    <p className="text-sm" style={{ color: '#2d2d2d', marginTop: '8px' }}>{currentQ.subText}</p>
                  )}
                </div>
              </div>

              {/* Category Badge */}
              {/* <div className="mb-6">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: '#fce4ec',
                    color: '#b0004e',
                  }}
                >
                  {currentQ.category.charAt(0).toUpperCase() + currentQ.category.slice(1)} Factor
                </span>
              </div> */}

              {/* Options */}
              <div className="options">
                {currentQ.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(currentQ.id, option.id)}
                    className={`option${answers[currentQ.id] === option.id ? ' selected' : ''}`}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>


        {/* Navigation */}
        <div className="buttons">
          <button
            onClick={prevCategory}
            disabled={currentCategoryIndex === 0}
            className="btn"
            style={{ visibility: currentCategoryIndex === 0 ? 'hidden' : 'visible' }}
          >
            <ChevronLeft className="w-5 h-5" style={{ display: 'inline', verticalAlign: 'middle' }} />
            &nbsp;Previous
          </button>

          {isLastCategory ? (
            <button
              onClick={submitQuiz}
              disabled={!allQuestionsAnswered || submitting}
              className="btn"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" style={{ display: 'inline', verticalAlign: 'middle' }} />
                  &nbsp;Calculating...
                </>
              ) : (
                'Get My Risk Assessment'
              )}
            </button>
          ) : (
            <button
              onClick={nextCategory}
              disabled={!allQuestionsInCategoryAnswered}
              className="btn"
            >
              Next&nbsp;
              <ChevronRight className="w-5 h-5" style={{ display: 'inline', verticalAlign: 'middle' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LifestyleQuiz;