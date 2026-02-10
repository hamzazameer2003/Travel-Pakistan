import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrganizerPaymentDetails.css';

// Major Pakistani banks list
const PAKISTANI_BANKS = [
  'Select your bank',
  'Allied Bank Limited',
  'MCB Bank Limited',
  'National Bank of Pakistan',
  'Bank Alfalah Limited',
  'Meezan Bank Limited',
  'Habib Bank Limited (HBL)',
  'United Bank Limited (UBL)',
  'Askari Bank Limited',
  'Faysal Bank Limited',
  'JS Bank Limited',
  'Bank Islami Pakistan Limited',
  'Silkbank Limited',
  'Summit Bank Limited',
  'Pak Oman Investment Company Limited',
  'Burj Bank Limited',
  'The Bank of Khyber',
  'Apna Bank Limited',
  'Punjab Inland Bank',
  'Sindh Bank Limited',
  'Other'
];

const OrganizerPaymentDetails = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    paymentType: 'bank',
    accountTitle: '',
    accountNumber: '',
    bankName: '',
    easypaisaNumber: '',
    jazzcashNumber: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      navigate('/login');
      return;
    }

    const userObj = JSON.parse(userData);
    if (userObj.role !== 'Organizer') {
      navigate('/dashboard');
      return;
    }

    setUser(userObj);
    fetchExistingPaymentDetails(token);
  }, [navigate]);

  const fetchExistingPaymentDetails = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/organizer-payment-details', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.paymentType) {
          setFormData({
            paymentType: data.paymentType,
            accountTitle: data.accountDetails?.accountTitle || '',
            accountNumber: data.accountDetails?.accountNumber || '',
            bankName: data.accountDetails?.bankName || '',
            easypaisaNumber: data.accountDetails?.mobileNumber || '',
            jazzcashNumber: data.accountDetails?.mobileNumber || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    let accountDetails = {};
    if (formData.paymentType === 'bank') {
      accountDetails = {
        accountTitle: formData.accountTitle,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
      };
    } else if (formData.paymentType === 'easypaisa') {
      accountDetails = {
        mobileNumber: formData.easypaisaNumber,
      };
    } else if (formData.paymentType === 'jazzcash') {
      accountDetails = {
        mobileNumber: formData.jazzcashNumber,
      };
    }

    try {
      const response = await fetch('http://localhost:5000/api/organizer-payment-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          paymentType: formData.paymentType,
          accountDetails,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Payment details saved successfully!');
        setError('');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError(data.error || 'Failed to save payment details');
        setSuccess('');
      }
    } catch (err) {
      setError('Server error');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="payment-details">
      <h1>Payment Details</h1>
      <p>Set up your preferred payment method. This information will be used to transfer funds from successful tour bookings.</p>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label>Payment Method</label>
          <select name="paymentType" value={formData.paymentType} onChange={handleChange}>
            <option value="bank">Bank Account</option>
            <option value="easypaisa">Easypaisa</option>
            <option value="jazzcash">JazzCash</option>
          </select>
        </div>

        {formData.paymentType === 'bank' && (
          <div className="bank-details">
            <div className="form-group">
              <label>Account Title</label>
              <input
                type="text"
                name="accountTitle"
                value={formData.accountTitle}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Bank Name</label>
              <select
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                required
              >
                {PAKISTANI_BANKS.map(bank => (
                  <option key={bank} value={bank === 'Select your bank' ? '' : bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {formData.paymentType === 'easypaisa' && (
          <div className="form-group">
            <label>Easypaisa Mobile Number</label>
            <input
              type="tel"
              name="easypaisaNumber"
              value={formData.easypaisaNumber}
              onChange={handleChange}
              placeholder="03XXXXXXXXX"
              required
            />
          </div>
        )}

        {formData.paymentType === 'jazzcash' && (
          <div className="form-group">
            <label>JazzCash Mobile Number</label>
            <input
              type="tel"
              name="jazzcashNumber"
              value={formData.jazzcashNumber}
              onChange={handleChange}
              placeholder="030XXXXXXXXX"
              required
            />
          </div>
        )}

        <button type="submit" disabled={loading} className="save-btn">
          {loading ? 'Saving...' : 'Save Payment Details'}
        </button>
        <button type="button" onClick={() => navigate('/dashboard')} className="cancel-btn">
          Cancel
        </button>
      </form>
    </div>
  );
};

export default OrganizerPaymentDetails;
