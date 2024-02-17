import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { db } from "../../config";
import Stepper from './Stepper';
import { useSteps } from './StepContext'; // Import useSteps from StepContext
import ProgressBar from './ProgressBar'; // Import ProgressBar component
import './styles.css';

const OffCampusHousingFormStep2 = () => {
  const { steps, completeStep } = useSteps(); // Use useSteps to access steps and completeStep function
  const currentStep = 1; // Set current step index to 1 for Step 2
  const { user } = useUser();
  const navigate = useNavigate();

  const onStepChange = (stepIndex) => {
    navigate(`/rent/off-campus/step${stepIndex + 1}`);
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleInitial: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    if (user) {
      db.collection('SurveyResponses').doc(user.id).get()
        .then((doc) => {
          if (doc.exists) {
            const data = doc.data();
            setFormData((currentFormData) => ({
              ...currentFormData,
              firstName: user.firstName || currentFormData.firstName,
              lastName: user.lastName || currentFormData.lastName,
              middleInitial: data.middleInitial || (user.middleName ? user.middleName.charAt(0).toUpperCase() : currentFormData.middleInitial),
              dateOfBirth: data.dateOfBirth || currentFormData.dateOfBirth,
            }));
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }
  }, [user]);

  const handleNext = () => {
    const { firstName, lastName, dateOfBirth } = formData;

    if (!firstName.trim() || !lastName.trim() || !dateOfBirth.trim()) {
      alert("Please enter your First Name, Last Name, and Date of Birth.");
      return;
    }

    if (user) {
      db.collection('SurveyResponses').doc(user.id).update({
        ...formData,
      })
        .then(() => {
          console.log("Document successfully updated!");
          completeStep(currentStep); // Mark the current step as completed
          navigate('/rent/off-campus/step3'); // Navigate to the next step
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    }
  };

  return (
    <>
      <ProgressBar steps={steps} currentStep={currentStep} onStepChange={onStepChange} />
      <div className="form-container">
        <Stepper currentStep={currentStep} /> {/* Update Stepper's currentStep as well */}
        <h2 className="step-title">{steps[currentStep].title}</h2> {/* Display the step title from steps state */}
        <p className="step-description">Please Enter or Confirm This Is Your Legal Name and Enter Your Date of Birth</p>

        <input
          type="text"
          placeholder="First Name"
          className="input-field"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        />
        <input
          type="text"
          placeholder="Middle Initial (Optional)"
          maxLength={1}
          className="input-field"
          value={formData.middleInitial}
          onChange={(e) => setFormData({ ...formData, middleInitial: e.target.value.toUpperCase() })}
        />
        <input
          type="text"
          placeholder="Last Name"
          className="input-field"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        />
        <label htmlFor="dateOfBirth">Enter Date of Birth:</label>
        <input
          type="date"
          id="dateOfBirth"
          placeholder="Date of Birth"
          className="input-field"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
        />

        <Link to="/rent/off-campus/step1">
          <span className="back-button">{'<-'}</span>
        </Link>
        <button className="next-button" onClick={handleNext}>
          Next
        </button>
      </div>
    </>
  );
};

export default OffCampusHousingFormStep2;
