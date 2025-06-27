import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, TrendingUp, ChevronRight, Activity, Target, Loader2, RefreshCw, ArrowRight, RotateCcw } from 'lucide-react';
import Header from './Header';
import { getDashboardRiskData } from '../api/dashboardApi';
import '../styles/styles.css';
import '../styles/dashboard.css';
import { PDFDownloadLink } from '@react-pdf/renderer';
import LifestylePlanPdf from './LifestylePlanPdf';

const CancerRiskHelpers = {
  getRiskColors: (level, colors) => {
    switch(level) {
      case "HIGH RISK": 
      case "HIGH_RISK":
        return { 
          primary: "#b0004e", 
          light: "rgba(176, 0, 78, 0.1)", 
          border: "rgba(176, 0, 78, 0.2)", 
          hover: "#6a0dad" 
        };
      case "MODERATE RISK": 
      case "MODERATE_RISK":
        return { 
          primary: "#d946ef",
          light: "rgba(217, 70, 239, 0.1)", 
          border: "rgba(217, 70, 239, 0.2)", 
          hover: "#b0004e" 
        };
      case "LOW RISK": 
      case "LOW_RISK":
        return { 
          primary: "#e73a8c",
          light: "rgba(244, 114, 182, 0.1)", 
          border: "rgba(244, 114, 182, 0.2)", 
          hover: "#ec4899" 
        };
      default: 
        return { 
          primary: "#b0004e", 
          light: "rgba(176, 0, 78, 0.1)", 
          border: "rgba(176, 0, 78, 0.2)", 
          hover: "#6a0dad" 
        };
    }
  }
};

// Questions that can be modified in the simulator (exclude age, family history, previous cancer, etc.)
const MODIFIABLE_QUESTIONS = [
  'q3', // Smoking (0-10 points, multiplier 4)
  'q4', // BMI (0-10 points, multiplier 4) 
  'q6', // Alcohol (0-10 points, multiplier 2)
  'q7', // Exercise (0-10 points, multiplier 2)
  'q8', // Fruits/Veg (0-10 points, multiplier 2)
  'q9', // Processed Meat (0-10 points, multiplier 2)
  'q12', // Sun Protection (0-10 points, multiplier 1)
  'q13', // Sleep (0-10 points, multiplier 1)
  'q14'  // Stress (0-10 points, multiplier 1)
];

// Question configurations for sliders
const QUESTION_CONFIGS = {
  'q3': { // Smoking
    min: 0, max: 10, multiplier: 4,
    labels: { left: 'Never smoked', right: 'Daily (21+/day)' }
  },
  'q4': { // BMI
    min: 0, max: 10, multiplier: 4,
    labels: { left: 'Normal (18.5-24.9)', right: 'Obese (≥30)' }
  },
  'q6': { // Alcohol
    min: 0, max: 10, multiplier: 2,
    labels: { left: 'Never/Rarely', right: '5+ days/wk' }
  },
  'q7': { // Exercise
    min: 0, max: 10, multiplier: 2,
    labels: { left: '6+ days', right: '0 days' }
  },
  'q8': { // Fruits/Veg
    min: 0, max: 10, multiplier: 2,
    labels: { left: '5+ servings', right: 'Rarely (<1/day)' }
  },
  'q9': { // Processed Meat
    min: 0, max: 10, multiplier: 2,
    labels: { left: 'Rarely/Never', right: 'Daily' }
  },
  'q12': { // Sun Protection
    min: 0, max: 10, multiplier: 1,
    labels: { left: 'Always', right: 'Never' }
  },
  'q13': { // Sleep
    min: 0, max: 10, multiplier: 1,
    labels: { left: 'Good (7-8 h)', right: 'Chronic problems' }
  },
  'q14': { // Stress
    min: 0, max: 10, multiplier: 1,
    labels: { left: 'Low', right: 'Chronic high' }
  }
};

const RiskSimulator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data from backend
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasQuizData, setHasQuizData] = useState(false);

  // Simulator state
  const [currentRiskScore, setCurrentRiskScore] = useState(0);
  const [simulatedRiskScore, setSimulatedRiskScore] = useState(0);
  const [currentRiskLevel, setCurrentRiskLevel] = useState('');
  const [simulatedRiskLevel, setSimulatedRiskLevel] = useState('');
  const [modifiableFactors, setModifiableFactors] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardRiskData();
      
      if (response.success) {
        setHasQuizData(response.hasQuizData);
        if (response.hasQuizData && response.data) {
          setDashboardData(response.data);
          
          // Use modifiable factors from backend
          const modifiableFactors = response.data.modifiableFactors || [];
          
          // Transform the data to include slider values
          const transformedFactors = modifiableFactors.map(factor => ({
            ...factor,
            currentValue: factor.basePoints,
            simulatedValue: factor.basePoints,
            sliderValue: factor.basePoints
          }));
          
          setModifiableFactors(transformedFactors);

          // Set initial risk scores - both should be the same initially
          const initialRisk = response.data.riskScore?.percentage || 0;
          setCurrentRiskScore(initialRisk);
          setSimulatedRiskScore(initialRisk);
          setCurrentRiskLevel(response.data.riskScore?.level || 'UNKNOWN');
          setSimulatedRiskLevel(response.data.riskScore?.level || 'UNKNOWN');
        }
      } else {
        setError(response.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to get factor information
  const getFactorIcon = (questionId) => {
    const icons = {
      'q3': '🚬', 'q4': '⚖️', 'q6': '🍺', 'q7': '🏃', 
      'q8': '🥗', 'q9': '🍖', 'q12': '☀️', 'q13': '😴', 'q14': '😰'
    };
    return icons[questionId] || '📊';
  };

  const getFactorName = (questionId) => {
    const names = {
      'q3': 'Smoking', 'q4': 'BMI', 'q6': 'Alcohol', 'q7': 'Exercise',
      'q8': 'Fruits/Veg', 'q9': 'Processed Meat', 'q12': 'Sun Protection',
      'q13': 'Sleep', 'q14': 'Stress'
    };
    return names[questionId] || 'Unknown Factor';
  };

  const getDefaultDescription = (questionId) => {
    const descriptions = {
      'q3': 'Never smoked',
      'q4': 'Normal (18.5-24.9)',
      'q6': 'Never/Rarely',
      'q7': '6+ days',
      'q8': '5+ servings',
      'q9': 'Rarely/Never',
      'q12': 'Always',
      'q13': 'Good (7-8 h)',
      'q14': 'Low'
    };
    return descriptions[questionId] || 'Not specified';
  };

  const getFactorRationale = (questionId) => {
    const rationales = {
      'q3': 'Smoking is the top modifiable cancer risk.',
      'q4': 'High BMI contributes to several cancers.',
      'q6': 'Frequent drinking elevates several cancer risks.',
      'q7': 'Inactivity raises cancer risk.',
      'q8': 'Not enough fibre raises cancer risk.',
      'q9': 'High intake boosts colorectal cancer risk.',
      'q12': 'UV exposure is a major cause of skin cancer.',
      'q13': 'Poor sleep affects immune function.',
      'q14': 'Chronic stress promotes inflammation.'
    };
    return rationales[questionId] || 'This factor may affect your cancer risk.';
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Animation effect for risk score
  useEffect(() => {
    if (dashboardData && hasQuizData) {
      const timer1 = setTimeout(() => {
        setIsLoaded(true);
        let current = 0;
        const target = currentRiskScore;
        const increment = target / 30;
        const scoreAnimation = setInterval(() => {
          current += increment;
          if (current >= target) {
            setCurrentRiskScore(target);
            clearInterval(scoreAnimation);
            setTimeout(() => setProgressWidth(target), 200);
          } else {
            setCurrentRiskScore(Math.floor(current));
          }
        }, 50);
      }, 300);
      
      return () => clearTimeout(timer1);
    }
  }, [dashboardData, hasQuizData]);

  // Calculate simulated risk when factors change
  useEffect(() => {
    if (modifiableFactors.length > 0) {
      // Calculate baseline risk from non-modifiable factors
      const nonModifiableFactors = dashboardData?.nonModifiableFactors || [];
      const baselineRisk = nonModifiableFactors.reduce((sum, factor) => {
        return sum + factor.points;
      }, 0);
      
      // Calculate current modifiable factors contribution
      let currentModifiablePoints = 0;
      modifiableFactors.forEach(factor => {
        const multiplier = factor.multiplier || 1;
        const weightedPoints = factor.currentValue * multiplier;
        currentModifiablePoints += weightedPoints;
      });
      
      // Calculate simulated modifiable factors contribution
      let simulatedModifiablePoints = 0;
      modifiableFactors.forEach(factor => {
        const multiplier = factor.multiplier || 1;
        const weightedPoints = factor.simulatedValue * multiplier;
        simulatedModifiablePoints += weightedPoints;
      });
      
      // Calculate total simulated points: baseline + simulated modifiable
      const totalSimulatedPoints = baselineRisk + simulatedModifiablePoints;
      
      // Convert to percentage
      const maxPossiblePoints = 320; // From the quiz scoring system
      const newSimulatedRisk = Math.max(0, Math.min(100, (totalSimulatedPoints / maxPossiblePoints) * 100));
      setSimulatedRiskScore(Math.round(newSimulatedRisk));
      
      // Determine risk level
      let newRiskLevel = 'LOW_RISK';
      if (newSimulatedRisk > 60) {
        newRiskLevel = 'HIGH_RISK';
      } else if (newSimulatedRisk > 30) {
        newRiskLevel = 'MODERATE_RISK';
      }
      setSimulatedRiskLevel(newRiskLevel);
    }
  }, [modifiableFactors, dashboardData]);

  // Handle slider change
  const handleSliderChange = (factorId, newValue) => {
    setModifiableFactors(prev => prev.map(factor => 
      factor.id === factorId 
        ? { ...factor, simulatedValue: newValue, sliderValue: newValue }
        : factor
    ));
  };

  // Reset all sliders to current values
  const resetSimulation = () => {
    setModifiableFactors(prev => prev.map(factor => ({
      ...factor,
      simulatedValue: factor.currentValue,
      sliderValue: factor.currentValue
    })));
  };

  // Loading state
  if (loading) {
    return (
      <div className="cancer-risk-card">
        <div className="risk-content" style={{ padding: '3rem', textAlign: 'center' }}>
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Risk Simulator</h3>
          <p className="text-gray-500">Preparing your interactive risk assessment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="cancer-risk-card">
        <div className="risk-content" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} className="mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No quiz data state
  if (!hasQuizData) {
    return (
      <div className="cancer-risk-card">
        <div className="risk-content" style={{ padding: '3rem', textAlign: 'center' }}>
          <Target className="mx-auto mb-4 text-blue-500" size={48} />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Complete Your Assessment First</h3>
          <p className="text-gray-600 mb-4">
            You need to complete your lifestyle assessment before using the Risk Simulator
          </p>
          {/* <button 
            onClick={() => navigate('/lifestyle_quiz')}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Start Lifestyle Quiz
            <ChevronRight size={16} className="ml-2" />
          </button> */}
        </div>
      </div>
    );
  }

  // Extract data with fallbacks
  const riskColors = CancerRiskHelpers.getRiskColors(currentRiskLevel, dashboardData?.colors);
  const simulatedColors = CancerRiskHelpers.getRiskColors(simulatedRiskLevel, dashboardData?.colors);
  const uiText = dashboardData?.uiText || {};

  // Set CSS variables for dynamic styling
  const cssVariables = {
    '--gradient': `linear-gradient(135deg, ${riskColors.primary} 0%, ${riskColors.hover} 100%)`,
    '--risk-primary': riskColors.primary,
    '--risk-light': riskColors.light,
    '--risk-border': riskColors.border,
    '--risk-hover': riskColors.hover
  };

  return (
    <div className="cancer-risk-card" style={cssVariables}>
      {/* Risk Header */}
      <div className="risk-header">
        <div className="risk-header-bg">
          <div className="risk-header-content">
            <h2 className="risk-title">
              RISK SIMULATOR
            </h2>
            
            {/* Risk Score Comparison */}
            <div className="risk-simulator-comparison">
              {/* Current Risk */}
              <div className="risk-simulator-current">
                <div className="text-sm font-semibold text-white opacity-80 mb-2">Current Risk</div>
                <div className={`risk-score ${isLoaded ? 'loaded' : ''}`} style={{ fontSize: '2.5rem' }}>
                  {currentRiskScore}
                  <span className="risk-score-max">%</span>
                </div>
                <div className="risk-level" style={{ marginTop: '0.5rem' }}>
                  <span className="level-text">{currentRiskLevel}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="risk-simulator-arrow">
                <ArrowRight />
              </div>

              {/* Simulated Risk */}
              <div className="risk-simulator-simulated">
                <div className="text-sm font-semibold text-white opacity-80 mb-2">Simulated Risk</div>
                <div 
                  className={`risk-score ${isLoaded ? 'loaded' : ''}`} 
                  style={{ 
                    fontSize: '2.5rem'
                  }}
                >
                  {simulatedRiskScore}
                  <span className="risk-score-max">%</span>
                </div>
                <div className="risk-level" style={{ marginTop: '0.5rem' }}>
                  <span 
                    className="level-text" 
                  >
                    {simulatedRiskLevel.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Simulator Content */}
      <div className="risk-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className="risk-breakdown-title">
            <TrendingUp className="breakdown-icon" />
            Adjust Your Risk Factors
          </h3>
          <button 
            onClick={resetSimulation}
            className="risk-simulator-reset-btn"
          >
            <RotateCcw size={14} className="mr-1" />
            Reset
          </button>
        </div>
        
        <div className="risk-factors-list">
          <div 
            className="risk-factors-scroll-container" 
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              padding: '0 4px',
            }}
          >
            {modifiableFactors.map((factor, index) => {
              const percentage = Math.round((factor.sliderValue * factor.multiplier / 320) * 100);
              const hasImproved = factor.sliderValue < factor.currentValue;
              const hasDeclined = factor.sliderValue > factor.currentValue;

              return (
                <div 
                  key={factor.id} 
                  className={`risk-factor-item-simulator ${isLoaded ? 'loaded' : ''}`}
                  style={{ transitionDelay: `${index * 100 + 800}ms` }}
                >
                  <div className="factor-info">
                    <span className="factor-icon">{factor.icon}</span>
                    <div className="factor-details">
                      <div className="factor-name">
                        {factor.name}
                      </div>
                      <div className="factor-description">
                        {factor.description}
                      </div>
                    </div>
                  </div>

                  {/* Slider and Percentage */}
                  <div className="factor-control">
                    <div className="slider-wrapper">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={factor.sliderValue}
                        onChange={(e) => handleSliderChange(factor.id, parseInt(e.target.value))}
                        className="risk-simulator-slider"
                      />
                      <div className="slider-labels">
                        <span>{factor.simulatorConfig?.leftLabel || 'Low'}</span>
                        <span>{factor.simulatorConfig?.rightLabel || 'High'}</span>
                      </div>
                    </div>
                    <div className={`factor-percentage-display ${
                      hasDeclined ? 'positive' : hasImproved ? 'negative' : 'neutral'
                    }`}>
                      {percentage > 0 ? `+${percentage}%` : '0%'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Scroll indicator - only show if there are more than 3 factors */}
          {modifiableFactors.length > 3 && (
            <div 
              className="scroll-indicator" 
              style={{
                textAlign: 'center',
                marginTop: '12px',
                marginBottom: '8px',
                fontSize: '12px',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                position: 'relative',
                zIndex: 1,
                pointerEvents: 'none' // Prevent interference with button clicks
              }}
            >
              <ChevronRight 
                size={14} 
                style={{ 
                  transform: 'rotate(90deg)',
                  animation: 'bounce 2s infinite'
                }} 
              />
              <span>Scroll to see {modifiableFactors.length - 3} more factor{modifiableFactors.length - 3 === 1 ? '' : 's'}</span>
            </div>
          )}
          {modifiableFactors.length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">Loading modifiable factors...</p>
              <p className="text-sm text-gray-400">Please wait while we prepare your risk simulator</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="risk-actions">
          <PDFDownloadLink
            document={
              <LifestylePlanPdf
                currentRiskScore={currentRiskScore}
                simulatedRiskScore={simulatedRiskScore}
                modifiableFactors={modifiableFactors}
              />
            }
            fileName={`lifestyle_plan_for_${simulatedRiskScore}_risk.pdf`}
            className="risk-btn primary"
          >
            {({ loading }) =>
              loading ? (
                <span>Preparing PDF...</span>
              ) : (
                <>
                  <span>Save as PDF</span>
                  <ChevronRight className="btn-icon" />
                </>
              )
            }
          </PDFDownloadLink>
          
          <button className="risk-btn secondary">
            <span>Share Results</span>
            <ChevronRight className="btn-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskSimulator; 