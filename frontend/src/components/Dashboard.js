import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import EditTourModal from './EditTourModal';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [privateTours, setPrivateTours] = useState([]);
  const [organizerTours, setOrganizerTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingTours, setLoadingTours] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const navigate = useNavigate();
  const { openChatWith } = useChat();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchPrivateTours(token);
    fetchBookings(parsedUser, token);

    // Fetch organizer tours if user is an organizer
    if (parsedUser.role === 'Organizer') {
      fetchOrganizerTours(token);
    }
  }, [navigate]);

  const fetchBookings = async (userData, token) => {
    setLoadingBookings(true);
    try {
      const endpoint = userData.role === 'Tourist'
        ? '/api/bookings/tourist'
        : '/api/bookings/organizer';

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: {
          'Authorization': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        console.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchPrivateTours = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/private-tours', {
        headers: {
          'Authorization': token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPrivateTours(data);
      } else {
        console.error('Failed to fetch private tours');
      }
    } catch (error) {
      console.error('Error fetching private tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizerTours = async (token) => {
    setLoadingTours(true);
    try {
      const response = await fetch('http://localhost:5000/api/organizer-tours', {
        headers: {
          'Authorization': token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrganizerTours(data);
      } else {
        console.error('Failed to fetch organizer tours');
      }
    } catch (error) {
      console.error('Error fetching organizer tours:', error);
    } finally {
      setLoadingTours(false);
    }
  };

  const handleDeleteTour = async (tourId) => {
    if (!window.confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tours/${tourId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
        },
      });

      if (response.ok) {
        alert('Tour deleted successfully!');
        // Refresh the tours list
        const token = localStorage.getItem('token');
        fetchOrganizerTours(token);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting tour:', error);
      alert('Failed to delete tour. Please try again.');
    }
  };

  const handleEditTour = (tour) => {
    setSelectedTour(tour);
    setEditModalOpen(true);
  };

  const handleSaveTour = (updatedTour) => {
    // Update the tour in the local state
    setOrganizerTours(prevTours =>
      prevTours.map(tour =>
        tour._id === updatedTour._id ? updatedTour : tour
      )
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <section className="profile-section">
        <h2>Your Profile</h2>
        <div className="profile-info">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      </section>

      <section className="bookings-section">
        <h2>
          {user?.role === 'Tourist' ? 'Your Tour Bookings' : 'Tour Bookings'}
        </h2>
        {loadingBookings ? (
          <p>Loading your bookings...</p>
        ) : bookings.length > 0 ? (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-item">
                {user?.role === 'Tourist' ? (
                  // Tourist booking view
                  <div className="tourist-booking">
                    <div className="booking-image">
                      <img
                        src={booking.tour?.images?.[0] || '/placeholder-tour.jpg'}
                        alt={booking.tour?.title || 'Tour'}
                      />
                    </div>
                    <div className="booking-details">
                      <h3>{booking.tour?.title || 'Tour Unavailable'}</h3>
                      <p className="destination">{booking.tour?.destination || 'Destination not available'}</p>
                      <div className="booking-info">
                        <span><strong>Organizer:</strong> {booking.organizerId?.username || booking.organizer}</span>
                        <span><strong>Phone:</strong> {booking.organizerId?.phone || 'Not available'}</span>
                        <span><strong>Email:</strong> {booking.organizerId?.email || 'Not available'}</span>
                      </div>
                      <div className="booking-meta">
                        <span><strong>Seats Booked:</strong> {booking.seatsBooked}</span>
                        <span><strong>Total Amount:</strong> Rs{booking.totalAmount}</span>
                        <span><strong>Booking Date:</strong> {new Date(booking.createdAt).toLocaleDateString()}</span>
                        <span><strong>Tour Date:</strong> {new Date(booking.tourDate).toLocaleDateString()}</span>
                      </div>
                      <div className="booking-status">
                        <span className={`status ${booking.status}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Organizer booking view
                  <div className="organizer-booking">
                    <div className="booking-header">
                      <h3>{booking.tour?.title || 'Tour Unavailable'} ({booking.tour?.destination || 'Destination not available'})</h3>
                    </div>
                    <div className="booking-details">
                      <div className="customer-info">
                        <div className="customer-avatar">👤</div>
                        <div className="customer-details">
                          <h4>{booking.tourist?.username || booking.touristName}</h4>
                          <p>{booking.tourist?.email || 'Not available'}</p>
                          <p>{booking.tourist?.phone || 'Not available'}</p>
                        </div>
                      </div>
                      <div className="booking-info">
                        <span><strong>Seats:</strong> {booking.seatsBooked}</span>
                        <span><strong>Amount:</strong> Rs{booking.totalAmount}</span>
                        <span><strong>Date:</strong> {new Date(booking.createdAt).toLocaleDateString()}</span>
                        <span><strong>Tour Date:</strong> {new Date(booking.tourDate).toLocaleDateString()}</span>
                        <span><strong>Available Seats Left:</strong> {booking.tour?.availableSeats || 'N/A'}</span>
                      </div>
                      <div className="booking-actions">
                        <button
                          className="contact-btn"
                          onClick={() => openChatWith(booking.touristName)}
                        >
                          Message Tourist
                        </button>
                        <span className={`payment-status ${booking.paymentStatus}`}>
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-bookings">
            <p>No bookings yet.</p>
            {user?.role === 'Tourist' ? (
              <p>Discover amazing tours and make your first booking!</p>
            ) : (
              <p>When tourists book your tours, they will appear here.</p>
            )}
          </div>
        )}
      </section>

      {user?.role === 'Tourist' ? (
        <section className="private-tours-section">
          <div className="private-tours-header">
            <h2>Your Private Tours</h2>
            <button onClick={() => navigate('/create-private-tour')} className="create-btn">
              Create New Private Tour
            </button>
          </div>
          {privateTours.length > 0 ? (
            <div className="private-tours-list">
              {privateTours.map((tour) => (
                <div key={tour._id} className="private-tour-item">
                  <h3>{tour.destination}</h3>
                  <p><strong>Number of People:</strong> {tour.numPeople}</p>
                  <p><strong>Budget:</strong> ${tour.budget}</p>
                  <p><strong>Days:</strong> {tour.days}</p>
                  <p><strong>Requirements:</strong> {tour.requirements}</p>
                  <p><strong>Created:</strong> {new Date(tour.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No private tours yet. Create your first private tour!</p>
          )}
        </section>
      ) : (
        <>
          {/* Organizer Tours Section */}
          <section className="organizer-tours-section">
            <div className="tours-header">
              <h2>Your Posted Tours</h2>
              <button onClick={() => navigate('/create-tour')} className="create-btn">
                Create New Tour
              </button>
            </div>

            {loadingTours ? (
              <p>Loading your tours...</p>
            ) : organizerTours.length > 0 ? (
              <div className="tours-grid">
                {organizerTours.map((tour) => (
                  <div key={tour._id} className="tour-card">
                    <div className="tour-image">
                      <img
                        src={tour.images?.[0] || '/placeholder-tour.jpg'}
                        alt={tour.title}
                      />
                    </div>
                    <div className="tour-details">
                      <h3>{tour.title}</h3>
                      <p className="destination">📍 {tour.destination}</p>
                      <div className="tour-info">
                        <span><strong>Price:</strong> Rs{tour.price}</span>
                        <span><strong>Seats:</strong> {tour.availableSeats}</span>
                        <span><strong>Duration:</strong> {tour.duration}</span>
                      </div>
                      <div className="tour-meta">
                        <span><strong>Category:</strong> {tour.category}</span>
                        <span><strong>Start Date:</strong> {new Date(tour.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="tour-actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditTour(tour)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteTour(tour._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-tours">
                <p>No tours posted yet.</p>
                <p>Create your first adventure tour!</p>
              </div>
            )}
          </section>

          {/* Payment Details Section */}
          <section className="payment-section">
            <h2>Payment Settings</h2>
            <button onClick={() => navigate('/payment-details')} className="create-btn secondary">
              Manage Payment Details
            </button>
            <p>Set up your payment information to receive bookings!</p>
          </section>
        </>
      )}

      {/* Edit Tour Modal */}
      <EditTourModal
        tour={selectedTour}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedTour(null);
        }}
        onSave={handleSaveTour}
      />
    </div>
  );
};

export default Dashboard;
