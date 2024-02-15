import React, { useState, useEffect } from 'react';
import { Widget, addResponseMessage } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import './ChatBot.css';

const ChatBot = () => {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize the chat widget and set up event handlers
    addResponseMessage('Thank You For Using Rentora - A Rental Assistant');
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  const handleNewUserMessage = (newMessage) => {
    if (newMessage.trim() === '') {
      // Handle empty user message, if needed
      return;
    }

    console.log('User Message:', newMessage); // Log user's message

    // Show loading indicator
    setIsLoading(true);

    // Send the user's message to your server and receive a response
    fetch('http://localhost:3005/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: newMessage }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {

          // Display the chatbot's response
          addResponseMessage(data.choices[0].message.content);
        } else {
          // Handle response format error, if needed
        }

        // Hide loading indicator
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error sending message:', error);
        // Hide loading indicator in case of an error
        setIsLoading(false);
      });
  };

  const toggleChat = () => {
    setIsWidgetOpen(!isWidgetOpen);
  };

  return (
    <div>
      <button onClick={toggleChat} className="open-chat-button">
        <Widget
          handleNewUserMessage={handleNewUserMessage}
          title="Rentora"
          subtitle="Ask Your Rental Questions"
          showChat={isWidgetOpen}
        />
        {isLoading && <div>Loading...</div>}
      </button>
    </div>
  );
};

export default ChatBot;