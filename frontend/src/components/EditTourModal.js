import React, { useState, useEffect } from 'react';
import './EditTourModal.css';

const EditTourModal = ({ tour, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    description: '',
    price: '',
    duration: '',
    availableSeats: '',
    numDays: '',
    startDate: '',
    category: '',
    images: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tour && isOpen) {
      setFormData({
        title: tour.title || '',
        destination: tour.destination || '',
        description: tour.description || '',
        price: tour.price || '',
        duration: tour.duration || '',
        availableSeats: tour.availableSeats || '',
        numDays: tour.numDays || '',
        startDate: tour.startDate ? new Date(tour.startDate).toISOString().split('T')[0] : '',
        category: tour.category || '',
        images: tour.images || []
      });
    }
  }, [tour, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tours/${tour._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedTour = await response.json();
        onSave(updatedTour);
        onClose();
        alert('Tour updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating tour:', error);
      alert('Failed to update tour. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-tour-modal">
        <div className="modal-header">
          <h2>Edit Tour</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-tour-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Tour Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="destination">Destination *</label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (Rs) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="availableSeats">Available Seats *</label>
              <input
                type="number"
                id="availableSeats"
                name="availableSeats"
                value={formData.availableSeats}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration *</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 3 Days 2 Nights"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="numDays">Number of Days *</label>
              <input
                type="number"
                id="numDays"
                name="numDays"
                value={formData.numDays}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Adventure">Adventure</option>
                <option value="Cultural">Cultural</option>
                <option value="Nature">Nature</option>
                <option value="Historical">Historical</option>
                <option value="Family">Family</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Tour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTourModal;
