import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaUser, FaPaperPlane } from 'react-icons/fa';
import './VirtualTourGuide.css';

const VirtualTourGuide = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "🧞‍♂️ **Assalam-u-Alaikum! I am your AI Virtual Tour Guide for Pakistan!**\n\nI can help you with:\n• 🗺️ Travel planning and itinerary suggestions\n• 🏛️ Information about Pakistani culture and heritage\n• 🏔️ Best places to visit in different seasons\n• 🏨 Accommodation and transportation recommendations\n• 🇵🇰 Local customs and traditions\n• 🍽️ Food and street food recommendations\n\n**What would you like to know about your Pakistan adventure?** 🇵🇰✈️",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real AI response from OpenAI API
  const getAIResponse = async (userMessage) => {
    try {
      const response = await fetch('http://localhost:5000/api/ai-tour-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        return data.response;
      } else {
        throw new Error('AI service unavailable');
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      // Fallback response
      return `🇵🇰 I apologize, but I'm experiencing a connection issue. However, I'm still here to help! Can you please rephrase your question about Pakistan tourism? I'm knowledgeable about destinations, culture, food, travel planning, and much more about this beautiful country!`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessageObj = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessageObj]);
    setInputMessage('');
    setIsTyping(true);

    // Get AI response
    try {
      const aiResponse = await getAIResponse(inputMessage);
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const fallbackMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: '🇵🇰 I apologize, but I\'m experiencing a temporary connection issue. Please try again in a moment!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    }

    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="virtual-tour-guide chatgpt-style">
      <div className="vtg-chat-container">
        <div className="vtg-messages">
          {messages.map((message) => (
            <div key={message.id} className={`vtg-message vtg-${message.type}`}>
              <div className="vtg-message-content">
                <div className="vtg-message-header">
                  {message.type === 'ai' ? (
                    <>
                      <FaRobot size={16} />
                      <span>AI Tour Guide</span>
                    </>
                  ) : (
                    <>
                      <FaUser size={16} />
                      <span>You</span>
                    </>
                  )}
                </div>
                <div className="vtg-message-text">
                  {message.content.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                <div className="vtg-message-time">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="vtg-message vtg-ai">
              <div className="vtg-message-content">
                <div className="vtg-message-header">
                  <FaRobot size={16} />
                  <span>AI Tour Guide</span>
                </div>
                <div className="vtg-typing">
                  <div className="vtg-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="vtg-input-container">
          <div className="vtg-input-wrapper">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about Pakistan tourism, culture, food, weather, visas..."
              className="vtg-input"
            />
            <button
              onClick={handleSendMessage}
              className="vtg-send-btn"
              disabled={!inputMessage.trim() || isTyping}
            >
              <FaPaperPlane size={16} />
            </button>
          </div>
          <div className="vtg-hint">
            💡 Try asking: "Best places to visit in Pakistan" or "What to eat in Lahore" or "When is best time to visit northern areas"
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTourGuide;
