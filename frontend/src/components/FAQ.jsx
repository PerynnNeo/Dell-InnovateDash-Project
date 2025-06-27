
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import '../styles/styles.css';
import '../styles/faq.css';

const FAQ = () => {
  const [openItem, setOpenItem] = useState(null);

  const faqItems = [
    {
      id: 1,
      question: "What is Empower+?",
      answer: "Empower+ is a comprehensive cancer prevention platform designed to help you understand your cancer risk and take proactive steps toward early detection. We provide personalized risk assessments, screening recommendations, and educational resources to empower your health journey."
    },
    {
      id: 2,
      question: "How does the Lifestyle Risk Assessment work?",
      answer: "Our comprehensive lifestyle quiz evaluates 14 key factors including age, family history, smoking habits, BMI, exercise, diet, and more. Using a weighted scoring system, we calculate your personalized cancer risk percentage and provide actionable insights to help you reduce your risk."
    },
    {
      id: 3,
      question: "What are the different risk levels?",
      answer: "We categorize risk into three levels: Low Risk (0-30%), Moderate Risk (31-60%), and High Risk (61-100%). Each level comes with specific recommendations and guidance tailored to your situation. Remember, even low-risk individuals benefit from regular screening."
    },
    {
      id: 4,
      question: "How accurate is the risk assessment?",
      answer: "Our assessment is based on established medical research and risk factors. However, it's not a diagnostic tool and should not replace professional medical advice. Always consult with healthcare providers for personalized medical decisions."
    },
    {
      id: 5,
      question: "What is the Knowledge Quiz?",
      answer: "The Knowledge Quiz tests your understanding of cancer prevention, early detection, and risk factors. It's an educational tool that helps you learn important facts about cancer while identifying areas where you might need more information."
    },
    {
      id: 6,
      question: "How do screening recommendations work?",
      answer: "Based on your risk assessment results, we provide personalized screening recommendations with direct links to healthcare providers in Singapore. These recommendations consider your age, risk factors, and medical history to suggest appropriate screening tests."
    },
    {
      id: 7,
      question: "What is the Risk Simulator?",
      answer: "The Risk Simulator lets you see how changing lifestyle factors (like quitting smoking, improving diet, or increasing exercise) can impact your cancer risk score. It's an interactive tool to help you understand the impact of positive lifestyle changes."
    },
    {
      id: 8,
      question: "Is my health information secure?",
      answer: "Yes, we take data security very seriously. All personal health information is encrypted and stored securely. We follow strict privacy guidelines and never share your data without explicit consent. Your information is used solely to provide personalized health insights."
    },
    {
      id: 9,
      question: "Do I need to create an account?",
      answer: "Yes, creating an account allows us to save your assessment results, track your progress, and provide personalized recommendations. Your data is securely stored and you can access your dashboard anytime to review your results and recommendations."
    },
    {
      id: 10,
      question: "What if I get a high-risk result?",
      answer: "A high-risk result doesn't mean you have cancer—it indicates you may benefit from more frequent screening and lifestyle modifications. We'll provide specific recommendations and connect you with healthcare providers. Always consult with a medical professional for personalized advice."
    },
    {
      id: 11,
      question: "How often should I retake the assessment?",
      answer: "We recommend retaking the assessment annually or whenever you experience significant lifestyle changes (like quitting smoking, major weight changes, or new family history). Regular reassessment helps track your progress and adjust recommendations accordingly."
    },
    {
      id: 12,
      question: "Can I share my results with my doctor?",
      answer: "Absolutely! We encourage you to share your assessment results and screening recommendations with your healthcare provider. This information can help inform your medical discussions and screening decisions."
    }
  ];

  const toggleItem = (id) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div>
      <Header />

      <main>
        <section className="faq-header">
          <h1>❓ Frequently Asked Questions</h1>
          <p>Find answers to common questions about Empower+</p>
        </section>

        <section className="faq-content">
          <div className="faq-list">
            {faqItems.map((item) => (
              <div key={item.id} className={`faq-item ${openItem === item.id ? 'open' : ''}`}>
                <button 
                  className="faq-question"
                  onClick={() => toggleItem(item.id)}
                >
                  <span>{item.question}</span>
                  <span className="faq-icon">{openItem === item.id ? '−' : '+'}</span>
                </button>
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="contact-section">
            <h2>Still have questions?</h2>
            <p>Can't find what you're looking for? Contact our support team.</p>
            <div className="contact-options">
              <a href="mailto:support@empowerplus.com" className="contact-btn">
                📧 Email Support
              </a>
              <a href="tel:+1234567890" className="contact-btn">
                📞 Call Us
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FAQ; 