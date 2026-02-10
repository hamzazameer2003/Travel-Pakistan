import React, { useState } from 'react';
import { FaMountain } from 'react-icons/fa';
import './OTPSignupModal.css';

const OTPSignupModal = ({ isOpen, onClose, tempData, onVerify }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    const result = await onVerify({ ...tempData, otp });
    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Verification failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="otp-modal-overlay" onClick={onClose}>
      <div className="otp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="otp-modal-logo">
          <FaMountain />
        </div>
        <h2>Email Verification</h2>
        <p>We've sent a 6-digit verification code to your email address. Please enter it below to complete your registration.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={otp}
            onChange={(e) => {
              if (/^\d{0,6}$/.test(e.target.value)) {
                setOtp(e.target.value);
              }
            }}
            placeholder="Enter 6-digit OTP"
            className="otp-input"
            maxLength="6"
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="verify-btn">Verify & Complete Signup</button>
        </form>
        <p className="otp-note">⚠️ Fresh OTP has been sent to your registered email address</p>
        <button onClick={onClose} className="close-btn">Cancel</button>
      </div>
    </div>
  );
};

export default OTPSignupModal;
