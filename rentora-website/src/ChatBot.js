import React, { useState, useEffect } from 'react';
import { Widget, addResponseMessage, toggleWidget } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';

const ChatBot = () => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initial welcome message
    addResponseMessage("Welcome to Rentora AI Assistant!");
  }, []);

  const handleNewUserMessage = async (message) => {
    setIsLoading(true);
    try {
      const response = await fetchAssistantDetails(message);
      addResponseMessage(response.content); // Assuming 'content' holds the response message
    } catch (error) {
      console.error('Error:', error);
      addResponseMessage("Sorry, I can't process your message right now.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch assistant details from the server
  const fetchAssistantDetails = async (userMessage) => {
    const response = await fetch('/api/assistant', {
      method: 'GET', // or 'POST' if your server expects a POST request
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  };

  return (
    <div>
      <button onClick={() => toggleWidget()}>Toggle Chat</button>
      <Widget
      handleNewUserMessage={handleNewUserMessage}
      title="Rentora AI Assistant"
      subtitle={isLoading ? "One moment please..." : "Ask me anything!"}
    />
    </div>
  );
};

export default ChatBot;
