import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaUser, FaCalendarAlt } from 'react-icons/fa';
import './TourDetails.css';

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="image-slider">
      <button className="slider-btn prev" onClick={prevSlide}>{'<'}</button>
      <img src={images[currentIndex]} alt="Tour" className="slider-image" />
      <button className="slider-btn next" onClick={nextSlide}>{'>'}</button>
      <div className="dots">
        {images.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

const RatingModal = ({ isOpen, onClose, onRate, organizerName }) => {
  const [rating, setRating] = useState(5);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onRate(rating);
    onClose();
  };

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rating-modal-header">
          <h3>Rate {organizerName}</h3>
          <button className="rating-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="rating-modal-body">
          <p>How would you rate this tour organizer?</p>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`rating-star ${rating >= star ? 'rated' : ''}`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <div className="rating-text">
            {rating === 1 && "Poor"}
            {rating === 2 && "Below Average"}
            {rating === 3 && "Average"}
            {rating === 4 && "Good"}
            {rating === 5 && "Excellent"}
          </div>
          <button className="rating-submit-btn" onClick={handleSubmit}>
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  );
};

const ReviewCard = ({ review }) => {
  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <FaStar
        key={star}
        className={`review-star ${rating >= star ? 'filled' : 'empty'}`}
      />
    ));
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-user">
          <FaUser />
          <span>{review.touristName}</span>
        </div>
        <div className="review-rating">
          {renderStars(review.organizerRating)}
        </div>
      </div>
      <div className="review-text">
        {review.reviewText}
      </div>
      <div className="review-date">
        <FaCalendarAlt />
        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(1);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUserRole(JSON.parse(user).role);
    }

    const fetchTour = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/tours/${id}`);
        const data = await response.json();
        setTour(data);
      } catch (error) {
        console.error('Error fetching tour:', error);
      }
    };
    fetchTour();

    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${id}`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
    setLoadingReviews(false);
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      alert('Please enter a review text');
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login as a Tourist to submit reviews');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tourId: id,
          reviewText: reviewText.trim(),
          organizerRating: 5 // Default rating - user will change with modal
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      alert('Review submitted successfully!');
      setReviewText('');
      fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.message);
    }
    setIsSubmitting(false);
  };

  const handleRateOrganizer = async (rating) => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login as a Tourist to submit ratings');
      setShowRatingModal(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tourId: id,
          reviewText: reviewText.trim(),
          organizerRating: rating
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          alert('Your session has expired. Please login again.');
          // Optionally redirect to login
          // navigate('/login');
        } else if (response.status === 403) {
          alert('Only tourists can leave ratings.');
        } else if (response.status === 400) {
          alert(data.error || 'Invalid request');
        } else {
          throw new Error(data.error || 'Failed to submit rating');
        }
        return;
      }

      alert('Rating submitted successfully!');
      setReviewText('');
      fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert(error.message);
    }
    setIsSubmitting(false);
  };

  if (!tour) {
    return <div>Loading...</div>;
  }

  return (
    <div className="tour-details">
      <div className="hero-slider">
        <ImageSlider images={tour.images || [tour.images]} />
        <div className="hero-overlay">
          <h1>{tour.title}</h1>
          <p>{tour.destination}</p>
        </div>
      </div>
      <div className="details-container">
        <div className="tour-overview">
          <h2>Tour Overview</h2>
          <p>{tour.description}</p>
        </div>
        <div className="tour-info">
          <div className="info-item">
            <strong>Duration:</strong> {tour.duration}
          </div>
          <div className="info-item">
            <strong>Price:</strong> Rs{tour.price} per person
          </div>
          <div className="info-item">
            <strong>Available Seats:</strong> {tour.availableSeats}
          </div>
          <div className="info-item">
            <strong>Start Date:</strong> {new Date(tour.startDate).toLocaleDateString()}
          </div>
          <div className="info-item">
            <strong>Days:</strong> {tour.numDays}
          </div>
          <div className="info-item">
            <strong>Category:</strong> {tour.category}
          </div>
        </div>
        <div className="itinerary">
          <h3>What to Expect</h3>
          <ul>
            <li>Morning: Meet at starting point and begin adventure</li>
            <li>Afternoon: Explore local sights and enjoy nature</li>
            <li>Evening: Return to base with unforgettable memories</li>
          </ul>
        </div>
        <div className="booking-section">
          {userRole === 'Organizer' ? (
            <div className="organizer-info">
              <p>You are the organizer of this tour.</p>
              <div className="seats-status">
                <strong>Available Seats: {tour.availableSeats}</strong>
              </div>
            </div>
          ) : tour.availableSeats <= 0 ? (
            <div className="no-seats">
              <p>❌ Sorry, this tour is fully booked!</p>
              <p>All {tour.numDays} seats are reserved.</p>
            </div>
          ) : (
            <div className="booking-form">
              <div className="seats-input">
                <label htmlFor="seats-select">Number of seats:</label>
                <select
                  id="seats-select"
                  value={selectedSeats}
                  onChange={(e) => setSelectedSeats(parseInt(e.target.value))}
                  max={Math.min(tour.availableSeats, 10)} // Max 10 seats per booking
                >
                  {[...Array(Math.min(tour.availableSeats, 10))].map((_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {index + 1} seat{index + 1 > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
                <span className="seats-available">
                  ({tour.availableSeats} seats available)
                </span>
              </div>
              <div className="booking-summary">
                <p>
                  <strong>Total Amount:</strong> Rs{tour.price * selectedSeats}
                  <span className="price-breakdown">
                    (Rs{tour.price} × {selectedSeats} seats)
                  </span>
                </p>
              </div>
              <button
                className="book-now-btn"
                onClick={() => navigate(`/payment?tourId=${id}&seats=${selectedSeats}`)}
              >
                Book {selectedSeats} Seat{selectedSeats > 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h3>Reviews & Ratings</h3>

          {/* Review Form (for tourists only) */}
          {userRole === 'Tourist' ? (
            <div className="review-form">
              <div className="review-input-group">
                <textarea
                  placeholder="Share your experience with this tour..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
                <div className="review-actions">
                  <button
                    className="submit-review-btn"
                    onClick={handleSubmitReview}
                    disabled={!reviewText.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    className="rate-organizer-btn"
                    onClick={() => setShowRatingModal(true)}
                    disabled={!reviewText.trim() || isSubmitting}
                  >
                    Rate Organizer ⭐
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="login-required">
              <p>💬 Want to share your experience?</p>
              <p><strong>Login as a Tourist</strong> to leave reviews and rate tour organizers!</p>
              <button
                className="login-btn"
                onClick={() => navigate('/login')}
              >
                Login to Review
              </button>
            </div>
          )}

          {/* Reviews List */}
          {loadingReviews ? (
            <div className="reviews-loading">Loading reviews...</div>
          ) : reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          ) : (
            <div className="no-reviews">
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onRate={handleRateOrganizer}
        organizerName={tour.organizer}
      />
    </div>
  );
};

export default TourDetails;
