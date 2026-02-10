import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OTPSignupModal from './OTPSignupModal';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    role: 'Tourist',
    password: '',
  });
  const [error, setError] = useState('');
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [tempData, setTempData] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/send-signup-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setTempData(data.tempData);
        setOtpModalOpen(true);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  const handleVerifyOtp = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/verify-signup-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        navigate('/dashboard');
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: 'Server error' };
    }
  };

  return (
    <div className="signup">
      <h1>Create Account</h1>
      <form onSubmit={handleSubmit} className="signup-form">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
        />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="Tourist">Tourist</option>
          <option value="Organizer">Organizer</option>
        </select>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" className="signup-btn">Send Verification Code</button>
      </form>
      <p className="login-link">Already have an account? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Login</a></p>

      <OTPSignupModal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        tempData={tempData}
        onVerify={handleVerifyOtp}
      />
    </div>
  );
};

export default Signup;
