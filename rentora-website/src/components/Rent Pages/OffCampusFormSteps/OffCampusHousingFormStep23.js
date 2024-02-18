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

    const handleSubmit = async () => {
        setIsGeneratingPDF(true);
        try {
            await db.collection('SurveyResponses').doc(user.id).update({
                offcampusformdone: true,
            });

            const response = await axios.get(`http://localhost:3010/generate-pdf/${user.id}`, {
                responseType: 'blob',
            });

            console.log('Response from server:', response);

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

    return (
        <>
      <ProgressBar steps={steps} currentStep={currentStep} onStepChange={onStepChange} />
      <div className="form-container" >
        <Stepper currentStep={currentStep} /> {/* Update Stepper with currentStep */}
        <h2 className="step-title">{steps[currentStep].title}</h2> {/* Display the step title */}
                <p className="step-description">If There is an x Below, Please Have Your Guarantor Fill Out The Guarantor Form</p>

                <div className="status-indicator">
                    {isGeneratingPDF ? (
                        <Spinner />
                    ) : guarantorFormFilled ? (
                        <span className="check-mark">&#10004;</span>
                    ) : (
                        <>
                            <span className="red-x">&#10006;</span>
                            <button onClick={handleReload} className="reload-button">
                                &#x21bb; {/* Unicode character for a clockwise open circle arrow */}
                            </button>
                        </>
                    )}
                </div>

                {guarantorFormFilled && (
                    <button className="submit-button" onClick={handleSubmit}>
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
