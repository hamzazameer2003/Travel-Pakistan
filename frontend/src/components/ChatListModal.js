import React, { useState, useEffect } from 'react';
import './ChatListModal.css';

const ChatListModal = ({ isOpen, onClose, onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('token');
      if (token) {
        fetchChats(token);
      } else {
        alert('Please login to view chats');
        onClose();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchChats = async (token) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/chats', {
        headers: { Authorization: token },
      });
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Session expired. Please login again.');
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (chat) => {
    onSelectChat(chat.organizer);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="chat-list-overlay" onClick={onClose}>
      <div className="chat-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-list-header">
          <h3>Your Chats</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="chat-list-content">
          {loading ? (
            <p>Loading chats...</p>
          ) : chats.length > 0 ? (
            chats.map((chat) => (
              <div key={chat.organizer} className="chat-item" onClick={() => handleSelectChat(chat)}>
                <div className="chat-info">
                  <div className="chat-name">{chat.organizer}</div>
                  <div className="chat-last-message">{chat.lastMessage}</div>
                </div>
                <div className="chat-time">
                  {new Date(chat.lastTime).toLocaleDateString()}
                </div>
                {chat.unread > 0 && (
                  <div className="unread-badge">{chat.unread}</div>
                )}
              </div>
            ))
          ) : (
            <p>No chats yet. Start a conversation!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListModal;
