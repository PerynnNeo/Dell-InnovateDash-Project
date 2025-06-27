import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Brain, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { getActiveQuiz, submitQuizAttempt } from '../api/quizApi';
import '../styles/onboarding.css';

const KnowledgeQuiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await getActiveQuiz(); // already randomized 10 from backend
      if (response.success) {
        setQuiz(response.data);
      } else {
        setError('Failed to load quiz');
      }
    } catch (err) {
      setError('Unable to load quiz. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  const handleAnswerSelect = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    try {
      setSubmitting(true);

      const formattedAnswers = quiz.questions.map((q) => ({
        qid: q.id,
        optionId: answers[q.id],
      }));

      const allAnswered = formattedAnswers.every((ans) => ans.optionId !== undefined);
      if (!allAnswered) {
        setError('Please answer all 10 questions before submitting.');
        setSubmitting(false);
        return;
      }

      const response = await submitQuizAttempt({
        quizId: quiz._id,
        answers: formattedAnswers,
      });

      if (response.success) {
        localStorage.setItem('quizAttemptId', response.data.attemptId);
        setResults(response.data.results);
        setShowResults(true);
      } else {
        setError('Failed to submit quiz.');
      }
    } catch (err) {
      setError('Unable to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResults(null);
    setShowResults(false);
    setError(null);
    fetchQuiz();
  };

  const getScoreLevelColor = (score) => {
    if (score < 30) return 'bg-red-50 text-red-700 border border-red-200';
    if (score < 70) return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
    return 'bg-green-50 text-green-700 border border-green-200';
  };

  const progress = quiz ? ((currentQuestion + 1) / quiz.questions.length) * 100 : 0;
  const isLastQuestion = quiz && currentQuestion === quiz.questions.length - 1;
  const canProceed = answers[quiz?.questions[currentQuestion]?.id];
  const allQuestionsAnswered = quiz?.questions.every(q => answers[q.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#fff8fc'}}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin" style={{color: '#b0004e'}} />
          <p className="mt-4" style={{color: '#2d2d2d'}}>Loading your Cancer IQ Quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#fff8fc'}}>
        <div className="onboarding-box w-full text-center">
          <div className="mb-4 inline-block">
            <Brain className="w-16 h-16" style={{ color: '#b0004e' }} />
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
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#fff8fc' }}>
        <div className="onboarding-box w-full">
          <div className="text-center mb-8">
            <div className="mb-4 inline-block">
              <Brain className="w-16 h-16" style={{ color: '#b0004e' }}/>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: '#b0004e' }}>Quiz Complete!</h2>
          </div>

          <div className={`rounded-2xl px-6 py-8 mb-10 shadow-inner text-center ${getScoreLevelColor(results.score)}`}>
            <div className="text-6xl font-bold mb-2 tracking-tight">{results.score}</div>
            <p className="text-lg font-medium mb-2">Your Cancer Knowledge Score</p>
            <p className="text-sm">You got {results.correctAnswers} out of 10 questions correct</p>
          </div>

          <div className="text-white p-6 rounded-lg mb-8 text-center" style={{ background: 'linear-gradient(135deg, #b0004e, #8A2BE2)' }}>
              <h3 className="text-xl font-bold mb-2">🎯 Want to know YOUR actual cancer risk?</h3>
              <p className="opacity-90 mb-4 max-w-xl mx-auto">
                Get a personalized risk assessment based on your lifestyle, family history, and health habits — with practical tips to reduce your risk.
              </p>
              <Link to="/registerUser" className="inline-block bg-white font-bold px-6 py-3 rounded-lg transition-colors" style={{color: '#b0004e', boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)'}}>
                Take the Lifestyle Quiz
              </Link>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Review Your Answers</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.explanations
                .filter((exp) => exp.selectedAnswer && exp.selectedAnswer !== 'Not answered')
                .map((exp) => (
                  <div key={exp.questionId} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        exp.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {exp.isCorrect ? '✓' : '✗'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 mb-1">{exp.questionText}</p>
                        <p className="text-sm text-gray-600 mb-1">Your answer: {exp.selectedAnswer}</p>
                        <p className="text-sm text-gray-700">{exp.explanation}</p>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          <div className="buttons mt-8" style={{ justifyContent: 'center' }}>
            <button onClick={restartQuiz} className="btn">
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fff8fc' }}>
      <div className="onboarding-box">
        {/* Header */}
        <div className="border-b" style={{ borderColor: '#fce4ec', paddingBottom: '24px', marginBottom: '24px' }}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold" style={{ color: '#b0004e' }}>{quiz.title}</h1>
            <span className="text-sm" style={{ color: '#b0004e' }}>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full rounded-full h-2" style={{ backgroundColor: '#fce4ec' }}>
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: '#b0004e',
              }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div>
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#b0004e' }}>{currentQ.text}</h2>
          <div className="options">
            {currentQ.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(currentQ.id, option.id)}
                className={`option w-full text-left${answers[currentQ.id] === option.id ? ' selected' : ''}`}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="buttons">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="btn"
            style={{ visibility: currentQuestion === 0 ? 'hidden' : 'visible' }}
          >
            <ChevronLeft className="w-5 h-5" style={{ display: 'inline', verticalAlign: 'middle' }} />
            &nbsp;Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={submitQuiz}
              disabled={!allQuestionsAnswered || submitting}
              className="btn"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" style={{ display: 'inline', verticalAlign: 'middle' }} />
                  &nbsp;Submitting...
                </>
              ) : (
                'Get My Results'
              )}
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              disabled={!canProceed}
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

export default KnowledgeQuiz;