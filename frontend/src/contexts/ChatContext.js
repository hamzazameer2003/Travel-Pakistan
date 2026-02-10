import React, { createContext, useContext, useState } from 'react';

// Create chat context
const ChatContext = createContext();

// Custom hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Chat provider component
export const ChatProvider = ({ children }) => {
  const [chatWithOrganizer, setChatWithOrganizer] = useState(null);

  const openChatWith = (organizer) => {
    setChatWithOrganizer(organizer);
  };

  const closeChat = () => {
    setChatWithOrganizer(null);
  };

  const value = {
    chatWithOrganizer,
    openChatWith,
    closeChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
