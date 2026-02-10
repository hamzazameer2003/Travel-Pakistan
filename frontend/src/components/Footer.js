import React from 'react';
import { Link } from 'react-router-dom';
import { FaMountain, FaHome, FaRoute, FaLightbulb, FaInfo, FaComments, FaRobot, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/Logo/Travel-Pakistan-Logo.png" alt="Travel Pakistan Logo" />
            <span>Travel Pakistan</span>
          </div>
          <p className="footer-motto">
            Discover the heart of Pakistan's breathtaking landscapes and cultural heritage.
          </p>
          <div className="social-icons">
            <FaFacebook />
            <FaTwitter />
            <FaInstagram />
          </div>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <div className="links-grid">
            <Link to="/" className="footer-link"><FaHome size={14} /> Home</Link>
            <Link to="/tours" className="footer-link"><FaRoute size={14} /> Tours</Link>
            <Link to="/virtual-tour-guide" className="footer-link"><FaRobot size={14} /> AI Guide</Link>
            <Link to="/suggest" className="footer-link"><FaLightbulb size={14} /> Suggest Tour</Link>
            <Link to="/about" className="footer-link"><FaInfo size={14} /> About Us</Link>
            <Link to="/contact" className="footer-link"><FaComments size={14} /> Contact</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Travel Pakistan. All Rights Reserved.</p>
        <p>Contact: info@travelpakistan.pk</p>
      </div>
    </footer>
  );
};

export default Footer;
