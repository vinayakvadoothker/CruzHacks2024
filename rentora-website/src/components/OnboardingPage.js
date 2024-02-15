import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SignUp from './SignUp';
import SignIn from './SignIn';
import '../App.css';
import './OnboardingPage.css'

const OnboardingPage = () => {
  const [isSignUpPopupOpen, setSignUpPopupOpen] = useState(false);
  const [isSignInPopupOpen, setSignInPopupOpen] = useState(false);
  const navigate = useNavigate(); // useNavigate hook

  const handleSignUpClick = () => {
    setSignUpPopupOpen(true);
    setSignInPopupOpen(false);
  };

  const handleSignInClick = () => {
    setSignInPopupOpen(true);
    setSignUpPopupOpen(false);
  };

  const handleClosePopup = () => {
    setSignUpPopupOpen(false);
    setSignInPopupOpen(false);
    navigate('/onboarding');
  };

  return (
    <div className="onboarding-page">
      <header>
      </header>
      <h1 className="title">Rentora</h1>
      <Link to="#" className="sign-up-btn" onClick={handleSignUpClick}>
        Sign Up
      </Link>
      <Link to="#" className="sign-in-btn" onClick={handleSignInClick}>
        Sign In
      </Link>
      {isSignUpPopupOpen && <SignUp onClose={handleClosePopup} />}
      {isSignInPopupOpen && <SignIn onClose={handleClosePopup} />}


    </div>
  );
};

export default OnboardingPage;
