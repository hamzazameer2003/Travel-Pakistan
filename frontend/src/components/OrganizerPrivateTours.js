import React, { useState, useEffect } from 'react';
import ChatModal from './ChatModal';
import './OrganizerPrivateTours.css';

const OrganizerPrivateTours = () => {
  const [privateTours, setPrivateTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedTourist, setSelectedTourist] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

    if (!token || !user) {
      setError('Please login');
      setLoading(false);
      return;
    }

    if (user.role !== 'Organizer') {
      setError('Access denied. Only organizers can view this page.');
      setLoading(false);
      return;
    }

    fetchAllPrivateTours(token);
  }, []);

  const fetchAllPrivateTours = async (token) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/private-tours/all', {
        headers: { 'Authorization': token },
      });
      if (response.ok) {
        const data = await response.json();
        setPrivateTours(data);
      } else if (response.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        setError('Failed to fetch private tours');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (tourId) => {
    setSelectedTourist(`Tour-${tourId}`);
    setChatOpen(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="organizer-private-tours">
      <h1>All Private Tours</h1>
      <div className="private-tour-cards">
        {privateTours.length > 0 ? (
          privateTours.map((tour) => (
            <div key={tour._id} className="private-tour-card">
              <h3>Destination: {tour.destination}</h3>
              <p><strong>Number of People:</strong> {tour.numPeople}</p>
              <p><strong>Budget:</strong> Rs{tour.budget}</p>
              <p><strong>Days:</strong> {tour.days}</p>
              <p><strong>Requirements:</strong> {tour.requirements}</p>
              <p><strong>Posted by:</strong> {tour.user.username}</p>
              <p><strong>Posted on:</strong> {new Date(tour.createdAt).toLocaleDateString()}</p>
              <button
                onClick={() => handleChatClick(tour._id)}
                className="chat-btn"
              >
                Chat with Tourist
              </button>
            </div>
          ))
        ) : (
          <p>No private tours yet.</p>
        )}
      </div>
      <ChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        organizer={selectedTourist}
      />
    </div>
  );
};

export default OrganizerPrivateTours;
