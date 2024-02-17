// OffCampusHousingFormStep3.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { db } from "../../config";
import Stepper from './Stepper';

import { useSteps } from './StepContext';
import ProgressBar from './ProgressBar';


import './styles.css'; // Import the CSS file

const OffCampusHousingFormStep3 = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { steps, completeStep } = useSteps(); // Use the useSteps hook
  const currentStep = 2; // Step index starts from 0, so step 3 is index 2

  const [formData, setFormData] = useState({
    email: user?.emailAddress || '', // Make sure to use the correct property from Clerk for the user's email
  });

  const onStepChange = (stepIndex) => {
    navigate(`/rent/off-campus/step${stepIndex + 1}`);
  };

  useEffect(() => {
    if (user) {
      db.collection('SurveyResponses').doc(user.id).get()
        .then((doc) => {
          if (doc.exists) {
            setFormData(doc.data());
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }
  }, [user]);

  const handleNext = () => {
    // Validate the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(formData.email);

    if (!isValid) {
      // Display validation error using alert
      alert("Please enter a valid email address.");
      return;
    }

    // Save the answer for Step 3
    const newFormData = {
      email: formData.email !== undefined ? formData.email : '',
      // Add more fields as needed
    };

    if (user) {

      // Update the document with the new data for Step 3
      db.collection('SurveyResponses').doc(user.id).update(newFormData)
        .then(() => {
          console.log("Document successfully updated!");
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    } else {
      console.log("User not authenticated");
    }

    // After saving to Firestore, mark the step as completed
    completeStep(currentStep);

    // Navigate to the next step
    navigate('/rent/off-campus/step4');
  };

  return (
    <>
      <ProgressBar steps={steps} currentStep={currentStep} onStepChange={onStepChange} />
      <div className="form-container" >
        <Stepper currentStep={currentStep} /> {/* Update Stepper with currentStep */}
        <h2 className="step-title">{steps[currentStep].title}</h2> {/* Display the step title */}
        <p className="step-description">Please Enter Your Email</p>

        {/* Input field for email with default value and validation */}
        <input
          type="text"
          placeholder="Email"
          className="input-field"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        {/* Back button to navigate to the previous step */}
        <Link to="/rent/off-campus/step2">
          <span className="back-button">{'<-'}</span>
        </Link>

        {/* Button to navigate to the next step */}
        <button className="next-button" onClick={handleNext}>
          Next
        </button>
      </div>
    </>
  );
};

export default OffCampusHousingFormStep3;
