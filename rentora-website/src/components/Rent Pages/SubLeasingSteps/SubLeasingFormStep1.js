import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { db } from "../../config";
import Stepper from './Stepper';
import { useSubLeasingSteps } from './SubLeasingStepContext'; // Import useSubLeasingSteps from StepContext
import ProgressBar from './ProgressBar'; // Import ProgressBar component
import './styles.css';

const SubleasingFormStep1 = () => {
    const { steps, completeStep } = useSubLeasingSteps();
    const currentStep = 0; // Set current step index to 1 for Step 2
    const { user } = useUser();
    const navigate = useNavigate();
    
    const onStepChange = (stepIndex) => {
        navigate(`/portals/subleasing/step${stepIndex + 1}`);
    };
    
    const [formData, setFormData] = useState({
        subLandlordFirstName: '',
        subLandlordMiddleInitial: '',
        subLandlordLastName: '',
        subtenantFirstName: '',
        subtenantMiddleInitial: '',
        subtenantLastName: '',
        address: '',
        city: '',
        aptNumber: '',
        state: '',
        startDate: '',
        endDate: '',
        monthlyRentAmount: '',
        securityDepositAmount: ''
    });

    useEffect(() => {
        // Fetch user data if user exists
        if (user) {
            db.collection('SurveyResponses').doc(user.id).get()
                .then(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        setFormData((currentFormData) => ({
                            //Sublandlord info
                            subLandlordFirstName: user.subLandlordFirstName || currentFormData.subLandlordFirstName,
                            subLandlordMiddleInitial: user.subLandlordMiddleInitial || currentFormData.subLandlordMiddleInitial,
                            subLandlordLastName: user.subLandlordLastName || currentFormData.subLandlordLastName,

                            //Subtenant info
                            subtenantFirstName: user.subtenantFirstName || currentFormData.subtenantFirstName,
                            subtenantMiddleInitial: user.subtenantMiddleInitial || currentFormData.subtenantMiddleInitial,
                            subtenantLastName: user.subtenantLastName || currentFormData.subtenantLastName,
                            
                            //property information
                            address: user.address || currentFormData.address,
                            aptNumber: user.aptNumber || currentFormData.aptNumber,
                            city: user.city || currentFormData.city,
                            state: user.state || currentFormData.state,

                            //rental term
                            startDate: user.startDate || currentFormData.startDate,
                            endDate: user.endDate || currentFormData.endDate,

                            //monaaaayyyyyy
                            monthlyRentAmount: user.monthlyRentAmount || currentFormData.monthlyRentAmount,
                            securityDepositAmount: user.securityDepositAmount || currentFormData.securityDepositAmount
                        }));
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [user]);
    
    const handleNext = (event) => {
        //event.preventDefault();
        
        const { subLandlordFirstName, subLandlordMiddleInitial, subLandlordLastName, subtenantFirstName, subtenantMiddleInitial, subtenantLastName,
            address, city, aptNumber, state, startDate, endDate, monthlyRentAmount, securityDepositAmount } = formData;

        if (!subLandlordFirstName.trim() || !subLandlordLastName.trim() || !subtenantFirstName.trim() ||
        !subtenantLastName.trim() || !address.trim() || !city.trim() || !state.trim() || !startDate.trim() || !endDate.trim() ||
        !monthlyRentAmount.trim() || !securityDepositAmount.trim()) {
            alert("Please enter all the informaton");
            return;
        }

        console.log("Handling next:", formData);
        
        const newFormData = { ...formData };
        if (user) {

            db.collection('SurveyResponses').doc(user.id).set(newFormData, { merge: true })
                .then(() => {
                    console.log("Document successfully updated or set!");
                    completeStep(currentStep);
                    navigate('/portals/subleasing/step2');
                })
                .catch((error) => {
                    console.error("Error updating or setting document: ", error);
                });

        } else {
            console.log("User not authenticated");
        }
        
    };

    // List of states
    const states = [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida',
        'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
        'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
        'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
        'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
        'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ];

    // List of top 30 countries
    const top30Countries = [
        'China', 'India', 'South Korea', 'Taiwan', 'Vietnam', 'Saudi Arabia', 'Iran', 'Canada', 'Mexico', 'Brazil',
        'Colombia', 'Ecuador', 'Germany', 'France', 'Italy', 'Spain', 'United Kingdom', 'Nigeria', 'Kenya', 'Ghana',
        'Egypt', 'South Africa', 'Australia', 'Japan', 'Indonesia', 'Malaysia', 'Thailand', 'Philippines', 'Singapore'
    ];

    return (
        <>
            <ProgressBar steps={steps} currentStep={currentStep} onStepChange={onStepChange} />
            <div className="form-container">
                <Stepper currentStep={currentStep} /> {/* Update Stepper's currentStep as well */}
                <h2 className="step-title">{steps[currentStep].title}</h2> {/* Display the step title from steps state */}
                <h2 className="step-title">Step 1: General Information</h2>
                <p className="step-description">Please Enter Your Information Correctly</p>

                <h2>Sublandlord Information</h2>
                <input
                    type="text"
                    placeholder="First Name"
                    className="input-field"
                    value={formData.subLandlordFirstName}
                    onChange={(e) => setFormData({ ...formData, subLandlordFirstName: e.target.value })}
                    style={{ width: '30%', marginRight: '2.5%'}}
                />
                <input
                    type="text"
                    placeholder="Middle Initial (Optional)"
                    maxLength={1}
                    className="input-field"
                    value={formData.subLandlordMiddleInitial}
                    onChange={(e) => setFormData({ ...formData, subLandlordMiddleInitial: e.target.value })}
                    style={{ width: '30%', marginRight: '2.5%'}}
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    className="input-field"
                    value={formData.subLandlordLastName}
                    onChange={(e) => setFormData({ ...formData, subLandlordLastName: e.target.value })}
                    style={{ width: '30%', }}
                />
                <h2>Subtenant Information</h2>
                <input
                    type="text"
                    placeholder="Subtenant First Name"
                    className="input-field"
                    value={formData.subtenantFirstName}
                    onChange={(e) => setFormData({ ...formData, subtenantFirstName: e.target.value })}
                    style={{ width: '30%', marginRight: '2.5%'}}
                />
                <input
                    type="text"
                    placeholder="Subtenant Middle Initial (Optional)"
                    maxLength={1}
                    className="input-field"
                    value={formData.subtenantMiddleInitial}
                    onChange={(e) => setFormData({ ...formData, subtenantMiddleInitial: e.target.value })}
                    style={{ width: '30%', marginRight: '2.5%'}}
                />
                <input
                    type="text"
                    placeholder="Subtenant Last Name"
                    className="input-field"
                    value={formData.subtenantLastName}
                    onChange={(e) => setFormData({ ...formData, subtenantLastName: e.target.value })}
                    style={{ width: '30%'}}
                />
                <h2>Property Information</h2>
                <input
                    type="text"
                    placeholder="Address"
                    className="input-field"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={{ width: '30%', marginRight: '2.5%'}}
                />
                <input
                    type="text"
                    placeholder="City"
                    className="input-field"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '25%', marginRight: '2.5%'}}
                />
                <input
                    type="text"
                    placeholder="Apt #"
                    className="input-field"
                    value={formData.aptNumber}
                    onChange={(e) => setFormData({ ...formData, aptNumber: e.target.value })}
                    style={{ width: '7.5%', marginRight: '2.5%'}}
                />
                {/* Dropdown for state */}
                <select
                    id="state"
                    className="input-field"
                    value={formData.state}
                    onChange={(e) => {
                    setFormData((prevData) => ({
                        ...prevData,
                        state: e.target.value,
                    }));
                    //setErrorMessage(''); // Clear error message when the user makes a selection
                    }}
                    style={{ width: '25%', marginRight: '2.5%' }}
                >
                    <option value="">State</option>
                    {states.map((s) => (
                    <option key={s} value={s}>
                        {s}
                    </option>
                    ))}
                    <optgroup label="Countries">
                    {top30Countries.map((country) => (
                        <option key={country} value={country}>
                        {country}
                        </option>
                    ))}
                
                    </optgroup>
                </select>
                
                <input
                    type="date"
                    placeholder="Start Date"
                    className="input-field"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    style={{ width: '46.25%', marginRight: '2.5%'}}
                />
                
                <input
                    type="date"
                    placeholder="End Date"
                    className="input-field"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    style={{ width: '46.25%'}}
                />
                
                <input
                    type="text"
                    placeholder="Monthly Rent Amount"
                    className="input-field"
                    value={formData.monthlyRentAmount}
                    onChange={(e) => setFormData({ ...formData, monthlyRentAmount: e.target.value })}
                    style={{ width: '46.25%', marginRight: '2.5%'}}
                />
                <input
                    type="text"
                    placeholder="Security Deposit Amount"
                    className="input-field"
                    value={formData.securityDepositAmount}
                    onChange={(e) => setFormData({ ...formData, securityDepositAmount: e.target.value })}
                    style={{ width: '46.25%'}}
                />
                
                <button className="next-button" onClick={handleNext}>
                Next
                </button>
            </div>
        </>
    );
};

export default SubleasingFormStep1;
