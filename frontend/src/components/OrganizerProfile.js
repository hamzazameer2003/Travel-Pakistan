import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaCalendarAlt, FaRoute, FaPhone, FaEnvelope, FaUser, FaMoneyBill, FaUsers } from 'react-icons/fa';
import { useChat } from '../contexts/ChatContext';
import './OrganizerProfile.css';

const OrganizerProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { openChatWith } = useChat();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrganizerProfile();
  }, [username]);

  const fetchOrganizerProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/organizers/${username}/profile`);

      if (response.status === 404) {
        setError('Organizer not found');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch organizer profile');
      }

      const data = await response.json();
      setProfileData(data);
    } catch (err) {
      console.error('Error fetching organizer profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="star filled" />);
    }

    while (stars.length < 5) {
      stars.push(<FaStar key={stars.length} className="star empty" />);
    }

    return stars;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="organizer-profile">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading organizer profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="organizer-profile">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { organizer, tours, latestReview } = profileData;

  return (
    <div className="organizer-profile">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="organizer-avatar">
          <FaRoute size={64} />
        </div>
        <div className="organizer-basic-info">
          <h1>{organizer.username}</h1>
          <div className="rating-display">
            <div className="stars">
              {renderStars(organizer.rating)}
            </div>
            <span className="rating-score">
              {organizer.rating?.toFixed(1)} ({organizer.totalReviews} reviews)
            </span>
          </div>
        </div>
        <div className="contact-info">
          <div className="contact-item">
            <FaPhone />
            <span>{organizer.phone}</span>
          </div>
          <div className="contact-item">
            <FaEnvelope />
            <span>{organizer.email}</span>
          </div>
        </div>
      </div>

      {/* Organizer's Tours */}
      <div className="profile-section">
        <h2>
          <FaRoute />
          Tours by {organizer.username}
        </h2>
        {tours.length > 0 ? (
          <div className="tours-grid">
            {tours.map((tour) => (
              <div key={tour._id} className="tour-card">
                <img
                  src={tour.images[0] || '/placeholder-tour.jpg'}
                  alt={tour.title}
                />
                <div className="tour-details">
                  <h3>{tour.title}</h3>
                  <p className="destination">{tour.destination}</p>
                  <p className="description">{tour.description.substring(0, 100)}...</p>
                  <div className="tour-meta">
                    <span>Rs{tour.price} • {tour.availableSeats} seats</span>
                    <FaCalendarAlt />
                    <span>{formatDate(tour.startDate)}</span>
                  </div>
                  <button
                    className="view-tour-btn"
                    onClick={() => navigate(`/tours/${tour._id}`)}
                  >
                    View Tour Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-tours">
            <FaRoute size={64} />
            <h3>No Tours Posted Yet</h3>
            <p>This organizer hasn't posted any tours yet.</p>
          </div>
        )}
      </div>

      {/* Latest Review */}
      <div className="profile-section">
        <h2>
          <FaStar />
          Latest Customer Review
        </h2>
        {latestReview ? (
          <div className="latest-review">
            <div className="review-header">
              <div className="reviewer-info">
                <FaUser />
                <span>{latestReview.touristName}</span>
                <span className="tour-name">
                  for "{latestReview.tour?.title || 'Tour Unavailable'}" in {latestReview.tour?.destination || 'Unknown Location'}
                </span>
              </div>
              <div className="review-stars">
                {renderStars(latestReview.organizerRating)}
                <span className=" stars-text">
                  {latestReview.organizerRating}/5 stars
                </span>
              </div>
            </div>
            <div className="review-content">
              <p>"{latestReview.reviewText}"</p>
            </div>
            <div className="review-date">
              <FaCalendarAlt />
              <span>Reviewed on {formatDate(latestReview.createdAt)}</span>
            </div>
          </div>
        ) : (
          <div className="no-reviews">
            <FaStar size={64} />
            <h3>No Reviews Yet</h3>
            <p>This organizer hasn't received any reviews yet.</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="profile-actions">
        <button
          className="contact-organizer-btn"
          onClick={() => openChatWith(organizer.username)}
        >
          <FaEnvelope />
          Message Organizer
        </button>
        <button className="back-to-home-btn" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default OrganizerProfile;
