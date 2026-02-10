import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreatePrivateTour.css';

const CreatePrivateTour = () => {
  const [formData, setFormData] = useState({
    destination: '',
    numPeople: '',
    budget: '',
    days: '',
    requirements: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/private-tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSuccess('Private tour created successfully!');
        setError('');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create private tour');
        setSuccess('');
      }
    } catch (err) {
      setError('Server error');
      setSuccess('');
    }
  };

  return (
    <div className="create-private-tour">
      <h1>Create New Private Tour</h1>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form className="private-tour-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="destination">Destination:</label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="numPeople">Number of People:</label>
          <input
            type="number"
            id="numPeople"
            name="numPeople"
            value={formData.numPeople}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="budget">Budget:</label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="days">Number of Days:</label>
          <input
            type="number"
            id="days"
            name="days"
            value={formData.days}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="requirements">Additional Requirements:</label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>
        <button type="submit" className="submit-btn">Create Private Tour</button>
        <button type="button" onClick={() => navigate('/dashboard')} className="cancel-btn">
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreatePrivateTour;
