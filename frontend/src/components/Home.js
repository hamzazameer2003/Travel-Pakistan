import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaRoute } from 'react-icons/fa';
import './Home.css';

// High-quality Pakistani tourism images for hero slideshow
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Pakistani mountains
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Kaghan Valley
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Islamabad
  'https://images.unsplash.com/photo-1506260408121-e353d10b87c7?q=80&w=1228&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Lahore Fort
  'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Swat Valley
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Lahore streets
];

const Home = () => {
  const [topTours, setTopTours] = useState([]);
  const [topOrganizers, setTopOrganizers] = useState([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [loadingOrganizers, setLoadingOrganizers] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopTours();
    fetchTopOrganizers();

    // Auto-rotating hero images
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchTopTours = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/top-tours');
      if (response.ok) {
        const data = await response.json();
        setTopTours(data);
      }
    } catch (error) {
      console.error('Error fetching top tours:', error);
    } finally {
      setLoadingTours(false);
    }
  };

  const fetchTopOrganizers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/top-organizers');
      if (response.ok) {
        const data = await response.json();
        setTopOrganizers(data);
      }
    } catch (error) {
      console.error('Error fetching top organizers:', error);
    } finally {
      setLoadingOrganizers(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="star filled" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStar key="half" className="star half" />);
    }

    while (stars.length < 5) {
      stars.push(<FaStar key={stars.length} className="star empty" />);
    }

    return stars;
  };

  return (
    <div className="home" id="home">
      <section
        className="hero"
        style={{ backgroundImage: `linear-gradient(rgba(1, 65, 28, 0.7), rgba(1, 65, 28, 0.8)), url(${HERO_IMAGES[currentImageIndex]})` }}
      >
        <div className="hero-content">
          <h1>Discover the Beauty of Pakistan</h1>
          <p>Explore breathtaking landscapes, rich history, and vibrant culture with trusted tour organizers.</p>
          <Link to="/tours" className="cta-button">
            Explore Tours
          </Link>
        </div>
      </section>

      <section className="destinations" id="destinations">
        <h2>Popular Destinations</h2>
        <div className="destination-cards">
          <div className="card">
            <img src="https://images.unsplash.com/photo-1608012219201-069bbb60424c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Karachi" />
            <h3>Karachi</h3>
            <p>The vibrant coastal city and economic hub.</p>
          </div>
          <div className="card">
            <img src="https://images.unsplash.com/photo-1603491656337-3b491147917c?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Lahore" />
            <h3>Lahore</h3>
            <p>City of gardens and Mughal architectural wonders.</p>
          </div>
          <div className="card">
            <img src="https://images.unsplash.com/photo-1608020932658-d0e19a69580b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Islamabad" />
            <h3>Islamabad</h3>
            <p>Modern capital nestled among majestic mountains.</p>
          </div>
        </div>
      </section>

      <section className="top-tours" id="top-tours">
        <h2>Top Rated Tours</h2>
        <p>Explore the best tours based on organizer ratings and reviews</p>
        <div className="tour-cards">
          {loadingTours ? (
            <p>Loading top tours...</p>
          ) : topTours.length > 0 ? (
            topTours.map((tour) => (
              <div key={tour._id} className="tour-card">
                <img src={tour.images[0]} alt={tour.title} />
                <div className="tour-info">
                  <h3>{tour.title}</h3>
                  <p>{tour.destination}</p>
                  <div className="organizer-rating">
                    <span className="organizer">By: {tour.organizer}</span>
                    <div className="rating">
                      {renderStars(tour.organizer?.rating || 0)}
                      <span className="rating-text">
                        {tour.organizer?.totalReviews > 0
                          ? `${(tour.organizer?.rating || 0).toFixed(1)} (${tour.organizer?.totalReviews} reviews)`
                          : 'No reviews yet'
                        }
                      </span>
                    </div>
                  </div>
                  <p className="price">Rs{tour.price}</p>
                  <button
                    className="view-tour-btn"
                    onClick={() => navigate(`/tours/${tour._id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No tours available currently.</p>
          )}
        </div>
      </section>

      <section className="top-organizers" id="top-organizers">
        <h2>Top Tour Organizer</h2>
        <p>Connect with the best rated tour organizer in Pakistan</p>
        <div className="organizer-cards">
          {loadingOrganizers ? (
            <p>Loading top organizers...</p>
          ) : topOrganizers.length > 0 ? (
            topOrganizers.map((organizer) => (
              <div key={organizer._id} className="organizer-card">
                <div className="organizer-avatar">
                  <FaRoute size={32} />
                </div>
                <div className="organizer-info">
                  <h3>{organizer.username}</h3>
                  <div className="organizer-rating">
                    {renderStars(organizer.rating || 0)}
                    <span className="rating-text">
                      {organizer.totalReviews > 0
                        ? `${(organizer.rating || 0).toFixed(1)} (${organizer.totalReviews} reviews)`
                        : 'No reviews yet'
                      }
                    </span>
                  </div>
                  <p className="organizer-desc">Professional tour organizer with extensive experience in Pakistan tourism.</p>
                  <button
                    className="view-profile-btn"
                    onClick={() => navigate(`/organizer/${organizer.username}`)}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No organizers available currently.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
