import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-us">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>About Travel Pakistan</h1>
          <p>
            Welcome to Travel Pakistan, your trusted companion for exploring the breathtaking landscapes,
            rich cultural heritage, and hidden gems of Pakistan. We are dedicated to providing exceptional
            travel experiences that connect you with the heart and soul of our beautiful country.
          </p>
        </div>
      </section>

      {/* Company Details */}
      <section className="company-details">
        <div className="container">
          <h2>Our Mission</h2>
          <p>
            At Travel Pakistan, our mission is to showcase the diverse beauty and rich cultural tapestry
            of Pakistan to travelers from around the world. We believe in responsible tourism that supports
            local communities and preserves our natural and cultural heritage for future generations.
          </p>
          <p>
            With over a decade of experience in the travel industry, we have become Pakistan's leading
            tour operator, offering personalized adventures that cater to every traveler's preferences and interests.
          </p>
        </div>
      </section>

      {/* Achievements */}
      <section className="achievements">
        <div className="container">
          <h2>Our Achievements</h2>
          <div className="achievement-grid">
            <div className="achievement-item">
              <h3>10,000+</h3>
              <p>Happy Travelers</p>
            </div>
            <div className="achievement-item">
              <h3>500+</h3>
              <p>Exclusive Tours</p>
            </div>
            <div className="achievement-item">
              <h3>15</h3>
              <p>Years of Experience</p>
            </div>
            <div className="achievement-item">
              <h3>5</h3>
              <p>Awards Won</p>
            </div>
            <div className="achievement-item">
              <h3>98%</h3>
              <p>Customer Satisfaction</p>
            </div>
            <div className="achievement-item">
              <h3>24/7</h3>
              <p>Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="founders">
        <div className="container">
          <h2>Meet Our Founders</h2>
          <div className="founders-grid">
            <div className="founder-card">
              <img src="/About/ahmed.jpeg" alt="Ahmed Hassan" />
              <h3>Ahmed Hassan</h3>
              <p>Co-Founder & CEO</p>
              <p>Ahmed brings over 15 years of experience in the travel industry and is passionate about promoting Pakistan's tourism sector.</p>
            </div>
            <div className="founder-card">
              <img src="/About/hamza.png" alt="Hamza Zameer" />
              <h3>Hamza Zameer</h3>
              <p>Co-Founder & CTO</p>
              <p>Hamza leads our technology initiatives and ensures our platform delivers exceptional user experiences through innovative solutions.</p>
            </div>
            <div className="founder-card">
              <img src="/About/mustafa.jpeg" alt="Mustafa Qayyum" />
              <h3>M. Mustafa Qayyum</h3>
              <p>Head of Cultural Preservation</p>
              <p>Mustafa ensures our tours contribute to the preservation and understanding of Pakistan's rich cultural heritage.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
