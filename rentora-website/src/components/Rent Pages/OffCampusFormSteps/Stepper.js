import React from 'react';
import './Stepper.css'; // Create a separate CSS file for styling

const ProgressBarStepper = ({ currentStep }) => {
    const progressPercentage = ((currentStep + 1) / 23) * 100;
  
    return (
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
      </div>
    );
  };

export default ProgressBarStepper;
