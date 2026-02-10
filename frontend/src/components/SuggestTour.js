import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SuggestTour.css';

const SuggestTour = () => {
  const [formData, setFormData] = useState({
    destination: '',
    budget: '',
    days: '',
  });
  const [suggestedTours, setSuggestedTours] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const query = new URLSearchParams(formData);
      const response = await fetch(`http://localhost:5000/api/suggest?${query}`);
      const data = await response.json();
      setSuggestedTours(data);
      setSearched(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  return (
    <div className="suggest-tour-page">
      <h1>Suggest Me a Tour</h1>
      <form className="suggestion-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="destination">Destination:</label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="e.g., Karachi, Lahore"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="budget">Budget (Max Price):</label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="e.g., 1000"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="days">Days of Tour:</label>
          <input
            type="text"
            id="days"
            name="days"
            value={formData.days}
            onChange={handleChange}
            placeholder="e.g., 3, 5, 7"
            required
          />
        </div>
        <button type="submit" className="suggest-button">Suggest Tours</button>
      </form>
      {searched && (
        <div className="results">
          <h2>Suggested Tours</h2>
          {suggestedTours.length > 0 ? (
            <div className="suggested-tours-grid">
              {suggestedTours.map(tour => (
                <Link to={`/tours/${tour._id}`} className="tour-link" key={tour._id}>
                  <div className="suggested-tour-card">
                    <img src={tour.image} alt={tour.title} />
                    <h3>{tour.title}</h3>
                    <p>{tour.description}</p>
                    <p><strong>Destination:</strong> {tour.destination}</p>
                    <p><strong>Duration:</strong> {tour.duration}</p>
                    <p><strong>Price:</strong> ${tour.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p>No tours match your criteria. Try adjusting your preferences.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestTour;
