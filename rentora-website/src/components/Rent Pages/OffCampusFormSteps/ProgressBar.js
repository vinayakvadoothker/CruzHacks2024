import React, { useRef, useEffect } from 'react';
import './ProgressBar.css';

const ProgressBar = ({ steps, currentStep, onStepChange }) => {
  const progressBarRef = useRef(null);

  const scroll = (direction) => {
    if (progressBarRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150; // Adjust based on the size of your steps and gaps
      progressBarRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.scrollLeft = 0; // Set initial scroll position to the far left
    }
  }, []);
  

  return (
    <div className="progress-bar-container">
      <button className="arrow-button left-arrow" onClick={() => scroll('left')}>&#10094;</button>
      <div className="progress-bar" ref={progressBarRef}>
        {steps.map((step, index) => (
          <div
            key={index}
            className={`hexagon ${currentStep === index ? 'active' : ''} ${step.completed ? 'completed' : ''}`}
            onClick={() => onStepChange && onStepChange(index)}
          >
            <div className="hexagon-inner">
              <div className="hexagon-content">{index + 1}</div>
            </div>
            <span className="hexagon-tooltip">{step.title}</span>
          </div>
        ))}
      </div>
      <button className="arrow-button right-arrow" onClick={() => scroll('right')}>&#10095;</button>
    </div>
  );
};

export default ProgressBar;
