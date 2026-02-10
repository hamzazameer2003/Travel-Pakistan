import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTour.css';

const CreateTour = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    availableSeats: '',
    numDays: '',
    price: '',
    startDate: '',
    destination: '',
    category: 'Adventure',
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    // Compress and convert to base64
    Promise.all(files.map(compressImage)).then(compressed => {
      setImages(compressed);
    }).catch(err => {
      setError('Failed to compress images');
    });
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Aggressive compression: max 600x600, quality 0.6 for high compression
        const maxSize = 600;
        let { width, height } = img;

        // Maintain aspect ratio, fit within maxSize
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Compress at 0.6 quality for smaller size
        canvas.toBlob(
          (blob) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
          },
          'image/jpeg',
          0.6
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (images.length === 0) {
      setError('At least one image is required');
      return;
    }

    setLoading(true);
    const duration = `${formData.numDays} Days`;

    try {
      const response = await fetch('http://localhost:5000/api/tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          ...formData,
          duration,
          images,
        }),
      });
      if (response.ok) {
        setError('');
        navigate('/tours'); // Go to tours page to see new tour
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create tour');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-tour">
      <h1>Create New Tour</h1>
      {error && <p className="error">{error}</p>}
      <form className="tour-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Title:</label>
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
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
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
            <label htmlFor="availableSeats">Available Seats:</label>
            <input
              type="number"
              id="availableSeats"
              name="availableSeats"
              value={formData.availableSeats}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="numDays">Number of Days:</label>
            <input
              type="number"
              id="numDays"
              name="numDays"
              value={formData.numDays}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price per Person:</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date:</label>
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
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Adventure">Adventure</option>
              <option value="Cultural">Cultural</option>
              <option value="Beach">Beach</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="images">Images (Max 5):</label>
          <input
            type="file"
            id="images"
            multiple
            accept="image/*"
            onChange={handleImagesChange}
            required
          />
          <p className="hint">Images will be compressed for optimal performance</p>
          {images.length > 0 && <p>{images.length} image(s) selected</p>}
        </div>
        <button type="submit" disabled={loading} className="post-btn">
          {loading ? 'Posting...' : 'Post Tour'}
        </button>
        <button type="button" onClick={() => navigate('/dashboard')} className="cancel-btn">
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateTour;
