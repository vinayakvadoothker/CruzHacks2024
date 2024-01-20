import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Widget, addResponseMessage, toggleWidget } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false); // State to control widget visibility

  useEffect(() => {
    // Initialize the chatbot conversation with a welcome message
    addResponseMessage('Welcome to our ChatBot!');
  }, []);

  const handleNewUserMessage = async (newMessage) => {
    try {
      const apiUrl = 'https://api.openai.com/v1/engines/text-davinci-003/completions'; 
      const requestData = {
        prompt: newMessage,
        max_tokens: 150,
        temperature: 0.7
      };
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
      };
  
      const response = await axios.post(apiUrl, requestData, { headers });
      const aiResponse = response.data.choices[0].text.trim();
  
      addResponseMessage(aiResponse);
    } catch (error) {
      console.error('Error fetching response from OpenAI:', error);
      addResponseMessage('Sorry, there was an error processing your request.');
    }
  };
  
  return (
    <div>
    <div>
      <button className="chatbot-toggle-button" onClick={() => setIsOpen(!isOpen)}>
      <Widget
        handleNewUserMessage={handleNewUserMessage}
        title="ChatBot"
        subtitle="Chat with our assistant"
        showCloseButton={true}
        fullScreenMode={false}
        isOpen={isOpen}
      />      </button>
      
    </div>

    </div>
  );
};

export default ChatBot;
