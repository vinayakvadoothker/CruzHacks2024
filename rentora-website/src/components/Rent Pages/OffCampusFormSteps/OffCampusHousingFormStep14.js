import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from "../../config";
import { useUser } from "@clerk/clerk-react";
import Stepper from './Stepper';
import './styles.css'; // Import the CSS file

import { useSteps } from './StepContext';
import ProgressBar from './ProgressBar';


const OffCampusHousingFormStep14 = () => {
    const { user } = useUser();
    const navigate = useNavigate();


    const { steps, completeStep } = useSteps(); // Use the useSteps hook
    const currentStep = 13; // Step index starts from 0, so step 3 is index 2
    const onStepChange = (stepIndex) => {
        navigate(`/rent/off-campus/step${stepIndex + 1}`);
    };


    const [errorMessage] = useState('');
    const [formData, setFormData] = useState({
        monthlyIncome2: [],
    });

    useEffect(() => {
        // Fetch and set the saved data when the component mounts
        if (user) {
            db.collection('SurveyResponses')
                .doc(user.id)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        const savedData = doc.data().monthlyIncome2 || [];

                        // Map the saved data to set initial form data
                        const initialFormData = savedData.map(entry => {
                            const source = entry.source || 'Select Source';
                            const otherSource = source === 'Other' ? entry.otherSource : '';

                            // If the source is not one of the predefined options, set it to "Other"
                            const isCustomSource = !['Employment', 'Parents', 'Student Loans', 'Scholarship', 'Other'].includes(source);
                            if (isCustomSource) {
                                return {
                                    source: 'Other',
                                    otherSource: source,
                                    amount: entry.amount || '',
                                };
                            }

                            return {
                                source: source,
                                otherSource: otherSource,
                                amount: entry.amount || '',
                            };
                        });


                        setFormData(prevData => ({
                            ...prevData,
                            monthlyIncome2: initialFormData,
                        }));
                    }
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [user]);


    const formatCurrency = (value) => {
        // Convert the value to a number
        const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));

        // Check if it's a valid number
        if (!isNaN(numericValue)) {
            // Format the number as currency (USD) with commas
            return numericValue.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            });
        }

        // If the value is not a valid number, return it as is
        return value;
    };

    const handleInputChange = (index, field, value) => {
        setFormData((prevData) => {
            const updatedmonthlyIncome2 = [...prevData.monthlyIncome2];
            updatedmonthlyIncome2[index][field] = field === 'amount' ? formatCurrency(value) : value;
            return {
                ...prevData,
                monthlyIncome2: updatedmonthlyIncome2,
            };
        });
    };

    const handleAddEntry = () => {
        setFormData((prevData) => ({
            ...prevData,
            monthlyIncome2: [...prevData.monthlyIncome2, {
                source: 'Select Source',
                amount: '',
                otherSource: '',
            }],
        }));
    };

    const handleDeleteEntry = (index) => {
        setFormData((prevData) => {
            const updatedmonthlyIncome2 = [...prevData.monthlyIncome2];
            updatedmonthlyIncome2.splice(index, 1);
            return {
                ...prevData,
                monthlyIncome2: updatedmonthlyIncome2,
            };
        });
    };

    const saveAnswer = () => {
        // Validation logic here
        const isValid = formData.monthlyIncome2.every(entry => entry.source !== '' && entry.amount !== '');

        if (!isValid) {
            // Display a popup or show an error message
            alert('Please choose a source type and provide the amount for each entry before proceeding.');
            return;
        }

        const isOtherSourceEmpty = formData.monthlyIncome2.some(entry => entry.source === 'Other' && entry.otherSource === '');

        if (isOtherSourceEmpty) {
            // Display an alert for entries with source set to "Other" and empty otherSource
            alert('Please specify the "Other" source before proceeding.');
            return;
        }

        // Check for undefined or empty source values
        const isSourceUndefined = formData.monthlyIncome2.some(entry => entry.source === undefined || entry.source === '' || entry.source === 'Select Source');

        if (isSourceUndefined) {
            // Display an alert for entries with undefined, empty, or "Select Source" values
            alert('Please choose a valid source type for each entry before proceeding.');
            return;
        }

        // Check for undefined or empty amount values
        const isAmountUndefined = formData.monthlyIncome2.some(entry => entry.amount === undefined || entry.amount === '');

        if (isAmountUndefined) {
            // Display an alert for entries with undefined or empty amount values
            alert('Please provide a valid amount for each entry before proceeding.');
            return;
        }

        const formattedData = {
            monthlyIncome2: formData.monthlyIncome2.map(entry => ({
                source: entry.source === 'Other' ? entry.otherSource : entry.source,
                amount: formatCurrency(entry.amount),
            })),
        };


        db.collection('SurveyResponses')
            .doc(user.id)
            .update(formattedData)
            .then(() => {
                console.log("Document successfully updated!");
                completeStep(currentStep);
                navigate('/rent/off-campus/step15');
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
                <p className="step-description">Please Add Any Monthly Income ($ Per Month):</p>

                {Array.isArray(formData.monthlyIncome2) && formData.monthlyIncome2.map((entry, index) => (
                    <div key={index} className="monthly-income-entry">
                        <div className="form-row income-entry">
                            <label>Source:</label>
                            <select
                                className='select-input-box'
                                value={entry.source}
                                onChange={(e) => handleInputChange(index, 'source', e.target.value)}
                            >
                                <option value="Select Source" disabled hidden>Select Source</option>
                                <option value="Employment">Employment</option>
                                <option value="Parents">Parents</option>
                                <option value="Student Loans">Student Loans</option>
                                <option value="Scholarship">Scholarship</option>
                                <option value="Other">Other</option>
                            </select>
                            {entry.source === 'Other' && (
                                <input

                                    type="text"
                                    value={entry.otherSource || ''}
                                    onChange={(e) => handleInputChange(index, 'otherSource', e.target.value)}
                                    placeholder="Specify Other Source"
                                />
                            )}
                            <label className="end-label">Amount:</label>
                            <input
                                className='select-input-box'

                                type="text"
                                value={entry.amount}
                                onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
                            />
                            <button onClick={() => handleDeleteEntry(index)} className='end-label'> - </button>
                        </div>
                    </div>
                ))}

                <div className="add-another-container">
                    <button onClick={handleAddEntry}>+ Add Another</button>
                </div>

                <Link to="/rent/off-campus/step13">
                    <span className="back-button">{'<-'}</span>
                </Link>

                {errorMessage && <p className="error-message">{errorMessage}</p>}

                <button
                    className="next-button"
                    onClick={saveAnswer}
                    disabled={formData.monthlyIncome2.some(entry => entry.source === '' || entry.source === 'Select Source')}
                >
                    Next
                </button>
            </div>
        </>
    );
};

export default OffCampusHousingFormStep14;
