import React, { useState } from 'react';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.success);
        setError('');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setError(data.error || 'Failed to send message');
        setSuccess('');
      }
    } catch (err) {
      setError('Server error');
      setSuccess('');
    }
  };

  return (
    <div className="contact-us">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>Have questions or need assistance? We'd love to hear from you!</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <div className="info-item">
            <strong>Address:</strong><br />
            123 Adventure Street, Islamabad, Pakistan
          </div>
          <div className="info-item">
            <strong>Phone:</strong><br />
            +92 51 123 4567
          </div>
          <div className="info-item">
            <strong>Email:</strong><br />
            info@travelpakistan.com
          </div>
          <div className="info-item">
            <strong>Business Hours:</strong><br />
            Monday - Friday: 9:00 AM - 6:00 PM<br />
            Saturday: 9:00 AM - 1:00 PM
          </div>
        </div>

        <div className="contact-form-container">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message:</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                required
              />
            </div>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <button type="submit" className="send-btn">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
