import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from "../../config";
import { useUser } from "@clerk/clerk-react";
import Stepper from './Stepper';
import './styles.css'; // Import the CSS file

import { useSteps } from './StepContext';
import ProgressBar from './ProgressBar';


const OffCampusHousingFormStep16 = () => {
  const { user } = useUser();
  const navigate = useNavigate();


  const { steps, completeStep } = useSteps(); // Use the useSteps hook
  const currentStep = 15; // Step index starts from 0, so step 3 is index 2
  const onStepChange = (stepIndex) => {
    navigate(`/rent/off-campus/step${stepIndex + 1}`);
  };


    const [errorMessage] = useState('');
    const [formData, setFormData] = useState({
        creditCards: [],
    });

    useEffect(() => {
        // Fetch and set the saved data when the component mounts
        if (user) {
            db.collection('SurveyResponses')
                .doc(user.id)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        const savedData = doc.data().creditCards || [];

                        setFormData(prevData => ({
                            ...prevData,
                            creditCards: savedData,
                        }));
                    }
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [user]);

    const handleInputChange = (index, value) => {
        setFormData((prevData) => {
            const updatedCreditCards = [...prevData.creditCards];
            updatedCreditCards[index].name = value;
            return {
                ...prevData,
                creditCards: updatedCreditCards,
            };
        });
    };

    const handleAddCard = () => {
        setFormData((prevData) => ({
            ...prevData,
            creditCards: [...prevData.creditCards, { name: '' }],
        }));
    };

    const handleDeleteCard = (index) => {
        setFormData((prevData) => {
            const updatedCreditCards = [...prevData.creditCards];
            updatedCreditCards.splice(index, 1);
            return {
                ...prevData,
                creditCards: updatedCreditCards,
            };
        });
    };

    const saveAnswer = () => {
        // Validation logic here
        const isCreditCardsEmpty = formData.creditCards.some(card => card.name.trim() === '');

        if (isCreditCardsEmpty) {
            // Display an alert or error message
            alert('Please enter a name for each credit card before proceeding.');
            return;
        }

        const formattedData = {
            creditCards: formData.creditCards.map(card => ({
                name: card.name.trim(),
            })),
        };


        db.collection('SurveyResponses')
            .doc(user.id)
            .update({ creditCards: formattedData.creditCards })
            .then(() => {
                console.log("Document successfully updated!");
                completeStep(currentStep);
                navigate('/rent/off-campus/step17');
            })
            .catch((error) => {
                console.error("Error updating document: ", error);
            });
    };

    return (
        <>
        <ProgressBar steps={steps} currentStep={currentStep} onStepChange={onStepChange} />
        <div className="form-container" >
          <Stepper currentStep={currentStep} /> {/* Update Stepper with currentStep */}
          <h2 className="step-title">{steps[currentStep].title}</h2> {/* Display the step title */}
            <p className="step-description">(Optional) Please List All Your Credit Cards</p>

            {formData.creditCards.map((card, index) => (
                <div key={index} className="card-entry">
                    <input
                        type="text"
                        value={card.name}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                    />
                    <button onClick={() => handleDeleteCard(index)}> - </button>
                </div>
            ))}

            <div className="add-another-container">
                <button onClick={handleAddCard}>+ Add Another</button>
            </div>

            <Link to="/rent/off-campus/step15">
                <span className="back-button">{'<-'}</span>
            </Link>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <button className="next-button" onClick={saveAnswer}>
                Next
            </button>
        </div>
        </>
    );
};

export default OffCampusHousingFormStep16;
