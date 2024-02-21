import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from "../../config";
import { useUser } from "@clerk/clerk-react";
import PlacesAutocomplete from 'react-places-autocomplete';
import Stepper from './Stepper';
import './styles.css'; // Import the CSS file

import { useSteps } from './StepContext';
import ProgressBar from './ProgressBar';


const OffCampusHousingFormStep13 = () => {
    const { user } = useUser();
    const navigate = useNavigate();


    const { steps, completeStep } = useSteps(); // Use the useSteps hook
    const currentStep = 12; // Step index starts from 0, so step 3 is index 2
    const onStepChange = (stepIndex) => {
        navigate(`/rent/off-campus/step${stepIndex + 1}`);
    };

    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        rentalHistory: [],
    });

    useEffect(() => {
        // Fetch and set the saved data when the component mounts
        if (user) {
            db.collection('SurveyResponses')
                .doc(user.id)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        setFormData({
                            rentalHistory: doc.data().rentalHistory || [],
                        });
                    }
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [user]);

    const validateDates = (start, end, isPresent) => {
        return isPresent || (start && end && new Date(start) <= new Date(end));
    };



    const handleAddressChange = (address, index) => {
        setFormData((prevData) => {
            const updatedRentalHistory = [...prevData.rentalHistory];
            updatedRentalHistory[index].address = address;
            return {
                ...prevData,
                rentalHistory: updatedRentalHistory,
            };
        });
    };

    const saveAnswer = () => {
        // Check for missing or invalid fields before updating the document
        const isInvalid = formData.rentalHistory.some(entry =>
            entry.address === '' || entry.monthlyRent === '' || entry.startDate === '' ||
            (!entry.present && entry.endDate === '') || entry.ownerName === '' || entry.ownerPhoneNumber === '' || entry.reasonForLeaving === ''
        );

        if (isInvalid) {
            alert("Please fill out all fields in the form before proceeding.");
            return;
        }

        // Validate dates before updating the document
        const datesAreValid = formData.rentalHistory.every(entry =>
            validateDates(entry.startDate, entry.endDate, entry.present)
        );

        if (!datesAreValid) {
            alert("Please ensure that Start Date and End Date are provided and that End Date is after Start Date for all entries, or set it to 'Present' if you are still living there.");
            return;
        }

        // Ensure there is at least one present and one previous address
        const hasPresentAddress = formData.rentalHistory.some(entry => entry.present);
        const hasPreviousAddress = formData.rentalHistory.some(entry => !entry.present);

        if (!hasPresentAddress || !hasPreviousAddress) {
            alert("Please ensure you have added at least one present and one previous address.");
            return;
        }

        // Proceed with updating the document in the database
        const formattedData = {
            rentalHistory: formData.rentalHistory.map(entry => ({
                address: entry.address,
                monthlyRent: entry.monthlyRent ? parseFloat(String(entry.monthlyRent).replace(/[^0-9.]/g, '')) : 0,
                startDate: entry.startDate,
                endDate: entry.present ? 'Present' : entry.endDate,
                present: entry.present,
                ownerName: entry.ownerName,
                ownerPhoneNumber: entry.ownerPhoneNumber,
                reasonForLeaving: entry.reasonForLeaving,
            })),
        };

        db.collection('SurveyResponses')
            .doc(user.id)
            .update(formattedData)
            .then(() => {
                console.log("Document successfully updated!");
                completeStep(currentStep);
                navigate('/rent/off-campus/step14');
            })
            .catch((error) => {
                console.error("Error updating document: ", error);
                setErrorMessage("Error updating the document. Please try again.");
            });
    };

    const handleAddEntry = () => {
        setFormData((prevData) => ({
            ...prevData,
            rentalHistory: [...prevData.rentalHistory, {
                address: '',
                monthlyRent: '',
                startDate: '',
                endDate: '',
                present: false,
                ownerName: '',
                ownerPhoneNumber: '',
                reasonForLeaving: '',
            }],
        }));
    };

    const handleDeleteEntry = (index) => {
        setFormData((prevData) => {
            const updatedRentalHistory = [...prevData.rentalHistory];
            updatedRentalHistory.splice(index, 1);
            return {
                ...prevData,
                rentalHistory: updatedRentalHistory,
            };
        });
    };

    const handleInputChange = (index, field, value) => {
        setFormData((prevData) => {
            const updatedRentalHistory = [...prevData.rentalHistory];
            updatedRentalHistory[index][field] = value;

            // If 'Present' checkbox is checked, clear the endDate value
            if (field === 'present' && value) {
                updatedRentalHistory[index].endDate = 'Present';
            }

            return {
                ...prevData,
                rentalHistory: updatedRentalHistory,
            };
        });
    };
    const formatCurrency = (value) => {
        // Convert value to a string in case it's not
        const strValue = value ? String(value) : '';

        // Convert the string value to a number, removing non-numeric characters
        const numericValue = parseFloat(strValue.replace(/[^0-9.]/g, ''));

        // Check if it's a valid number
        if (!isNaN(numericValue)) {
            // Format the number with commas
            return numericValue.toLocaleString('en-US');
        }

        // If the value is not a valid number, return it as is
        return strValue;
    };

    const formatPhoneNumber = (value) => {
        // Ensure the value is a string
        const strValue = String(value);
        // Remove any non-digit characters
        const cleaned = strValue.replace(/\D/g, '');

        // Limit the cleaned value to a maximum of 10 digits
        const maxLength = 10;
        const truncatedValue = cleaned.slice(0, maxLength);

        // Use regex to format it as XXX-XXX-XXXX
        const match = truncatedValue.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }

        return truncatedValue;
    };



    return (
        <>
            <ProgressBar steps={steps} currentStep={currentStep} onStepChange={onStepChange} />
            <div className="form-container" >
                <Stepper currentStep={currentStep} /> {/* Update Stepper with currentStep */}
                <h2 className="step-title">{steps[currentStep].title}</h2> {/* Display the step title */}
                <p className="step-description">Please Add Any Previous and Present Rental History:</p>

                {Array.isArray(formData.rentalHistory) && formData.rentalHistory.map((entry, index) => (
                    <div key={index} className="rental-history-entry">
                        <div className="form-row">
                            <label >Address:</label>
                            <PlacesAutocomplete

                                value={entry.address}
                                onChange={(value) => handleAddressChange(value, index)}
                                onSelect={(value) => handleAddressChange(value, index)}
                                googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                            >
                                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                    <div>
                                        <input

                                            {...getInputProps({
                                                placeholder: 'Type your address...',
                                                className: 'location-search-input',
                                            })}
                                        />
                                        <div className="autocomplete-dropdown-container">
                                            {loading && <div></div>}
                                            {suggestions.map((suggestion) => (
                                                <div
                                                    {...getSuggestionItemProps(suggestion, {
                                                        style: {
                                                            backgroundColor: suggestion.active ? '#a7a9ff' : '#fff',
                                                        },
                                                    })}
                                                >
                                                    {suggestion.description}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </PlacesAutocomplete>
                            <label className="end-label">Monthly Rent:</label>
                            <input
                                className='select-input-box'

                                type="text"
                                value={formatCurrency(entry.monthlyRent)}
                                onChange={(e) => handleInputChange(index, 'monthlyRent', e.target.value)}
                            />

                            {/*  */}
                        </div>
                        <div className="form-row">
                            <label>Start Date:</label>
                            <input
                                className='select-input-box'

                                type="date"
                                value={entry.startDate}
                                onChange={(e) => handleInputChange(index, 'startDate', e.target.value)}
                            />

                            <label className="end-label">End Date:</label>
                            {entry.present ? (
                                <React.Fragment>
                                    <span className="present-checkbox">Present</span>
                                    <input
                                        type="checkbox"
                                        checked={entry.present}
                                        onChange={(e) => handleInputChange(index, 'present', e.target.checked)}
                                    />
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    <input
                                        className='select-input-box'

                                        type="date"
                                        value={entry.endDate}
                                        onChange={(e) => handleInputChange(index, 'endDate', e.target.value)}
                                    />
                                    <label className="end-label">
                                        <input
                                            className='select-input-box'

                                            type="checkbox"
                                            checked={entry.present}
                                            onChange={(e) => handleInputChange(index, 'present', e.target.checked)}
                                        />
                                        Present
                                    </label>
                                </React.Fragment>
                            )}
                        </div>
                        <div className="form-row">
                            <label>Owner Name:</label>
                            <input
                                className='select-input-box'

                                type="text"
                                value={entry.ownerName}
                                onChange={(e) => handleInputChange(index, 'ownerName', e.target.value)}
                            />
                            <div className="form-row">
                                <label>Owner's Phone Number:</label>
                                <input
                                    className='select-input-box'

                                    type="tel"
                                    value={formatPhoneNumber(entry.ownerPhoneNumber)}
                                    onChange={(e) => handleInputChange(index, 'ownerPhoneNumber', e.target.value)}
                                    placeholder="XXX-XXX-XXXX"
                                    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                                />
                            </div>
                            <label className="end-label">Reason For Leaving:</label>
                            <input
                                className='select-input-box'

                                type="text"
                                value={entry.reasonForLeaving}
                                onChange={(e) => handleInputChange(index, 'reasonForLeaving', e.target.value)}
                            />
                            <button onClick={() => handleDeleteEntry(index)} className='end-label'> - </button>
                        </div>
                    </div>
                ))}

                <div className="add-another-container">
                    <button onClick={handleAddEntry}>+ Add Another</button>
                    {formData.rentalHistory.length > 0 && (
                        <button onClick={() => handleDeleteEntry(formData.rentalHistory.length - 1)}>- Delete Entry</button>
                    )}
                </div>


                <Link to="/rent/off-campus/step12">
                    <span className="back-button">{'<-'}</span>
                </Link>

                {errorMessage && <p className="error-message">{errorMessage}</p>}

                <button
                    className="next-button"
                    onClick={saveAnswer}
                >
                    Next
                </button>
            </div>
        </>
    );
};

export default OffCampusHousingFormStep13;
