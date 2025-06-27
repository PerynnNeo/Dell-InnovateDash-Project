import Header from './Header';
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/styles.css';
import ChatbotButton from './ChatbotButton';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const {user } = useAuth(); // M
// check if logged in
  return (
    <div>
      <Header />

      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Your Health Journey Starts Here</h1>
            <p>Empower+ guides you with personalized steps, emotional motivation, and social support. Start transforming your health today.</p>
            <div className="hero-buttons">
              <Link to="/LifeStyleQuiz" className="start-btn">Start My Journey</Link>
              <Link to="/knowledge_quiz" className="start-btn">Check My Knowledge</Link>
              <Link to="/faq" className="learn-btn">Learn More</Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="/assets/illustration-health.png" alt="Health Illustration" />
          </div>
        </div>
      </section>

      {/* Three Cards */}
      <section className="features">

       
        <Link to="/dashboard" className="feature-card-link">
          <div className="feature-card">
            <img src="/assets/target-icon.png" alt="Risk Assessment Icon" className="feature-img" />
            <h3>HealthRisk+</h3>
            <p>Take our comprehensive lifestyle quiz to understand your personalized cancer risk factors and get actionable insights.</p>
          </div>
        </Link>

        <Link to="/knowledge_quiz" className="feature-card-link">
          <div className="feature-card">
            <img src="/assets/mail-icon.png" alt="Knowledge Quiz Icon" className="feature-img" />
            <h3>KnowledgeCheck</h3>
            <p>Test your cancer awareness with our interactive quiz and learn essential facts about prevention and early detection.</p>
          </div>
        </Link>

        <Link to="/dashboard" className="feature-card-link">
          <div className="feature-card">
            <img src="/assets/group-icon.png" alt="Screening Recommendations Icon" className="feature-img" />
            <h3>Screening Recommendations</h3>
            <p>Get personalized screening suggestions based on your risk profile with direct links to healthcare providers.</p>
          </div>
        </Link>
      </section>

      <footer>
        &copy; 2025 Empower+ | Made with ❤️ for Singapore Cancer Society
      </footer>
      {/* ✅ Floating Chatbot button only if user is logged in */}
      {<ChatbotButton />}
    </div>

  );
};

export default Index; 
