import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from "../../config";
import { useUser } from "@clerk/clerk-react";
import Stepper from './Stepper';
import './styles.css'; // Import the CSS file

import { useSteps } from './StepContext';
import ProgressBar from './ProgressBar';


const OffCampusHousingFormStep10 = () => {
  const { user } = useUser();
  const navigate = useNavigate();


  const { steps, completeStep } = useSteps(); // Use the useSteps hook
  const currentStep = 9; // Step index starts from 0, so step 3 is index 2
  const onStepChange = (stepIndex) => {
    navigate(`/rent/off-campus/step${stepIndex + 1}`);
  };

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    // Fetch and set the saved data when the component mounts
    if (user) {
      db.collection('SurveyResponses')
        .doc(user.id)
        .get()
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

  const saveAnswer = () => {
    // Validate start and end dates
    const isValid = validateDates(formData.startDate, formData.endDate);

    if (user && isValid) {
      db.collection('SurveyResponses')
        .doc(user.id)
        .update({
          startDate: formData.startDate,
          endDate: formData.endDate,
        })
        .then(() => {
          console.log("Document successfully updated!");

          completeStep(currentStep);
          navigate('/rent/off-campus/step11');
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
          // Show error message using alert
          alert('An error occurred while saving. Please try again.');
        });
    }
  };

  const validateDates = (start, end) => {
    // Validate if start date is before end date
    if (start && end && new Date(start) > new Date(end)) {
      alert("End date must be after the Start date");
      return false;
    }

    // Validate if both dates are filled
    if (!start || !end) {
      alert("Please enter both Start and End dates");
      return false;
    }

    return true;
  };

  return (
    <>
      <ProgressBar steps={steps} currentStep={currentStep} onStepChange={onStepChange} />
      <div className="form-container" >
        <Stepper currentStep={currentStep} /> {/* Update Stepper with currentStep */}
        <h2 className="step-title">{steps[currentStep].title}</h2> {/* Display the step title */}
      <p className="step-description">Please Enter When You Enrolled and Plan To Graduate from {formData.schoolName}</p>

      {/* Date picker for start date */}
      <div className="date-picker-container">
        <label htmlFor="startDate">Enrollment Date:</label>
        <input
          type="date"
          id="startDate"
          className="input-field"
          value={formData.startDate}
          onChange={(e) => setFormData((prevData) => ({ ...prevData, startDate: e.target.value }))}
        />
      </div>

      {/* Date picker for end date */}
      <div className="date-picker-container">
        <label htmlFor="endDate">Graduation Date:</label>
        <input
          type="date"
          id="endDate"
          className="input-field"
          value={formData.endDate}
          onChange={(e) => setFormData((prevData) => ({ ...prevData, endDate: e.target.value }))}
        />
      </div>

      {/* Back button to navigate to the previous step */}
      <Link to="/rent/off-campus/step9">
        <span className="back-button">{'<-'}</span>
      </Link>

      {/* Button to submit the form and navigate to the next step */}
      <button
        className="next-button"
        onClick={saveAnswer}
      >
        Next
      </button>
    </div>
    </>
  );
};

export default OffCampusHousingFormStep10;
