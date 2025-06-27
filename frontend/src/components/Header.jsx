import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const MobileNav = ({ isOpen, onToggle }) => {
  return (
    <div className={`mobile-nav ${isOpen ? 'open' : ''}`}>
      <div className="mobile-nav-overlay" onClick={onToggle}></div>
      <div className="mobile-nav-menu">
        <div className="mobile-nav-header">
          <div className="logo">Empower+</div>
          <button className="mobile-nav-close" onClick={onToggle}>
            <X className="close-icon" />
          </button>
        </div>
        <nav className="mobile-nav-links">
          <Link to="/" className="mobile-nav-link" onClick={onToggle}>
            <span>Home</span>
          </Link>
          <Link to="/dashboard" className="mobile-nav-link" onClick={onToggle}>
            <span>Dashboard</span>
          </Link>
          <Link to="/profile" className="mobile-nav-link" onClick={onToggle}>
            <span>Profile</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

const Header = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <>
      <header>
        <div className="logo">Empower+</div>
        <nav className="desktop-nav">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
        </nav>
        <button className="mobile-nav-toggle" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
          <Menu className="menu-icon" />
        </button>
      </header>

      <MobileNav isOpen={isMobileNavOpen} onToggle={() => setIsMobileNavOpen(false)} />
    </>
  );
};

export default Header; 