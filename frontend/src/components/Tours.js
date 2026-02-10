import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChatModal from './ChatModal';
import './Tours.css';

const Tours = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [filters, setFilters] = useState({
    destination: '',
    minPrice: '',
    maxPrice: '',
    category: '',
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUserRole(JSON.parse(user).role);
    }

    const fetchTours = async () => {
      try {
        const query = new URLSearchParams(filters);
        query.delete(''); // remove empty
        const response = await fetch(`http://localhost:5000/api/tours?${query}`);
        const data = await response.json();
        setTours(data);
        setFilteredTours(data);
      } catch (error) {
        console.error('Error fetching tours:', error);
      }
    };
    fetchTours();
    // Adding 'filters' to deps causes infinite loop, but it's initial load only
  }, [filters]);

  useEffect(() => {
    let filtered = tours;
    if (filters.destination) {
      filtered = filtered.filter(tour =>
        tour.destination.toLowerCase().includes(filters.destination.toLowerCase())
      );
    }
    if (filters.minPrice) {
      filtered = filtered.filter(tour => tour.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(tour => tour.price <= Number(filters.maxPrice));
    }
    if (filters.category) {
      filtered = filtered.filter(tour => tour.category.toLowerCase() === filters.category.toLowerCase());
    }
    setFilteredTours(filtered);
  }, [filters, tours]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="tours-page">
      <h1>Our Tours</h1>
      <div className="filters">
        <div className="filter-group">
          <label>Destination:</label>
          <input
            type="text"
            name="destination"
            value={filters.destination}
            onChange={handleFilterChange}
            placeholder="e.g., Lahore"
          />
        </div>
        <div className="filter-group">
          <label>Min Price:</label>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            placeholder="0"
          />
        </div>
        <div className="filter-group">
          <label>Max Price:</label>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            placeholder="5000"
          />
        </div>
        <div className="filter-group">
          <label>Category:</label>
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Adventure">Adventure</option>
            <option value="Cultural">Cultural</option>
            <option value="Beach">Beach</option>
          </select>
        </div>
      </div>
      <div className="tours-grid">
        {filteredTours.map(tour => (
          <div className="tour-wrapper" key={tour._id}>
            <Link to={`/tours/${tour._id}`} className="tour-link">
              <div className="tour-card">
                <img src={tour.images[0]} alt={tour.title} />
                <h3>{tour.title}</h3>
                <p>{tour.description}</p>
                <p>Destination: {tour.destination}</p>
                <p>Duration: {tour.duration}</p>
                <p>Price: Rs{tour.price}</p>
              </div>
            </Link>
            <div className="tour-actions">
              <button
                className="book-button"
                onClick={() => navigate(`/tours/${tour._id}`)}
              >
                {userRole === 'Organizer' ? 'View Details' : 'Book Now'}
              </button>
              <button
                className="chat-button"
                onClick={() => {
                  const token = localStorage.getItem('token');
                  if (token) {
                    setChatOpen(tour.organizer);
                  } else {
                    alert('Please log in to chat with the organizer.');
                  }
                }}
              >
                Chat
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Chat Modal */}
      <ChatModal isOpen={!!chatOpen} onClose={() => setChatOpen(null)} organizer={chatOpen} />
    </div>
  );
};

export default Tours;
