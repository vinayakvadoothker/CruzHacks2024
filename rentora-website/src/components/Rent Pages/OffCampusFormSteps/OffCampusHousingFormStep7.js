import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from "../../config";
import { useUser } from "@clerk/clerk-react";
import Stepper from './Stepper';
import './styles.css'; // Import the CSS file

import { useSteps } from './StepContext';
import ProgressBar from './ProgressBar';


const OffCampusHousingFormStep7 = () => {
  const { user } = useUser();
  const navigate = useNavigate();


  const { steps, completeStep } = useSteps(); // Use the useSteps hook
  const currentStep = 6; // Step index starts from 0, so step 3 is index 2
  const onStepChange = (stepIndex) => {
    navigate(`/rent/off-campus/step${stepIndex + 1}`);
  };

  // Initialize state with default values
  const [formData, setFormData] = useState({
    studentId: '',
    schoolName: '', // Add schoolName to formData
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
    // Save the student ID to the database
    if (user && /^[0-9]+$/.test(formData.studentId)) {
      db.collection('SurveyResponses')
        .doc(user.id)
        .update({ studentId: formData.studentId })
        .then(() => {
          console.log("Document successfully updated!");
          // Navigate to the next step based on schoolName
          if (formData.schoolName === 'UC Santa Cruz') {
            completeStep(currentStep);
            navigate('/rent/off-campus/step8'); // Redirect to Step 8
          } else {
            navigate('/rent/off-campus/step5'); // Redirect to Step 5
          }
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    }
  };

  const handleInputChange = (e) => {
    // Allow only numbers to be typed
    const inputValue = e.target.value;
    if (/^[0-9]*$/.test(inputValue)) {
      setFormData((prevData) => ({
        ...prevData,
        studentId: inputValue,
      }));
    }
  };

  const isNextButtonDisabled = formData.studentId === '';

  return (
    <>
    <ProgressBar steps={steps} currentStep={currentStep} onStepChange={onStepChange} />
    <div className="form-container" >
      <Stepper currentStep={currentStep} /> {/* Update Stepper with currentStep */}
      <h2 className="step-title">{steps[currentStep].title}</h2> {/* Display the step title */}
      <p className="step-description">Please input your {formData.schoolName} ID:</p>

      {/* Input field for entering the student ID */}
      <input
        type="text"
        id="studentId"
        className="input-field"
        value={formData.studentId}
        onChange={handleInputChange}
      />

      {/* Back button to navigate to the previous step */}
      <Link to={formData.schoolName === 'UC Santa Cruz' ? "/rent/off-campus/step6" : "/rent/off-campus/step5"}>
        <span className="back-button">{'<-'}</span>
      </Link>

      {/* Button to submit the form and navigate to the next step */}
      <button
        className="next-button"
        onClick={saveAnswer}
        disabled={isNextButtonDisabled}
      >
        Next
      </button>
    </div>
    </>
  );
};

export default OffCampusHousingFormStep7;
