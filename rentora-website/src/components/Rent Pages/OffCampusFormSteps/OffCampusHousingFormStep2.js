import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { db } from "../../config";
import Stepper from './Stepper';
import './styles.css';

const OffCampusHousingFormStep2 = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleInitial: '',
    dateOfBirth: '',
  });

  // Update formData when the user object changes
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
              // Set middleInitial either from the database or from the user object, then fallback to current form data
              middleInitial: data.middleInitial || (user.middleName ? user.middleName.charAt(0).toUpperCase() : currentFormData.middleInitial),
              // Set dateOfBirth from the database, then fallback to current form data
              dateOfBirth: data.dateOfBirth || currentFormData.dateOfBirth,
            }));
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }
  }, [user]);  

  // Function to handle the navigation to the next step
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
        navigate('/rent/off-campus/step3');
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
    }
  };

  return (
    <div className="form-container" style={{ width: '50%', margin: '60px auto', maxHeight: '80vh', overflowY: 'auto', overflowX: 'auto', padding: '20px' }}>
      <Stepper currentStep={1} />
      <h2 className="step-title">Name and Date of Birth</h2>
      <p className="step-description">Confirm This Is Your Legal Name and Enter Your Date of Birth*</p>

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
  );
};

export default OffCampusHousingFormStep2;
