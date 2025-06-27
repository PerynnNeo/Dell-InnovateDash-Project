
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API from '../api/userApi';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { register, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear errors when user starts typing
    if (error) setError(null);
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password
    });
    
    if (result.success) {
      // Link quiz attempt after successful signup
      const attemptId = localStorage.getItem('quizAttemptId');
      if (attemptId) {
        try {
          await API.post('/api/quiz/link-attempt', { attemptId });
          localStorage.removeItem('quizAttemptId'); // Clean up
          console.log('Quiz attempt linked to user successfully');
        } catch (error) {
          console.error('Error linking quiz:', error);
          // Don't block user flow if this fails
        }
      }
      navigate('/dashboard'); // Redirect to dashboard after successful registration
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-pink-200 to-purple-300 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-purple-200 to-pink-300 opacity-20 blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#b0004e] to-purple-600 bg-clip-text text-transparent">
            Empower+
          </h1>
          <p className="mt-2 text-gray-600">Start your health journey today</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">Join thousands on their wellness journey</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <div className="space-y-5">
              {/* Name Input */}
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b0004e] focus:border-transparent placeholder-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter your full name"
                />
                <label 
                  htmlFor="name" 
                  className={`absolute left-4 text-sm transition-all duration-200 px-2 ${
                    formData.name 
                      ? 'top-0 text-xs text-[#b0004e] bg-white -translate-y-1/2' 
                      : 'top-3 text-gray-400 peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#b0004e] peer-focus:bg-white peer-focus:-translate-y-1/2'
                  }`}
                >
                  Full Name
                </label>
                {validationErrors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{validationErrors.name}</span>
                  </p>
                )}
              </div>
              
              {/* Email Input */}
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b0004e] focus:border-transparent placeholder-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter your email"
                />
                <label 
                  htmlFor="email" 
                  className={`absolute left-4 text-sm transition-all duration-200 px-2 ${
                    formData.email 
                      ? 'top-0 text-xs text-[#b0004e] bg-white -translate-y-1/2' 
                      : 'top-3 text-gray-400 peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#b0004e] peer-focus:bg-white peer-focus:-translate-y-1/2'
                  }`}
                >
                  Email address
                </label>
                {validationErrors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{validationErrors.email}</span>
                  </p>
                )}
              </div>
              
              {/* Password Input */}
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b0004e] focus:border-transparent placeholder-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter your password"
                />
                <label 
                  htmlFor="password" 
                  className={`absolute left-4 text-sm transition-all duration-200 px-2 ${
                    formData.password 
                      ? 'top-0 text-xs text-[#b0004e] bg-white -translate-y-1/2' 
                      : 'top-3 text-gray-400 peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#b0004e] peer-focus:bg-white peer-focus:-translate-y-1/2'
                  }`}
                >
                  Password
                </label>
                {validationErrors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{validationErrors.password}</span>
                  </p>
                )}
              </div>
              
              {/* Confirm Password Input */}
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b0004e] focus:border-transparent placeholder-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                  placeholder="Confirm your password"
                />
                <label 
                  htmlFor="confirmPassword" 
                  className={`absolute left-4 text-sm transition-all duration-200 px-2 ${
                    formData.confirmPassword 
                      ? 'top-0 text-xs text-[#b0004e] bg-white -translate-y-1/2' 
                      : 'top-3 text-gray-400 peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#b0004e] peer-focus:bg-white peer-focus:-translate-y-1/2'
                  }`}
                >
                  Confirm Password
                </label>
                {validationErrors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{validationErrors.confirmPassword}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[#b0004e] to-purple-600 hover:from-[#92003b] hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b0004e] disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              >
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLoading ? 'Creating account...' : 'Create your account'}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Sign in link */}
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-[#b0004e] hover:text-[#92003b] transition-colors duration-200"
                >
                  Sign in instead
                </Link>
              </span>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};


export default Register;