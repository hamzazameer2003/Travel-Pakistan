import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMountain, FaHome, FaRoute, FaLightbulb, FaRobot } from 'react-icons/fa';
import './Header.css';

const Header = ({ className }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className={`header ${className || ''}`}>
      <div className="header-container">
        <Link to="/" className="logo-link">
          <div className="logo">
            <div className="logo-icon">
              <img src="/Logo/Travel-Pakistan-Logo.png" alt="Travel Pakistan Logo" />
            </div>
            <div className="logo-text">
              <h1>Travel Pakistan</h1>
              <div className="logo-tagline">
                Discover the Land of Adventure
              </div>
            </div>
          </div>
        </Link>
        <nav className="nav">
          <ul>
            <li><Link to="/"><FaHome size={16} />Home</Link></li>
            <li><Link to="/tours"><FaRoute size={16} />Tours</Link></li>
            <li><Link to="/virtual-tour-guide"><FaRobot size={16} />AI Guide</Link></li>
            {token && user?.role === 'Organizer' ? (
              <li><Link to="/private-tours"><FaMountain size={16} />Private Tours</Link></li>
            ) : (
              <li><Link to="/suggest"><FaLightbulb size={16} />Suggest Tour</Link></li>
            )}
            {token ? (
              <>
                <li><Link to="/dashboard"><FaMountain size={16} />Dashboard</Link></li>
                <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
              </>
            ) : (
              <>
                <li><Link to="/signup">Sign Up</Link></li>
                <li><Link to="/login">Login</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
