import React, { useState, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import './ChatModal.css';

const ChatModal = ({ isOpen, onClose, organizer = 'organizer' }) => {
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (isOpen && token) {
      fetchMessages(token, organizer);
    } else if (isOpen && !token) {
      alert('Please login to chat');
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, organizer]);

  const fetchMessages = async (token, org) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${org}`, {
        headers: { Authorization: token },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Session expired. Please login again.');
        onClose();
        window.location.reload(); // force re-render without router
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to send message');
      onClose();
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/messages/${organizer}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ content: newMessage }),
      });
      if (response.ok) {
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Session expired. Please login again.');
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        {/* Chat Sidebar */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h4>All Chats</h4>
          </div>
          <div className="chat-list">
            {/* This would be populated with actual chat list */}
            <div className={`chat-item ${organizer === organizer ? 'active' : ''}`}
                 onClick={() => {}}>
              <div className="chat-name">{organizer}</div>
              <div className="chat-last-message">Current conversation</div>
            </div>
            {/* Add more chat items as needed */}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          <div className="chat-header">
            <h3>Chat with {organizer}</h3>
            <button onClick={onClose} className="close-btn">×</button>
          </div>
          <div className="chat-messages">
            {loading ? (
              <p>Loading messages...</p>
            ) : messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`message ${msg.from === user?.username ? 'sent' : 'received'}`}
                >
                  {msg.content}
                  <div className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))
            ) : (
              <p>No messages yet. Start the conversation!</p>
            )}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} className="send-btn">
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
