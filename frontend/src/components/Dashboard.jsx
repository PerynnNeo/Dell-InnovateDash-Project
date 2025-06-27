
// frontend/src/components/Dashboard.jsx - Fixed version
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, TrendingUp, ChevronRight, Activity, Target, Loader2, RefreshCw, ClipboardList, ClipboardCheck, ShieldCheck} from 'lucide-react';
import Header from './Header';
import RiskSimulator from './RiskSimulator';
import { getDashboardRiskData } from '../api/dashboardApi';
import { getScreeningChecklist, getAllAvailableScreenings } from '../api/screeningApi'; 
import '../styles/styles.css';
import '../styles/dashboard.css';

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
          primary: "#f472b6", 
          light: "rgba(244, 114, 182, 0.1)", 
          border: "rgba(244, 114, 182, 0.2)", 
          hover: "#b0004e" 
        };
      case "LOW RISK": 
      case "LOW_RISK":
        return { 
          primary: "#f472b6", 
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

const CancerRiskAssessment = () => {
  const navigate = useNavigate();

  // Data from backend
  const [riskScore, setRiskScore] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasQuizData, setHasQuizData] = useState(false);

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
          
          // Debug logging
          console.log('Dashboard Data:', response.data);
          console.log('Risk Breakdown:', response.data.riskBreakdown);
          console.log('Risk Score:', response.data.riskScore);
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

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Animation effect for risk score (using percentage)
  useEffect(() => {
    if (dashboardData && hasQuizData) {
      const userRiskPercentage = dashboardData.riskScore?.percentage || 0;
      
      const timer1 = setTimeout(() => {
        setIsLoaded(true);
        let current = 0;
        const target = userRiskPercentage;
        const increment = target / 30;
        const scoreAnimation = setInterval(() => {
          current += increment;
          if (current >= target) {
            setRiskScore(target);
            clearInterval(scoreAnimation);
            setTimeout(() => setProgressWidth(target), 200);
          } else {
            setRiskScore(Math.floor(current));
          }
        }, 50);
      }, 300);
      
      return () => clearTimeout(timer1);
    }
  }, [dashboardData, hasQuizData]);

  // Loading state
  if (loading) {
    return (
      <div className="cancer-risk-card">
        <div className="risk-content" style={{ padding: '3rem', textAlign: 'center' }}>
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Your Risk Assessment</h3>
          <p className="text-gray-500">Fetching your personalized cancer risk data...</p>
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
          <ShieldCheck className="mx-auto mb-4 text-orange-500" size={48} />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Know Your Risk, Take Control</h3>
          <p className="text-gray-600 mb-4">
            {dashboardData?.uiText?.urgencyMessage || 'Take our 3-minute lifestyle assessment to see your cancer risk breakdown and learn how to lower it.'}
          </p>
          <button 
            onClick={() => navigate('/lifestyle_quiz')}
            className="inline-flex items-center px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors font-semibold"
            style={{ backgroundColor: '#A50050' }}
          >
            Start Lifestyle Quiz
            <ChevronRight size={16} className="ml-2" />
          </button>
        </div>
      </div>
    );
  }

  // Extract data with fallbacks
  const userRiskPercentage = dashboardData.riskScore?.percentage || 0;
  const userRiskLevel = dashboardData.riskScore?.level || "UNKNOWN";
  const riskFactors = dashboardData.riskBreakdown || [];
  const riskColors = CancerRiskHelpers.getRiskColors(userRiskLevel, dashboardData.colors);
  const uiText = dashboardData.uiText || {};

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
              {uiText.title || 'MY CANCER RISK'}
            </h2>
            
            {/* Main Risk Score */}
            <div className="risk-score-container">
              <div className={`risk-score ${isLoaded ? 'loaded' : ''}`}>
                {riskScore}
                <span className="risk-score-max">
                  %
                </span>
              </div>
              
              {/* Pulsing warning icon */}
              <div className="risk-warning-icon">
                <AlertTriangle className="warning-icon" />
              </div>
            </div>

            {/* Risk Level Label */}
            <div className="risk-level">
              <AlertTriangle className="level-icon" />
              <span className="level-text">{userRiskLevel}</span>
              <AlertTriangle className="level-icon" />
            </div>

            {/* Progress Bar */}
            <div className="risk-progress-container">
              <div className="risk-progress-bar">
                <div 
                  className="risk-progress-fill"
                  style={{ width: `${Math.min(progressWidth, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Breakdown Section */}
      <div className="risk-content">
        <h3 className="risk-breakdown-title">
          <TrendingUp className="breakdown-icon" />
          {uiText.riskBreakdownTitle || 'Risk Factors'}
        </h3>
        
        <div className="risk-factors-list">
          {/* Scrollable container for all factors */}
          <div 
            className="risk-factors-scroll-container" 
            style={{
              maxHeight: '240px',
              overflowY: 'auto',
              paddingRight: '8px',
            }}
          >
            {riskFactors.map((factor, index) => (
              <div 
                key={factor.id} 
                className={`risk-factor-item ${isLoaded ? 'loaded' : ''}`}
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
                    {factor.rationale && (
                      <div className="factor-rationale">
                        {factor.rationale}
                      </div>
                    )}
                  </div>
                </div>
                <div className="factor-points">
                  {factor.points > 0 ? `+${factor.percentage}%` : `${factor.percentage}%`}
                </div>
              </div>
            ))}
          </div>
          
          {/* Scroll indicator - only show if there are more than what's visible */}
          {riskFactors.length > 3 && (
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
                pointerEvents: 'none'
              }}
            >
              <ChevronRight 
                size={14} 
                style={{ 
                  transform: 'rotate(90deg)',
                  animation: 'bounce 2s infinite'
                }} 
              />
              <span>Scroll to see {riskFactors.length - 3} more factor{riskFactors.length - 3 === 1 ? '' : 's'}</span>
            </div>
          )}
          
          {riskFactors.length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">No specific risk factors identified</p>
              <p className="text-sm text-gray-400">This indicates healthy lifestyle choices!</p>
            </div>
          )}
        </div>
        
        {/* Urgency message */}
        <div className="risk-urgency">
          <p className="urgency-text">
            <AlertTriangle className="urgency-icon w-10 h-10" />
            {uiText.urgencyMessage || 'Early screening can significantly reduce your risk'}
          </p>
        </div>
      </div>
    </div>
  );
};

//helper function for ScreeningOverview component
const getPriorityClass = (priority) => {
  return `priority-${priority?.toLowerCase() || 'general'}`;
};

// Fixed ScreeningOverview - combines your working logic with colorful styling
const ScreeningOverview = () => {
  const [screeningData, setScreeningData] = useState(null);
  const [allAvailableScreenings, setAllAvailableScreenings] = useState(null); // Keep as null like your working version
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllScreenings, setShowAllScreenings] = useState(false);
  const [loadingAllScreenings, setLoadingAllScreenings] = useState(false);

  // Helper function for priority-based CSS classes
  const getPriorityClass = (priority) => {
    return `priority-${priority?.toLowerCase() || 'general'}`;
  };

  const fetchScreeningData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getScreeningChecklist();
      
      if (response.success) {
        setScreeningData(response.data);
      } else {
        setError(response.message || 'Unable to fetch screening data');
      }
    } catch (err) {
      console.error('Error fetching screening data:', err);
      if (err.status === 404) {
        setError('quiz_required'); // Special flag for no quiz taken
      } else {
        setError('Unable to fetch screening recommendations');
      }
    } finally {
      setLoading(false);
    }
  };

  // Your working fetchAllAvailableScreenings function
  const fetchAllAvailableScreenings = async () => {
    try {
      setLoadingAllScreenings(true);
      
      // Make real API call to get all available screening tests from database
      const response = await getAllAvailableScreenings();
      
      if (response.success) {
        setAllAvailableScreenings(response.data.screeningTests || []); // Your working path
      } else {
        console.error('Failed to fetch all available screenings:', response.message);
        setAllAvailableScreenings([]);
      }
    } catch (err) {
      console.error('Error fetching all available screenings:', err);
      setAllAvailableScreenings([]);
    } finally {
      setLoadingAllScreenings(false);
    }
  };

  // Your working handleShowAllScreenings function
  const handleShowAllScreenings = async () => {
    if (!showAllScreenings && !allAvailableScreenings) {
      await fetchAllAvailableScreenings();
    }
    setShowAllScreenings(!showAllScreenings);
  };

  useEffect(() => {
    fetchScreeningData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Screening Recommendations</h2>
          <ClipboardList className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading recommendations...</span>
        </div>
      </div>
    );
  }

  // Show "take assessment first" message
  if (error === 'quiz_required') {
    return (
     <div className="cancer-risk-card">
             <div className="risk-content" style={{ padding: '3rem', textAlign: 'center' }}>
               <Target className="mx-auto mb-4 text-blue-500" size={48} />
               <h3 className="text-lg font-semibold text-gray-700 mb-2">Complete Your Assessment First</h3>
               <p className="text-gray-600 mb-4">
                 You need to complete your lifestyle assessment to view Screening Recommendation.
               </p>
             </div>
           </div>
    );
  }

  // Show error message for other errors
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Screening Recommendations</h2>
          <ClipboardList className="w-6 h-6 text-blue-600" />
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchScreeningData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { screeningItems, userInfo } = screeningData || {};
  
  // Get priority order for display
  const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1, 'Urgent': 4, 'Needed': 2 };
  const sortedRecommendedItems = screeningItems?.sort((a, b) => 
    (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
  ) || [];

  // Combine recommended + additional screenings when showing all
  const displayItems = showAllScreenings 
    ? [...sortedRecommendedItems, ...(allAvailableScreenings || [])]
    : sortedRecommendedItems;

  return (
    <div className="bg-white rounded-xl shadow-lg h-full overflow-hidden">
      {/* 🎨 NEW: Colored Header */}
      <div className="screening-header">
        <h2 className="screening-title">YOUR SCREENING CHECKLIST</h2>
      </div>

      <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100% - 120px)' }}>
        {/* Screening Items or No Recommendations Message */}
        <div className="space-y-4">
          {sortedRecommendedItems.length > 0 ? (
            // Show recommended items
            displayItems.map((item, index) => (
              <ScreeningCard 
                key={`${item.testName}-${index}`} 
                item={item} 
                isRecommended={index < sortedRecommendedItems.length}
              />
            ))
          ) : !showAllScreenings ? (
            // Show message when no recommendations
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardCheck className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600 mb-4">
                No urgent screenings are needed based on your current risk, but we strongly recommend regular cancer screenings 
                for early detection.
              </p>
              <p className="text-sm text-gray-500">
                You can view all available screening options below.
              </p>
            </div>
          ) : (
            // Show all available screenings when requested
            (allAvailableScreenings || []).map((item, index) => (
              <ScreeningCard 
                key={`${item.testName}-${index}`} 
                item={item} 
                isRecommended={false}
              />
            ))
          )}
        </div>

        {/* Loading additional screenings */}
        {loadingAllScreenings && (
          <div className="mt-4 text-center">
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
            <span className="text-sm text-gray-600">Loading additional screenings...</span>
          </div>
        )}

        {/* Show More Button - Show all screening tests toggle */}
        <div className="mt-6 text-center">
          {sortedRecommendedItems.length > 0 ? (
            // User HAS recommendations - show toggle button
            <button 
              onClick={handleShowAllScreenings}
              disabled={loadingAllScreenings}
              className="main-action-button"
            >
              {showAllScreenings 
                ? 'Show Recommended Only' 
                : 'Display All Available Screenings'
              }
            </button>
          ) : (
            // User has NO recommendations - show button to see all available
            <button 
              onClick={handleShowAllScreenings}
              disabled={loadingAllScreenings}
              className="main-action-button"
            >
              {loadingAllScreenings ? 'Loading...' : 'View All Available Screenings'}
            </button>
          )}
        </div>
      </div>

      {/* 🎨 NEW: Styled Footer */}
      <div className="screening-footer">
        <div className="text-sm text-gray-600">📞 Singapore Cancer Society • Contact for Support</div>
      </div>
    </div>
  );
};

// 🎨 NEW: Updated ScreeningCard with colors
const ScreeningCard = ({ item, isRecommended }) => {
  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'needed':
      case 'medium':
        return <Activity className="w-4 h-4" />;
      default:
        return <ClipboardList className="w-4 h-4" />;
    }
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority?.toLowerCase() || 'general'}`;
  };

  return (
    <div className={`screening-card ${getPriorityClass(item.priority)}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        {/* 🎨 NEW: Colored Priority Icon */}
        <div className={`priority-icon-colored ${item.priority?.toLowerCase() || 'general'}`}>
          {getPriorityIcon(item.priority)}
        </div>
        
        <h3 className="font-semibold text-gray-900">
          {item.testName?.toUpperCase()}
          {isRecommended && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              RECOMMENDED
            </span>
          )}
        </h3>
      </div>
      
      {/* Priority line - ONLY show for recommended items */}
      {isRecommended && (
        <div className="mb-3 text-sm text-gray-700">
          Priority: {item.priority}
        </div>
      )}

      {/* Description Section */}
      <div className="mb-3">
        <span className="text-sm font-medium text-gray-700">Description: </span>
        <span className="text-sm text-gray-600">{item.whyText}</span>
      </div>

      {/* 🎨 NEW: Styled Provider buttons */}
      <div className="flex flex-wrap gap-2 mb-2">
        {item.providers?.slice(0, 3).map((provider, idx) => (
          <button
            key={idx}
            className="provider-button"
            onClick={() => window.open(provider.url, '_blank')}
          >
            [{provider.code}]
          </button>
        ))}
        {item.providers?.length > 3 && (
          <button className="provider-button">
            [+{item.providers.length - 3} more]
          </button>
        )}
      </div>
    </div>
  );
};
const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { 
      id: 0, 
      name: 'Risk Assessment', 
      icon: AlertTriangle, 
      component: <CancerRiskAssessment /> 
    },
    { 
      id: 1, 
      name: 'Risk Simulator', 
      icon: Target, 
      component: <RiskSimulator /> 
    },
    { 
      id: 2, 
      name: 'Screening Recommendations', 
      icon: ClipboardList, 
      component: <ScreeningOverview /> 
    }
  ];

  return (
    <div>
      <Header />

      <main className="dashboard">
        <div className="dashboard-container">
          {/* Mobile Tab Navigation - Hidden on desktop */}
          <div className="mobile-tabs">
            <div className="tab-navigation">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <IconComponent className="tab-icon" />
                    <span className="tab-label">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Grid Layout - Hidden on mobile */}
          <div className="desktop-grid">
            <div className="h-full">
              <CancerRiskAssessment />
            </div>
            <div className="h-full">
              <RiskSimulator />
            </div>
            <div className="h-full">
              <ScreeningOverview />
            </div>
          </div>

          {/* Mobile Tab Content - Hidden on desktop */}
          <div className="tab-content">
            <div className="tab-panel">
              {tabs[activeTab].component}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
