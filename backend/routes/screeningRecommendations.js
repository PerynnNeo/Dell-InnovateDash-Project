
const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
// Add this import to your existing screeningRecommendations.js route file
const {
  getScreeningRecommendations,
  getScreeningChecklist,
  getTestInfo,
  getTestProviders,
  refreshPackages,
  getAllAvailableScreenings  // Add this line
} = require('../controllers/screeningRecommendationsController');


// All routes require authentication
router.use(auth);

/**
 * @route   GET /api/screening/recommendations
 * @desc    Get personalized screening recommendations with package details
 * @access  Private
 */
router.get('/recommendations', getScreeningRecommendations);

/**
 * @route   GET /api/screening/checklist
 * @desc    Get screening checklist with recommended packages
 * @access  Private
 */
router.get('/checklist', getScreeningChecklist);

/**
 * @route   GET /api/screening/test-info/:testCode
 * @desc    Get detailed information about a specific test
 * @access  Private
 */
router.get('/test-info/:testCode', getTestInfo);

/**
 * @route   GET /api/screening/test-providers/:testCode
 * @desc    Get all available providers for a specific test
 * @access  Private
 */
router.get('/test-providers/:testCode', getTestProviders);

// Add this new route to your existing routes
/**
 * @route   GET /api/screening/all-available
 * @desc    Get all available screening tests from database (not personalized)
 * @access  Private
 */
router.get('/all-available', getAllAvailableScreenings);

/**
 * @route   POST /api/screening/refresh-packages
 * @desc    Refresh package data (admin)
 * @access  Private
 */
router.post('/refresh-packages', refreshPackages);

module.exports = router;

/* =====================================================
   EXAMPLE API RESPONSES WITH PACKAGE INFORMATION
   ===================================================== */

// GET /api/screening/checklist
// const exampleChecklistWithPackages = {
//   "success": true,
//   "data": {
//     "userInfo": {
//       "gender": "Female",
//       "age": 50,
//       "riskLevel": "HIGH_RISK",
//       "riskScore": "(72)"
//     },
//     "screeningItems": [
//       {
//         "testName": "Colonoscopy",
//         "priority": "High",
//         "reasons": ["Family history of colorectal cancer", "Age 45+ with high risk factors"],
//         "whyText": "Family history + Age 45+",
        
//         // Recommended package for this user
//         "recommendedPackage": {
//           "provider": {
//             "code": "NCCS",
//             "name": "National Cancer Centre Singapore",
//             "website": "https://www.nccs.com.sg",
//             "phone": "+65 6436 8000",
//             "email": "enquiry@nccs.com.sg"
//           },
//           "packageName": "Comprehensive Colonoscopy Screening",
//           "packageUrl": "https://www.nccs.com.sg/patient-care/screening-programmes/colorectal-cancer-screening",
//           "price": "$800 (Subsidized: $400)",
//           "waitTime": "2-3 weeks for routine, 1 week for urgent cases",
//           "canBookOnline": true,
//           "bestFor": "High Risk Patients, Family History, Fast Track Available"
//         },
        
//         // All available packages
//         "allPackages": [
//           {
//             "provider": {
//               "code": "NCCS",
//               "name": "National Cancer Centre Singapore",
//               "website": "https://www.nccs.com.sg",
//               "phone": "+65 6436 8000",
//               "email": "enquiry@nccs.com.sg"
//             },
//             "package": {
//               "name": "Comprehensive Colonoscopy Screening",
//               "url": "https://www.nccs.com.sg/patient-care/screening-programmes/colorectal-cancer-screening",
//               "price": "$800 (Subsidized: $400)",
//               "waitTime": "2-3 weeks for routine, 1 week for urgent cases",
//               "onlineBooking": true,
//               "locations": ["NCCS Main Campus", "Novena Specialist Center"],
//               "bestFor": "High Risk Patients, Family History, Fast Track Available"
//             }
//           },
//           {
//             "provider": {
//               "code": "SCS",
//               "name": "Singapore Cancer Society",
//               "website": "https://www.singaporecancersociety.org.sg",
//               "phone": "+65 6221 9578",
//               "email": "info@singaporecancersociety.org.sg"
//             },
//             "package": {
//               "name": "Community Colonoscopy Programme",
//               "url": "https://www.singaporecancersociety.org.sg/programmes-services/screening-programmes.html",
//               "price": "$600 (Subsidized: $300)",
//               "waitTime": "3-4 weeks",
//               "onlineBooking": true,
//               "locations": ["SCS Medical Centre", "Partner Clinics"],
//               "bestFor": "General Screening"
//             }
//           }
//         ],
        
//         // Legacy format for backward compatibility
//         "providers": [
//           {
//             "code": "NCCS",
//             "name": "National Cancer Centre Singapore",
//             "url": "https://www.nccs.com.sg/patient-care/screening-programmes/colorectal-cancer-screening"
//           },
//           {
//             "code": "SCS", 
//             "name": "Singapore Cancer Society",
//             "url": "https://www.singaporecancersociety.org.sg/programmes-services/screening-programmes.html"
//           }
//         ],
//         "nearestProvider": "NCCS"
//       },
      
//       {
//         "testName": "Mammogram",
//         "priority": "High", 
//         "reasons": ["Age 40+ with high risk factors"],
//         "whyText": "Female 40+ with high risk",
        
//         "recommendedPackage": {
//           "provider": {
//             "code": "NCCS",
//             "name": "National Cancer Centre Singapore", 
//             "website": "https://www.nccs.com.sg",
//             "phone": "+65 6436 8000",
//             "email": "enquiry@nccs.com.sg"
//           },
//           "packageName": "Digital Mammography Screening",
//           "packageUrl": "https://www.nccs.com.sg/patient-care/screening-programmes/breast-cancer-screening",
//           "price": "$200 (Subsidized: $100)",
//           "waitTime": "1-2 weeks",
//           "canBookOnline": true,
//           "bestFor": "High Risk Patients, Family History"
//         },
        
//         "allPackages": [
//           {
//             "provider": {
//               "code": "NCCS",
//               "name": "National Cancer Centre Singapore",
//               "website": "https://www.nccs.com.sg",
//               "phone": "+65 6436 8000",
//               "email": "enquiry@nccs.com.sg"
//             },
//             "package": {
//               "name": "Digital Mammography Screening",
//               "url": "https://www.nccs.com.sg/patient-care/screening-programmes/breast-cancer-screening",
//               "price": "$200 (Subsidized: $100)",
//               "waitTime": "1-2 weeks",
//               "onlineBooking": true,
//               "locations": ["NCCS Main Campus", "NCCS Specialist Outpatient Clinics"],
//               "bestFor": "High Risk Patients, Family History"
//             }
//           },
//           {
//             "provider": {
//               "code": "HEALTHHUB",
//               "name": "HealthHub",
//               "website": "https://www.healthhub.sg",
//               "phone": "+65 1800 223 1313",
//               "email": "info@healthhub.sg"
//             },
//             "package": {
//               "name": "HealthHub Mammography Screening",
//               "url": "https://www.healthhub.sg/programmes/61/breast_cancer_screening",
//               "price": "$150 (Subsidized: $75)",
//               "waitTime": "1-2 weeks",
//               "onlineBooking": true,
//               "locations": ["Multiple HealthHub locations", "Mobile screening units"],
//               "bestFor": "General Screening"
//             }
//           }
//         ],
        
//         "providers": [
//           {
//             "code": "NCCS",
//             "name": "National Cancer Centre Singapore",
//             "url": "https://www.nccs.com.sg/patient-care/screening-programmes/breast-cancer-screening"
//           },
//           {
//             "code": "HEALTHHUB",
//             "name": "HealthHub", 
//             "url": "https://www.healthhub.sg/programmes/61/breast_cancer_screening"
//           }
//         ],
//         "nearestProvider": "NCCS"
//       }
//     ]
//   }
// };

// // GET /api/screening/test-providers/COLONOSCOPY
// const exampleTestProvidersResponse = {
//   "success": true,
//   "data": {
//     "test": {
//       "code": "COLONOSCOPY",
//       "name": "Colonoscopy",
//       "description": "A procedure to examine the inside of the colon and rectum using a flexible tube with a camera"
//     },
//     "packages": [
//       {
//         "provider": {
//           "code": "NCCS",
//           "name": "National Cancer Centre Singapore",
//           "website": "https://www.nccs.com.sg",
//           "phone": "+65 6436 8000",
//           "email": "enquiry@nccs.com.sg"
//         },
//         "package": {
//           "name": "Comprehensive Colonoscopy Screening",
//           "url": "https://www.nccs.com.sg/patient-care/screening-programmes/colorectal-cancer-screening",
//           "price": {
//             "amount": 800,
//             "currency": "SGD",
//             "subsidized": {
//               "amount": 400,
//               "eligibility": "Singapore Citizens and PRs with subsidies"
//             }
//           },
//           "waitTime": "2-3 weeks for routine, 1 week for urgent cases",
//           "onlineBooking": true,
//           "locations": ["NCCS Main Campus", "Novena Specialist Center"],
//           "includes": [
//             "Pre-procedure consultation",
//             "Procedure", 
//             "Pathology if needed",
//             "Follow-up consultation"
//           ],
//           "requirements": [
//             "Referral letter preferred but not mandatory",
//             "Bowel preparation kit provided"
//           ]
//         },
//         "suitability": {
//           "highRisk": true,
//           "familyHistory": true,
//           "fastTrack": true,
//           "bestFor": "High Risk Patients, Family History, Fast Track Available"
//         }
//       },
//       {
//         "provider": {
//           "code": "SCS",
//           "name": "Singapore Cancer Society",
//           "website": "https://www.singaporecancersociety.org.sg",
//           "phone": "+65 6221 9578",
//           "email": "info@singaporecancersociety.org.sg"
//         },
//         "package": {
//           "name": "Community Colonoscopy Programme",
//           "url": "https://www.singaporecancersociety.org.sg/programmes-services/screening-programmes.html",
//           "price": {
//             "amount": 600,
//             "currency": "SGD",
//             "subsidized": {
//               "amount": 300,
//               "eligibility": "Income-based subsidies available"
//             }
//           },
//           "waitTime": "3-4 weeks",
//           "onlineBooking": true,
//           "locations": ["SCS Medical Centre", "Partner Clinics"],
//           "includes": [
//             "Pre-screening consultation",
//             "Procedure",
//             "Basic pathology",
//             "Post-procedure care"
//           ],
//           "requirements": [
//             "Health screening questionnaire",
//             "Pre-procedure counseling"
//           ]
//         },
//         "suitability": {
//           "highRisk": true,
//           "familyHistory": true,
//           "fastTrack": false,
//           "bestFor": "High Risk Patients, Family History"
//         }
//       }
//     ],
//     "userRecommendation": {
//       "recommendedPackage": {
//         "provider": {
//           "code": "NCCS",
//           "name": "National Cancer Centre Singapore"
//         },
//         "package": {
//           "name": "Comprehensive Colonoscopy Screening",
//           "url": "https://www.nccs.com.sg/patient-care/screening-programmes/colorectal-cancer-screening"
//         }
//       },
//       "totalOptions": 2
//     }
//   }
// };

// /* =====================================================
//    SETUP INSTRUCTIONS
//    ===================================================== */

// const setupInstructions = {
//   "step1": {
//     "description": "Add the database models",
//     "files": [
//       "backend/models/HealthcareProvider.js",
//       "backend/models/ScreeningTest.js", 
//       "backend/models/ProviderTestPackage.js"
//     ]
//   },
  
//   "step2": {
//     "description": "Run the seeding script",
//     "command": "node backend/scripts/seedProviders.js",
//     "note": "This will populate your database with provider and package data"
//   },
  
//   "step3": {
//     "description": "Update your server.js",
//     "code": `
// // Add to your existing routes in server.js
// app.use('/api/screening', require('./routes/screeningRecommendations'));
//     `
//   },
  
//   "step4": {
//     "description": "Replace the old recommendation engine",
//     "action": "Replace backend/utils/screeningRecommendationEngine.js with the updated version"
//   },
  
//   "step5": {
//     "description": "Update the controller", 
//     "action": "Replace backend/controllers/screeningRecommendationsController.js with the updated version"
//   },
  
//   "step6": {
//     "description": "Test the new endpoints",
//     "endpoints": [
//       "GET /api/screening/checklist",
//       "GET /api/screening/recommendations", 
//       "GET /api/screening/test-providers/COLONOSCOPY",
//       "GET /api/screening/test-info/MAMMOGRAM"
//     ]
//   }
// };

// /* =====================================================
//    FRONTEND INTEGRATION EXAMPLE
//    ===================================================== */

// const ReactComponentExample = `
// // Example React component using the new package data
// const ScreeningCard = ({ screeningItem }) => {
//   const { testName, priority, recommendedPackage, allPackages } = screeningItem;
  
//   return (
//     <div className={\`screening-card priority-\${priority.toLowerCase()}\`}>
//       <div className="header">
//         <h3>{testName}</h3>
//         <span className={\`priority-badge \${priority.toLowerCase()}\`}>
//           {priority} Priority
//         </span>
//       </div>
      
//       <div className="why-section">
//         <p>{screeningItem.whyText}</p>
//       </div>
      
//       {recommendedPackage && (
//         <div className="recommended-package">
//           <h4>Recommended for you:</h4>
//           <div className="package-info">
//             <div className="provider-name">
//               {recommendedPackage.provider.name}
//             </div>
//             <div className="package-details">
//               <span className="price">{recommendedPackage.price}</span>
//               <span className="wait-time">{recommendedPackage.waitTime}</span>
//               {recommendedPackage.canBookOnline && (
//                 <span className="online-booking">📱 Book Online</span>
//               )}
//             </div>
//             <a 
//               href={recommendedPackage.packageUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="book-now-btn"
//             >
//               Book Now
//             </a>
//           </div>
//         </div>
//       )}
      
//       {allPackages.length > 1 && (
//         <div className="all-options">
//           <details>
//             <summary>View all {allPackages.length} options</summary>
//             {allPackages.map((pkg, index) => (
//               <div key={index} className="package-option">
//                 <div className="provider">{pkg.provider.name}</div>
//                 <div className="price">{pkg.package.price}</div>
//                 <a href={pkg.package.url} target="_blank" rel="noopener noreferrer">
//                   View Details
//                 </a>
//               </div>
//             ))}
//           </details>
//         </div>
//       )}
//     </div>
//   );
// };
// `;

// module.exports = {
//   exampleChecklistWithPackages,
//   exampleTestProvidersResponse,
//   setupInstructions,
//   ReactComponentExample
// };