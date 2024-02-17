import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from "../../config";
import { useUser } from "@clerk/clerk-react";
import Stepper from './Stepper';
import './styles.css'; // Import the CSS file

import { useSteps } from './StepContext';
import ProgressBar from './ProgressBar';


const OffCampusHousingFormStep15 = () => {
  const { user } = useUser();
  const navigate = useNavigate();


  const { steps, completeStep } = useSteps(); // Use the useSteps hook
  const currentStep = 14; // Step index starts from 0, so step 3 is index 2
  const onStepChange = (stepIndex) => {
    navigate(`/rent/off-campus/step${stepIndex + 1}`);
  };

    const [errorMessage] = useState('');
    const [formData, setFormData] = useState({
        checkingAccounts: [],
        savingsAccounts: [],
    });

    useEffect(() => {
        // Fetch and set the saved data when the component mounts
        if (user) {
            db.collection('SurveyResponses')
                .doc(user.id)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        const savedData = doc.data().bankAccounts || {};

                        const initialCheckingAccounts = savedData.checkingAccounts || [];
                        const initialSavingsAccounts = savedData.savingsAccounts || [];

                        setFormData(prevData => ({
                            ...prevData,
                            checkingAccounts: initialCheckingAccounts,
                            savingsAccounts: initialSavingsAccounts,
                        }));
                    }
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [user]);

    const handleInputChange = (accountType, index, value) => {
        setFormData((prevData) => {
            const updatedAccounts = [...prevData[accountType]];
            updatedAccounts[index].name = value;
            return {
                ...prevData,
                [accountType]: updatedAccounts,
            };
        });
    };

    const handleAddAccount = (accountType) => {
        setFormData((prevData) => ({
            ...prevData,
            [accountType]: [...prevData[accountType], { name: '' }],
        }));
    };

    const handleDeleteAccount = (accountType, index) => {
        setFormData((prevData) => {
            const updatedAccounts = [...prevData[accountType]];
            updatedAccounts.splice(index, 1);
            return {
                ...prevData,
                [accountType]: updatedAccounts,
            };
        });
    };

    const saveAnswer = () => {
        // Validation logic here
        const isCheckingAccountsEmpty = formData.checkingAccounts.some(account => account.name.trim() === '');
        const isSavingsAccountsEmpty = formData.savingsAccounts.some(account => account.name.trim() === '');
    
        if (isCheckingAccountsEmpty || isSavingsAccountsEmpty) {
            // Display an alert or error message
            alert('Please enter a name for each bank account before proceeding.');
            return;
        }
    
        const formattedData = {
            checkingAccounts: formData.checkingAccounts.map(account => ({
                name: account.name.trim(),
            })),
            savingsAccounts: formData.savingsAccounts.map(account => ({
                name: account.name.trim(),
            })),
        };
    
    
        db.collection('SurveyResponses')
            .doc(user.id)
            .update({ bankAccounts: formattedData })
            .then(() => {
                console.log("Document successfully updated!");
                completeStep(currentStep);
                navigate('/rent/off-campus/step16');
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
            <p className="step-description">(Optional) Please List All Your Bank Accounts (e.g. Wells Fargo, Bank Of America, etc.)</p>

            <div className="account-type-container">
                <h3>Checking</h3>
                {formData.checkingAccounts.map((account, index) => (
                    <div key={index} className="account-entry">
                        <input
                            type="text"
                            value={account.name}
                            onChange={(e) => handleInputChange('checkingAccounts', index, e.target.value)}
                        />
                        <button onClick={() => handleDeleteAccount('checkingAccounts', index)}> - </button>
                    </div>
                ))}
                <button onClick={() => handleAddAccount('checkingAccounts')}>+ Add Another</button>
            </div>

            <div className="account-type-container">
                <h3>Savings</h3>
                {formData.savingsAccounts.map((account, index) => (
                    <div key={index} className="account-entry">
                        <input
                            type="text"
                            value={account.name}
                            onChange={(e) => handleInputChange('savingsAccounts', index, e.target.value)}
                        />
                        <button onClick={() => handleDeleteAccount('savingsAccounts', index)}> - </button>
                    </div>
                ))}
                <button onClick={() => handleAddAccount('savingsAccounts')}>+ Add Another</button>
            </div>

            <Link to="/rent/off-campus/step14">
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

export default OffCampusHousingFormStep15;
