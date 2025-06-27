
import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../contexts/AuthContext';
import '../styles/styles.css';
import '../styles/profile.css';

const Profile = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      <Header />

      <main className="profile-page">
        <div className="profile-card">
          {/* User Avatar */}
          <div className="profile-avatar">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* User Info */}
          <h1 className="profile-name">{user?.name || 'Valued User'}</h1>
          <p className="profile-email">{user?.email || 'user@example.com'}</p>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="logout-button"
            style={{ backgroundColor: '#A50050' }}
          >
            Log Out
          </button>

          {/* Footer Section */}
          <div className="profile-footer">
            <div className="footer-icons">
              {/* Heart */}
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              {/* Shield */}
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {/* Chart */}
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <p className="footer-text">Your Health Journey</p>
          </div>
        </div>
      </main>
    </div>
  );
};


export default Profile;

