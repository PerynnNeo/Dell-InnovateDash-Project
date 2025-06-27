const LifestyleQuizAttempt = require('../models/LifeStyleQuizAttempt');
const LifestyleQuiz = require('../models/LifeStyleQuiz');
const ProviderTestPackage = require('../models/ProviderTestPackage');
const ScreeningTest = require('../models/ScreeningTest');
const { 
  generateScreeningRecommendations, 
  extractUserProfile
} = require('../utils/screeningRecommendationEngine');

/**
 * Get personalized screening recommendations with package links
 * Returns recommendations enriched with test descriptions and package data
 */
const getScreeningRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's latest quiz attempt
    const latestAttempt = await LifestyleQuizAttempt
      .findOne({ userId })
      .sort({ createdAt: -1 })
      .populate('quizId');

    if (!latestAttempt) {
      return res.status(404).json({
        success: false,
        message: 'No lifestyle quiz attempt found. Please complete the quiz first.'
      });
    }

    const quiz = latestAttempt.quizId;
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz data not found'
      });
    }

    // Extract user profile and generate recommendations (business logic only)
    const userProfile = extractUserProfile(latestAttempt.answers, quiz);
    const recommendations = await generateScreeningRecommendations(userProfile, latestAttempt);

    // If no recommendations, return early
    if (recommendations.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          userProfile: {
            age: userProfile.age,
            ageGroup: userProfile.ageGroup,
            gender: userProfile.gender,
            riskScore: latestAttempt.percentageScore,
            riskLevel: latestAttempt.riskLevel,
            riskLabel: latestAttempt.riskData.label,
            riskDescription: latestAttempt.riskData.description
          },
          recommendations: [],
          summary: {
            totalRecommendations: 0,
            highPriority: 0,
            mediumPriority: 0,
            lowPriority: 0,
            totalPackages: 0
          },
          lastUpdated: latestAttempt.createdAt
        }
      });
    }

    // Enrich recommendations with database data
    const enrichedRecommendations = await enrichRecommendationsWithData(recommendations, userProfile);

    // Format response
    const response = {
      success: true,
      data: {
        userProfile: {
          age: userProfile.age,
          ageGroup: userProfile.ageGroup,
          gender: userProfile.gender,
          riskScore: latestAttempt.percentageScore,
          riskLevel: latestAttempt.riskLevel,
          riskLabel: latestAttempt.riskData.label,
          riskDescription: latestAttempt.riskData.description
        },
        recommendations: enrichedRecommendations,
        summary: {
          totalRecommendations: enrichedRecommendations.length,
          highPriority: enrichedRecommendations.filter(r => r.priority === 'High').length,
          mediumPriority: enrichedRecommendations.filter(r => r.priority === 'Medium').length,
          lowPriority: enrichedRecommendations.filter(r => r.priority === 'Low').length,
          totalPackages: enrichedRecommendations.reduce((sum, rec) => sum + rec.packages.length, 0)
        },
        lastUpdated: latestAttempt.createdAt
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error generating screening recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating screening recommendations'
    });
  }
};

/**
 * Get screening checklist format with package URLs
 * Returns checklist-style format for UI display
 */
const getScreeningChecklist = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's latest quiz attempt
    const latestAttempt = await LifestyleQuizAttempt
      .findOne({ userId })
      .sort({ createdAt: -1 })
      .populate('quizId');

    if (!latestAttempt) {
      return res.status(404).json({
        success: false,
        message: 'No lifestyle quiz attempt found. Please complete the quiz first.'
      });
    }

    const quiz = latestAttempt.quizId;
    const userProfile = extractUserProfile(latestAttempt.answers, quiz);
    const recommendations = await generateScreeningRecommendations(userProfile, latestAttempt);

    // If no recommendations, return empty checklist
    if (recommendations.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          userInfo: {
            gender: userProfile.gender,
            age: userProfile.age,
            riskLevel: latestAttempt.riskData.label.toUpperCase().replace(' ', '_'),
            riskScore: `(${latestAttempt.percentageScore})`
          },
          screeningItems: []
        }
      });
    }

    // Enrich recommendations with database data
    const enrichedRecommendations = await enrichRecommendationsWithData(recommendations, userProfile);

    // Format as checklist
    const checklist = {
      success: true,
      data: {
        userInfo: {
          gender: userProfile.gender,
          age: userProfile.age,
          riskLevel: latestAttempt.riskData.label.toUpperCase().replace(' ', '_'),
          riskScore: `(${latestAttempt.percentageScore})`
        },
        screeningItems: enrichedRecommendations.map(rec => {
          const bestPackage = getBestPackageForUser(rec.packages, userProfile, rec.priority);
          
          return {
            testName: rec.testName,
            priority: rec.priority,
            reasons: rec.reasons,
            whyText: rec.testDescription, // Medical description
            
            // Primary recommended package    
            recommendedPackage: bestPackage ? {
              provider: bestPackage.provider,
              packageName: bestPackage.package.name,
              packageUrl: bestPackage.package.url,
              price: bestPackage.package.quickInfo?.price || 'Contact for pricing',
              waitTime: bestPackage.package.waitTime || 'Contact provider',
              canBookOnline: bestPackage.package.onlineBooking,
              bestFor: bestPackage.package.quickInfo?.bestFor
            } : null,
            
            // All available packages
            allPackages: rec.packages.map(pkg => ({
              provider: pkg.provider,
              package: {
                name: pkg.package.name,
                url: pkg.package.url,
                price: pkg.package.quickInfo?.price,
                waitTime: pkg.package.waitTime,
                onlineBooking: pkg.package.onlineBooking,
                locations: pkg.package.locations,
                bestFor: pkg.package.quickInfo?.bestFor
              }
            })),
            
            // Legacy format for backward compatibility
            providers: rec.packages.map(pkg => ({
              code: pkg.provider.code,
              name: pkg.provider.name,
              url: pkg.package.url
            })),
            
            nearestProvider: bestPackage?.provider.code || rec.packages[0]?.provider.code
          };
        })
      }
    };

    res.status(200).json(checklist);

  } catch (error) {
    console.error('Error generating screening checklist:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating screening checklist'
    });
  }
};

/**
 * Get all available screening tests from database (not personalized)
 * Returns shuffled list of all available screening tests
 */
const getAllAvailableScreenings = async (req, res) => {
  try {
    // Get all active screening tests from database
    const allTests = await ScreeningTest.find({ isActive: true });
    
    // For each test, get available packages
    const screeningTestsWithPackages = await Promise.all(
      allTests.map(async (test) => {
        const packages = await ProviderTestPackage.find({ 
          testId: test._id, 
          isActive: true 
        })
        .populate('providerId', 'name code website contactInfo')
        .sort({ priority: -1 });

        return {
          testName: test.name,
          whyText: test.description || `General screening for ${test.name.toLowerCase()}`,
          providers: packages.map(pkg => ({
            code: pkg.providerId.code,
            name: pkg.providerId.name,
            url: pkg.packageUrl
          })),
          recommendedPackage: packages.length > 0 ? {
            provider: {
              name: packages[0].providerId.name,
              code: packages[0].providerId.code
            },
            packageUrl: packages[0].packageUrl
          } : null,
          allPackages: packages.map(pkg => ({
            provider: {
              code: pkg.providerId.code,
              name: pkg.providerId.name
            },
            package: {
              name: pkg.packageName,
              url: pkg.packageUrl
            }
          }))
        };
      })
    );

    // Shuffle the array for variety
    const shuffledScreeningTests = shuffleArray(screeningTestsWithPackages);

    res.status(200).json({
      success: true,
      data: {
        screeningTests: shuffledScreeningTests
      }
    });

  } catch (error) {
    console.error('Error fetching all available screenings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching all available screenings'
    });
  }
};

/**
 * Get detailed test information from database
 */
const getTestInfo = async (req, res) => {
  try {
    const { testCode } = req.params;

    const test = await ScreeningTest.findOne({ 
      code: testCode.toUpperCase(), 
      isActive: true 
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test information not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        code: test.code,
        name: test.name,
        category: test.category,
        description: test.description,
        preparation: test.preparation,
        duration: test.duration,
        frequency: test.frequency
      }
    });

  } catch (error) {
    console.error('Error getting test info:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting test information'
    });
  }
};

/**
 * Get all available providers for a specific test
 */
const getTestProviders = async (req, res) => {
  try {
    const { testCode } = req.params;
    const userId = req.user._id;

    // Get user's profile for personalized recommendations
    const latestAttempt = await LifestyleQuizAttempt
      .findOne({ userId })
      .sort({ createdAt: -1 })
      .populate('quizId');

    let userProfile = null;
    if (latestAttempt) {
      userProfile = extractUserProfile(latestAttempt.answers, latestAttempt.quizId);
    }

    const test = await ScreeningTest.findOne({ 
      code: testCode.toUpperCase(), 
      isActive: true 
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Get all packages for this test
    const packages = await ProviderTestPackage.find({ 
      testId: test._id, 
      isActive: true 
    })
    .populate('providerId', 'name code website contactInfo')
    .sort({ priority: -1 });

    const formattedPackages = packages.map(pkg => ({
      provider: {
        code: pkg.providerId.code,
        name: pkg.providerId.name,
        website: pkg.providerId.website,
        phone: pkg.providerId.contactInfo?.phone,
        email: pkg.providerId.contactInfo?.email
      },
      package: {
        name: pkg.packageName,
        url: pkg.packageUrl,
        price: pkg.price,
        waitTime: pkg.additionalInfo?.waitTime,
        onlineBooking: pkg.availability?.onlineBooking,
        locations: pkg.availability?.locations,
        includes: pkg.additionalInfo?.includes,
        requirements: pkg.additionalInfo?.requirements
      },
      suitability: {
        highRisk: pkg.specializations?.highRisk,
        familyHistory: pkg.specializations?.familyHistory,
        fastTrack: pkg.specializations?.fastTrack,
        bestFor: userProfile ? getBestForLabel(pkg.specializations, userProfile, 'Medium') : null
      }
    }));

    res.status(200).json({
      success: true,
      data: {
        test: {
          code: test.code,
          name: test.name,
          description: test.description
        },
        packages: formattedPackages,
        userRecommendation: userProfile ? {
          recommendedPackage: getBestPackageForUser(formattedPackages, userProfile, 'Medium'),
          totalOptions: formattedPackages.length
        } : null
      }
    });

  } catch (error) {
    console.error('Error getting test providers:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting test providers'
    });
  }
};

/**
 * Admin endpoint to refresh package data (for testing)
 */
const refreshPackages = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Package data refreshed successfully'
    });
  } catch (error) {
    console.error('Error refreshing packages:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing package data'
    });
  }
};

// =================================================================
// HELPER FUNCTIONS - Data enrichment and formatting
// =================================================================

/**
 * Enrich simple recommendations with database data (descriptions, packages)
 * Single efficient query approach instead of multiple individual queries
 */
async function enrichRecommendationsWithData(recommendations, userProfile) {
  if (recommendations.length === 0) return [];

  // Get test codes from recommendations
  const testCodes = recommendations.map(rec => rec.testCode);

  // Single query to get all test descriptions
  const tests = await ScreeningTest.find({
    code: { $in: testCodes },
    isActive: true
  });

  // Create lookup map for test descriptions
  const testDescriptionsMap = {};
  tests.forEach(test => {
    testDescriptionsMap[test.code] = test.description;
  });

  // Fetch package data for all tests in parallel
  const packagePromises = recommendations.map(rec => 
    getPackagesForTest(rec.testCode, userProfile, rec.priority)
  );
  const allPackages = await Promise.all(packagePromises);

  // Combine recommendations with database data
  return recommendations.map((rec, index) => ({
    test: rec.testCode,
    testName: rec.testName,
    testDescription: testDescriptionsMap[rec.testCode] || `${rec.testName} screening`,
    priority: rec.priority,
    reasons: rec.reasons,
    whyText: testDescriptionsMap[rec.testCode] || `${rec.testName} screening`,
    packages: allPackages[index] || []
  }));
}

/**
 * Get packages for a specific test with formatting
 * Returns formatted package data ready for UI consumption
 */
async function getPackagesForTest(testCode, userProfile, priority) {
  try {
    // Find the test
    const test = await ScreeningTest.findOne({ code: testCode, isActive: true });
    if (!test) return [];

    // Find packages and populate provider information
    let packages = await ProviderTestPackage.find({
      testId: test._id,
      isActive: true
    })
    .populate('providerId', 'name code website contactInfo')
    .sort({ priority: -1 });

    // Filter packages based on priority (prefer specialized providers for high priority)
    if (priority === 'High') {
      const specialized = packages.filter(pkg => 
        pkg.specializations?.highRisk || 
        pkg.specializations?.familyHistory ||
        pkg.specializations?.fastTrack
      );
      const general = packages.filter(pkg => 
        !pkg.specializations?.highRisk && 
        !pkg.specializations?.familyHistory &&
        !pkg.specializations?.fastTrack
      );
      packages = [...specialized, ...general];
    }

    // Format packages for UI
    return packages.slice(0, 3).map(pkg => ({
      provider: {
        code: pkg.providerId.code,
        name: pkg.providerId.name,
        website: pkg.providerId.website,
        phone: pkg.providerId.contactInfo?.phone,
        email: pkg.providerId.contactInfo?.email
      },
      package: {
        name: pkg.packageName,
        url: pkg.packageUrl,
        price: pkg.price,
        waitTime: pkg.additionalInfo?.waitTime,
        onlineBooking: pkg.availability?.onlineBooking,
        locations: pkg.availability?.locations,
        includes: pkg.additionalInfo?.includes,
        requirements: pkg.additionalInfo?.requirements,
        quickInfo: {
          price: pkg.price?.amount ? 
            `$${pkg.price.amount}${pkg.price.subsidized?.amount ? 
              ` (Subsidized: $${pkg.price.subsidized.amount})` : ''}` 
            : 'Contact for pricing',
          waitTime: pkg.additionalInfo?.waitTime || 'Contact provider',
          canBookOnline: pkg.availability?.onlineBooking || false,
          bestFor: getBestForLabel(pkg.specializations, userProfile, priority)
        }
      },
      suitability: {
        highRisk: pkg.specializations?.highRisk,
        familyHistory: pkg.specializations?.familyHistory,
        fastTrack: pkg.specializations?.fastTrack
      }
    }));

  } catch (error) {
    console.error('Error fetching packages for test:', testCode, error);
    return [];
  }
}

/**
 * Generate "best for" label based on package specializations
 */
function getBestForLabel(suitability, userProfile, priority) {
  const labels = [];
  
  if (suitability?.highRisk && priority === 'High') {
    labels.push('High Risk Patients');
  }
  
  if (suitability?.familyHistory && 
      userProfile?.familyHistory && 
      !userProfile.familyHistory.includes('No')) {
    labels.push('Family History');
  }
  
  if (suitability?.fastTrack && priority === 'High') {
    labels.push('Fast Track Available');
  }
  
  return labels.length > 0 ? labels.join(', ') : 'General Screening';
}

/**
 * Find the best package for a user based on their profile and test priority
 */
function getBestPackageForUser(packages, userProfile, priority) {
  if (!packages || packages.length === 0) return null;
  
  // For high priority, prefer specialized providers
  if (priority === 'High') {
    const specialized = packages.find(pkg => 
      pkg.suitability?.highRisk || 
      pkg.suitability?.familyHistory ||
      pkg.suitability?.fastTrack
    );
    if (specialized) return specialized;
  }
  
  // For general cases, prefer packages with online booking
  const onlineBooking = packages.find(pkg => pkg.package?.onlineBooking);
  if (onlineBooking) return onlineBooking;
  
  // Default to first package (highest priority)
  return packages[0];
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

module.exports = {
  getScreeningRecommendations,
  getScreeningChecklist,
  getTestInfo,
  getTestProviders,
  refreshPackages,
  getAllAvailableScreenings
};