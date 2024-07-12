import React from 'react';
import './Stepper.css';

const ProgressBarStepper = ({ currentStep }) => {
    const progressPercentage = ((currentStep + 1) / 3) * 100;
  
    return (
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
      </div>
    );
  };

export default ProgressBarStepper;
