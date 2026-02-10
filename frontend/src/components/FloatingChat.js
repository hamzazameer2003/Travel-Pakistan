import React, { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import ChatListModal from './ChatListModal';
import ChatModal from './ChatModal';
import './FloatingChat.css';

const FloatingChat = ({ initialChat = null }) => {
  const { chatWithOrganizer, closeChat } = useChat();
  const [listOpen, setListOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);

  useEffect(() => {
    if (initialChat) {
      setSelectedOrganizer(initialChat);
      setChatOpen(true);
    }
  }, [initialChat]);

  useEffect(() => {
    if (chatWithOrganizer) {
      setSelectedOrganizer(chatWithOrganizer);
      setChatOpen(true);
      closeChat(); // Reset context after opening chat
    }
  }, [chatWithOrganizer, closeChat]);

  const handleSelectChat = (organizer) => {
    setSelectedOrganizer(organizer);
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setSelectedOrganizer(null);
  };

  return (
    <>
      <button
        className="floating-chat-btn"
        onClick={() => setListOpen(true)}
      >
        💬
      </button>
      <ChatListModal
        isOpen={listOpen}
        onClose={() => setListOpen(false)}
        onSelectChat={handleSelectChat}
      />
      <ChatModal
        isOpen={chatOpen}
        onClose={handleCloseChat}
        organizer={selectedOrganizer}
      />
    </>
  );
};

export default FloatingChat;
