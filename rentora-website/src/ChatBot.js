import React, { useEffect, useState } from 'react';
import { Widget, addResponseMessage } from 'react-chat-widget';

import 'react-chat-widget/lib/styles.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initialize the chatbot conversation with a welcome message
    addResponseMessage('Welcome to our ChatBot!');
  }, []);

  const handleNewUserMessage = async (newMessage) => {
    try {
      const apiUrl = 'https://api.openai.com/v1/assistants';
      const requestData = {
        model: 'gpt-3.5-turbo-1106',
        prompt: newMessage,
        max_tokens: 150,
        temperature: 0.7
      };
  
      if (!process.env.OPENAI_API_KEY) {
        console.log(process.env.OPENAI_API_KEY);
        throw new Error('OpenAI API key is not set in environment variables');
      }
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v1'  // Add this line
        },
        body: JSON.stringify(requestData),
      });
  
      const data = await response.json();
  
      if (!data.choices || data.choices.length === 0 || !data.choices[0].text) {
        throw new Error('Invalid response from OpenAI API');
      }
  
      addResponseMessage(data.choices[0].text.trim());
    } catch (error) {
      console.error('Error fetching response from OpenAI:', error);
      addResponseMessage('Sorry, there was an error processing your request.');
    }
  };

  const toggleChatBot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button className="chatbot-toggle-button" onClick={toggleChatBot}>
      <Widget
        handleNewUserMessage={handleNewUserMessage}
        title="ChatBot"
        subtitle="Chat with our assistant"
        showCloseButton={true}
        fullScreenMode={false}
        isOpen={isOpen}
      />
      </button>
    </div>
  );
};

export default ChatBot;