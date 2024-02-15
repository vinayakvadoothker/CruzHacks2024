import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from "../../config";
import { useUser } from "@clerk/clerk-react";
import './styles.css'; // Import the CSS file

const OffCampusHousingFormStep6 = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [isReferenceFormCompleted, setIsReferenceFormCompleted] = useState(false);

  // Initialize state with default values
  const [formData, setFormData] = useState({
    college: '',
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
            const savedData = doc.data();
            if (savedData.college && savedData.college.name) {
              // If the saved data includes college information, set it in the state
              setFormData({
                college: savedData.college.name,
                schoolName: savedData.schoolName || '',
              });
            } else {
              // If the saved data doesn't include college information, set default values
              setFormData({
                college: '',
                schoolName: '',
              });
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }
  }, [user]);

  useEffect(() => {
    // Check if the schoolName is not UC Santa Cruz, then navigate to the next step
    if (formData.schoolName !== 'UC Santa Cruz' && formData.schoolName !== '') {
      navigate('/rent/off-campus/step7'); // Navigate to the next step
    }
  }, [formData.schoolName, navigate]);

  const handleReferenceFormClick = () => {
    // Open the reference form link in a new tab or window
    window.open("http://studenthousing.ucsc.edu/");

    // Mark the reference form as completed
    setIsReferenceFormCompleted(true);

    // Show an alert to notify the user
    alert("UCSC Reference Release Form Completed!");
  };

  const saveAnswer = () => {
    if (user && formData.college && isReferenceFormCompleted) {
      const collegeInfo = getCollegeInfo(formData.college);
      
      db.collection('SurveyResponses')
        .doc(user.id)
        .update({
          college: {
            name: formData.college,
            address: collegeInfo.address,
            phoneNumber: collegeInfo.phoneNumber,
          },
        })
        .then(() => {
          console.log("Document successfully updated!");
          // Navigate to the next step (Step 7)
          navigate('/rent/off-campus/step7');
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    } else {
      setErrorMessage("Please select a valid college and complete the UCSC Reference Release Form");
    }
  };

  const getCollegeInfo = (college) => {
    // Define the campus address and phone number for each college
    const collegeInfo = {
      'Cowell College': {
        address: "520 Cowell-Stevenson Road, Santa Cruz, CA 95064",
        phoneNumber: "(831) 459-2173",
      },
      'Stevenson College': {
        address: "520 Cowell-Stevenson Road, Santa Cruz, CA 95064",
        phoneNumber: "(831) 459-2173",
      },
      'Merrill College': {
        address: "655 Merrill Service Road, Santa Cruz, CA 95064",
        phoneNumber: "(831) 459-5689",
      },
      'Crown College': {
        address: "655 Merrill Service Road, Santa Cruz, CA 95064",
        phoneNumber: "(831) 459-5689",
      },
      'College 9': {
        address: "702 College Nine Rd, Santa Cruz, CA 95064",
        phoneNumber: "(831) 459-2100",
      },
      'John R. Lewis College': {
        address: "702 College Nine Rd, Santa Cruz, CA 95064",
        phoneNumber: "(831) 459-2100",
      },
      'Kresge College': {
        address: "Programs Annex, 510 Porter-Kresge Rd, Santa Cruz, CA 95064",
        phoneNumber: "(831) 459-4433",
      },
      'Porter College': {
        address: "Programs Annex, 510 Porter-Kresge Rd, Santa Cruz, CA 95064",
        phoneNumber: "(831) 459-4433",
      },
      'Rachel Carson College': {
        address: "B-L, 6 College Eight Service Rd, Santa Cruz, CA 95064",
        phoneNumber: "(831) 459-4505",
      },
      'Oakes College': {
        address: "Oakes Cafe, 1156 High St, Santa Cruz, CA 95064",
        phoneNumber: "(831) 459-4505",
      },
      // Add entries for other colleges as needed
      // ...
    };

    return collegeInfo[college] || {};
  };

  const isNextButtonDisabled = formData.college === '' || formData.college === 'Select a College' || !isReferenceFormCompleted;

  return (
    <div className="form-container">
    <h2 className="step-title">College Affiliation</h2>
      <p className="step-description">Select your college:</p>

      {/* Dropdown for selecting the college */}
      <select
        id="college"
        className="input-field"
        value={formData.college}
        onChange={(e) => {
          setFormData((prevData) => ({
            ...prevData,
            college: e.target.value,
          }));
          setErrorMessage(''); // Clear error message when the user makes a selection
        }}
      >
        <option value="Select A College">Select A College</option>
        <option value="Cowell College">Cowell College</option>
        <option value="Stevenson College">Stevenson College</option>
        <option value="Merrill College">Merrill College</option>
        <option value="Crown College">Crown College</option>
        <option value="College 9">College 9</option>
        <option value="John R. Lewis College">John R. Lewis College</option>
        <option value="Kresge College">Kresge College</option>
        <option value="Porter College">Porter College</option>
        <option value="Rachel Carson College">Rachel Carson College</option>
        <option value="Oakes College">Oakes College</option>
      </select>

      {/* Button to complete the UCSC Reference Release Form */}
      <button
        className="reference-form-button"
        onClick={handleReferenceFormClick}
      >
        UCSC Reference Release Form (Must Complete)
      </button>

      {/* Learn More button linking to the provided URL */}
      <a
        href="https://communityrentals.ucsc.edu/renters/before-you-rent/rental-application-packet.html#:~:text=Visit%20the%20Housing%20Portal"
        target="_blank"
        rel="noopener noreferrer"
        className="learn-more-button"
      >
        Learn More
      </a>

      {/* Back button to navigate to the previous step */}
      <Link to="/rent/off-campus/step5">
        <span className="back-button">{'<-'}</span>
      </Link>

      {/* Display error message if any */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Button to submit the form and navigate to the next step */}
      <button
        className="next-button"
        onClick={saveAnswer}
        disabled={isNextButtonDisabled}
      >
        Next
      </button>
    </div>
  );
};

export default OffCampusHousingFormStep6;
