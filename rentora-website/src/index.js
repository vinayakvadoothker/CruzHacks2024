// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const email = process.env.REACT_APP_EMAIL;
const password = process.env.REACT_APP_PASSWORD;
const openaikey = process.env.OPENAI_API_KEY;


// Load Google Maps API script
const googleMapsScript = document.createElement('script');
googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
googleMapsScript.async = true;
googleMapsScript.defer = true;
document.head.appendChild(googleMapsScript);

// Use createRoot instead of ReactDOM.render
const root = document.getElementById('root');
const createRoot = ReactDOM.createRoot(root);

// Wrap your app component in createRoot().render()
createRoot.render(
  <React.StrictMode>
    <Router>
      <App openaikey={openaikey} clerkPubKey={clerkPubKey} googleMapsApiKey={googleMapsApiKey} email={email} password={password} />
    </Router>
  </React.StrictMode>
);
