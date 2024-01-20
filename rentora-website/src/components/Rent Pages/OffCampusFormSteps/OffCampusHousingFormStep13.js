import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from "../../config";
import { useUser } from "@clerk/clerk-react";
import PlacesAutocomplete from 'react-places-autocomplete';
import './styles.css'; // Import the CSS file

const OffCampusHousingFormStep13 = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [errorMessage] = useState('');
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
                        setFormData(prevData => ({
                            ...prevData,
                            rentalHistory: doc.data().rentalHistory || [],
                        }));
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
            // Display a popup or show an error message
            alert("Please fill out all fields in the form before proceeding.");
            return;
        }

        // Validate dates before updating the document
        const isValid = formData.rentalHistory.length === 0 ||
            formData.rentalHistory.every(entry =>
                validateDates(entry.startDate, entry.endDate, entry.present)
            );

        if (isValid) {
            const formattedData = {
                rentalHistory: formData.rentalHistory.map(entry => ({
                    address: entry.address,
                    monthlyRent: entry.monthlyRent,
                    startDate: entry.startDate,
                    endDate: entry.present ? 'Present' : entry.endDate,
                    present: entry.present,
                    ownerName: entry.ownerName,
                    ownerPhoneNumber: entry.ownerPhoneNumber,
                    reasonForLeaving: entry.reasonForLeaving,
                })),
            };

            console.log("Formatted Data:", formattedData);

            db.collection('SurveyResponses')
                .doc(user.id)
                .update(formattedData)
                .then(() => {
                    console.log("Document successfully updated!");
                    // Navigate to the next step (Step 14 or any other step)
                    navigate('/rent/off-campus/step14');
                })
                .catch((error) => {
                    console.error("Error updating document: ", error);
                });
        } else {
            // Display a popup or show an error message
            alert("Please ensure that Start Date and End Date are provided and that End Date is after Start Date for all entries, or set it to 'Present' if you are still involved");
        }
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
        // Regular expression to match only digits
        const regex = /^[0-9\b]+$/;

        // Check if the entered value is a valid digit or backspace
        if (value === '' || regex.test(value)) {
            setFormData((prevData) => {
                const updatedRentalHistory = [...prevData.rentalHistory];
                updatedRentalHistory[index][field] = formatPhoneNumber(value);

                // If 'Present' checkbox is checked, clear the endDate value
                if (field === 'present' && value) {
                    updatedRentalHistory[index].endDate = 'Present';
                }

                return {
                    ...prevData,
                    rentalHistory: updatedRentalHistory,
                };
            });
        }
    };

    // Function to format the phone number as XXX-XXX-XXXX
    const formatPhoneNumber = (value) => {
        const cleaned = ('' + value).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return match[1] + '-' + match[2] + '-' + match[3];
        }
        return value;
    };



    return (
        <div className="form-container" style={{ width: '50%', margin: '60px auto', maxHeight: '80vh', overflowY: 'auto', padding: '20px' }}>
            <h2 className="step-title">Previous Tenant Experience</h2>
            <p className="step-description">Please Add Your Previous Rental History:</p>

            {Array.isArray(formData.rentalHistory) && formData.rentalHistory.map((entry, index) => (
                <div key={index} className="rental-history-entry">
                    <div className="form-row">
                        <label>Address:</label>
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
                            type="text"
                            value={formatCurrency(entry.monthlyRent)}
                            onChange={(e) => handleInputChange(index, 'monthlyRent', e.target.value)}
                        />
                        <button onClick={() => handleDeleteEntry(index)} className='end-label'> - </button>
                    </div>
                    <div className="form-row">
                        <label>Start Date:</label>
                        <input
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
                                    type="date"
                                    value={entry.endDate}
                                    onChange={(e) => handleInputChange(index, 'endDate', e.target.value)}
                                />
                                <label className="end-label">
                                    <input
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
                            type="text"
                            value={entry.ownerName}
                            onChange={(e) => handleInputChange(index, 'ownerName', e.target.value)}
                        />
                        <div className="form-row">
                            <label>Owner's Phone Number:</label>
                            <input
                                type="tel"
                                value={entry.ownerPhoneNumber}
                                onChange={(e) => handleInputChange(index, 'ownerPhoneNumber', e.target.value)}
                                placeholder="XXX-XXX-XXXX"
                                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                            />
                        </div>
                        <label className="end-label">Reason For Leaving:</label>
                        <input
                            type="text"
                            value={entry.reasonForLeaving}
                            onChange={(e) => handleInputChange(index, 'reasonForLeaving', e.target.value)}
                        />
                    </div>
                </div>
            ))}

            <div className="add-another-container">
                <button onClick={handleAddEntry}>+ Add Another</button>
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
    );
};

export default OffCampusHousingFormStep13;
