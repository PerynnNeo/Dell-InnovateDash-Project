const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");

// Updated imports
const getBestMatch = require("../services/matcher");
const generateNaturalResponse = require("../services/openai");
const { getUserProfileForChat, generatePersonalizedRecommendations } = require("../services/userProfileBuilder");

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Optional auth middleware for chat
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = require('../models/User');
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Chat endpoint with optional authentication
router.post("/", optionalAuth, async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Missing or empty message." });
  }

  try {
    // Get user profile if authenticated
    let userProfile = null;
    let personalizedRecommendations = [];
    
    if (req.user) {
      console.log('User authenticated:', req.user._id);
      userProfile = await getUserProfileForChat(req.user._id);
      console.log('User profile:', userProfile);
      
      if (userProfile) {
        personalizedRecommendations = generatePersonalizedRecommendations(userProfile);
      }
    } else {
      console.log('No user authentication found');
    }

    // Match best articles with user context
    const { topics, facts, confidence } = getBestMatch(message, userProfile);

    // Enhanced out-of-scope handling
    const outOfScopeKeywords = [
      'time', 'date', 'weather', 'temperature', 'news', 'sports', 'music', 'movie', 'restaurant',
      'shopping', 'travel', 'booking', 'flight', 'hotel', 'directions', 'map', 'location',
      'calculator', 'math', 'equation', 'joke', 'riddle', 'game', 'play', 'entertainment',
      'recipe', 'cooking', 'food', 'restaurant', 'menu', 'price', 'cost', 'money', 'bank',
      'email', 'phone', 'contact', 'address', 'schedule', 'appointment', 'meeting',
      'look', 'looks', 'looking', 'appearance', 'face', 'photo', 'picture', 'image',
      'who', 'what', 'where', 'when', 'why', 'how', 'name', 'age', 'old', 'young',
      'personal', 'yourself', 'your', 'you', 'me', 'myself', 'i', 'am', 'are', 'is',
      'hello', 'hi', 'hey', 'greeting', 'goodbye', 'bye', 'thanks', 'thank'
    ];
    
    const queryWords = message.toLowerCase().split(/\s+/);
    const hasOutOfScopeKeywords = outOfScopeKeywords.some(keyword => 
      queryWords.includes(keyword) || message.toLowerCase().includes(keyword)
    );
    
    // Check if the query is clearly not cancer-related
    const cancerKeywords = [
      'cancer', 'tumor', 'tumour', 'screening', 'symptom', 'diagnosis', 'treatment',
      'chemotherapy', 'radiation', 'surgery', 'biopsy', 'polyp', 'colorectal', 'breast',
      'lung', 'liver', 'cervical', 'endometrial', 'nasopharyngeal', 'ovarian', 'stomach',
      'prostate', 'melanoma', 'leukemia', 'lymphoma', 'oncology', 'oncologist',
      'risk', 'risky', 'prevention', 'prevent', 'detection', 'detect', 'early',
      'health', 'medical', 'doctor', 'hospital', 'clinic', 'test', 'testing',
      'check', 'examination', 'exam', 'scan', 'xray', 'x-ray', 'mri', 'ct', 'pet'
    ];
    
    const hasCancerKeywords = cancerKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    // If query has out-of-scope keywords but no cancer keywords, or if confidence is very low
    if ((hasOutOfScopeKeywords && !hasCancerKeywords) || confidence < 0.1) {
      return res.json({
        reply: "I'm here to help with topics related to cancer awareness and SCS services.",
        topic: "Out of Scope",
        original_fact: "",
        confidence: 0,
        personalized: false
      });
    }

    // Original out-of-scope handling
    if (topics.includes("Out of Scope")) {
      return res.json({
        reply: "I'm here to help with topics related to cancer awareness and SCS services.",
        topic: "Out of Scope",
        original_fact: "",
        confidence,
        personalized: false
      });
    }

    // Generate personalized response with OpenAI
    const combinedFact = facts[0];
    const openaiReply = await generateNaturalResponse(message, combinedFact, userProfile);

    res.json({
      reply: openaiReply,
      topic: topics.join(", "),
      original_fact: combinedFact,
      confidence,
      personalized: !!userProfile,
      recommendations: personalizedRecommendations
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: "Sorry, I'm having trouble processing your request right now."
    });
  }
});

module.exports = router;
