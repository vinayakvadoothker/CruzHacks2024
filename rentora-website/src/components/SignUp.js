import React, { useEffect } from 'react';
import {SignedOut, SignUp, useClerk } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';
import './OnboardingPage.css'

const SignupPopup = ({ onClose }) => {
  const navigate = useNavigate();
  const { session } = useClerk();

  const handleCloseClick = () => {
    onClose();
  };


  useEffect(() => {
    // Check if there is an active session and the user is signed in
    if (session && session.user) {
      // Redirect immediately after sign-in
      navigate('/rent/off-campus');
    }
  }, [session, navigate]);



  return (
    <SignedOut>
    <div className="popup-overlay">
      <div className="popup-content" style={popupStyles}>
        <button className="x-button" onClick={handleCloseClick}>
          X
        </button>
          <div className="clerk-signin-container">
              <SignUp>
              </SignUp>
          </div>
      </div>
    </div>
    </SignedOut>
  );
};

const popupStyles = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  height: '100%',
  background: 'rgba(255, 255, 255, 0.4)',
  overflow: 'hidden',
};

export default SignupPopup;
