import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { db } from "../../config";
import axios from 'axios';
import Spinner from './Spinner';
import Stepper from './Stepper';
import './styles.css';

import { useSteps } from './StepContext';
import ProgressBar from './ProgressBar';


const OffCampusHousingFormStep23 = () => {
  const { user } = useUser();
  const navigate = useNavigate();


  const { steps, completeStep } = useSteps(); // Use the useSteps hook
  const currentStep = 22; // Step index starts from 0, so step 3 is index 2
  const onStepChange = (stepIndex) => {
    navigate(`/rent/off-campus/step${stepIndex + 1}`);
  };
  const [guarantorFormFilled, setGuarantorFormFilled] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isChecked, setIsChecked] = useState(false); // State to track checkbox status
  const [submissionComplete, setSubmissionComplete] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const doc = await db.collection('SurveyResponses').doc(user.id).get();
          if (doc.exists) {
            const formDataFromDb = doc.data();
            setGuarantorFormFilled(!!formDataFromDb.guarantorFormFilled);
          }
        } catch (error) {
          console.error('Error fetching guarantor form data:', error);
        }
      }
    };

    fetchData();
  }, [user]);

  const sendEmail = async (emailData) => {
    try {
      // Make a request to your server-side endpoint to send the email
      const response = await fetch('http://localhost:3001/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        console.log('Email sent successfully');
      } else {
        console.error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleSubmit = async () => {
    if (!isChecked) {
      alert('Please check the box to confirm the provided information.');
      return;
    }
    setIsGeneratingPDF(true);
    try {
      await db.collection('SurveyResponses').doc(user.id).update({
        offcampusformdone: true,
      });

      const response = await axios.get(`http://localhost:3010/generate-pdf/${user.id}`, {
        responseType: 'blob',
      });

      console.log('Response from server:', response);

      // Fetch the user's filled PDF URL from Firestore
      const pdfDoc = await db.collection('FilledPDFs').doc(`${user.id}`).get();
      if (!pdfDoc.exists) {
        throw new Error('No PDF found for the user.');
      }

      const pdfData = pdfDoc.data();
      const pdfUrl = pdfData[`${user.id}_filled.pdf`]; // Get the URL of the filled PDF
      const doc = await db.collection('SurveyResponses').doc(user.id).get();
      const formDataFromDb = doc.data();

      await sendEmail({
        to: formDataFromDb.email,
        subject: 'Rentora - Your Rental Profile and Appplication Packet',
        html: `Hello ${user.firstName || ''},<br><br>Thank You for choosing Rentora to build your Custom Rental Profile and Application Packet.<br><br>You can download your packet <a href="${pdfUrl}" download>here</a>.<br><br>Check Out Your New Rentora Profile and Share It: <a href="https://rentora.net/profiles/${user.id}">View Profile</a><br><br>Best regards,<br>Rentora Team`
      });

      setIsGeneratingPDF(false);
      completeStep(currentStep);
      navigate('/rent/off-campus');

    } catch (error) {
      console.error('Error saving form data:', error);
      setIsGeneratingPDF(false);
      alert('Error submitting form. Please try again.');
    }


  };

  const handleReload = () => {
    window.location.reload();
  };

  // Function to handle checkbox change
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked); // Toggle checkbox status
  };

  return (
    <>
      <ProgressBar steps={steps} currentStep={currentStep} onStepChange={onStepChange} />
      <div className="form-container" >
        <Stepper currentStep={currentStep} />
        <h2 className="step-title">{steps[currentStep].title}</h2>
        <p className="step-description">If There is an x Below, Please Have Your Guarantor Submit The Guarantor Form</p>

        <div className="welcome-description with-checkbox"> {/* Use the same styling as the welcome message */}
          <p>
            All information is provided by the aforementioned user of Rentora. Users of this form communicate, contact, and do business with individuals, companies, or firms at their own risk. Rentora makes no warranty, expressed or implied, or assumes any legal liability or responsibility for the accuracy, completeness, or usefulness of any information, or any actions occurring as a result of arrangements made between users of this form. Applicant represents that all the above statements are true and accurate and hereby authorizes verification of the above items including, but not limited to, the obtaining of a full credit report.
          </p>
          <label>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
            />
            I agree to the terms and conditions
          </label>
        </div>

        <div className="status-indicator">
          {isGeneratingPDF ? (
            <Spinner />
          ) : guarantorFormFilled ? (
            <span className="check-mark">&#10004;</span>
          ) : (
            <>
              <span className="red-x">&#10006;</span>
              <button onClick={handleReload} className="reload-button">
                &#x21bb;
              </button>
            </>
          )}
        </div>

        {guarantorFormFilled && (
          <button className="submit-button" onClick={handleSubmit} disabled={!isChecked}>
            Submit
          </button>
        )}

        <Link to="/rent/off-campus/step22">
          <span className="back-button">{'<-'}</span>
        </Link>
      </div>
    </>
  );
};

export default OffCampusHousingFormStep23;
