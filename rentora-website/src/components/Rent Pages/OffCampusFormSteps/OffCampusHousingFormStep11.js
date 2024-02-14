import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from "../../config";
import { useUser } from "@clerk/clerk-react";
import './styles.css';

const OffCampusHousingFormStep11 = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        employmentHistory: [],
    });

    useEffect(() => {
        if (user) {
            db.collection('SurveyResponses')
                .doc(user.id)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        setFormData(prevData => ({
                            ...prevData,
                            employmentHistory: doc.data().employmentHistory || [],
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

    const saveAnswer = () => {
        // Validate dates and all fields before updating the document
        const isValid = formData.employmentHistory.every(entry =>
            validateDates(entry.startDate, entry.endDate, entry.present) &&
            entry.employer !== '' &&
            entry.title !== '' &&
            entry.nameOfSupervisor !== '' &&
            entry.supervisorPhoneNumber !== '' &&
            entry.cityOfEmployment !== ''
        );

        if (isValid) {
            const updatedFormData = {
                employmentHistory: formData.employmentHistory.map(entry => ({
                    ...entry,
                    endDate: entry.present ? 'Present' : entry.endDate,
                })),
            };

            db.collection('SurveyResponses')
                .doc(user.id)
                .update(updatedFormData)
                .then(() => {
                    console.log("Document successfully updated!");
                    navigate('/rent/off-campus/step12');
                })
                .catch((error) => {
                    console.error("Error updating document: ", error);
                });
        } else {
            // Display a popup or show an error message
            alert("Please fill out all fields for each employment entry");
        }
    };

    const handleAddEntry = () => {
        setFormData((prevData) => ({
            ...prevData,
            employmentHistory: [...prevData.employmentHistory, {
                employer: '',
                title: '',
                startDate: '',
                endDate: '',
                present: false,
                nameOfSupervisor: '', // Added field
                supervisorPhoneNumber: '', // Added field
                cityOfEmployment: '', // Added field
            }],
        }));
    };

    const handleDeleteEntry = (index) => {
        setFormData((prevData) => {
            const updatedEmploymentHistory = [...prevData.employmentHistory];
            updatedEmploymentHistory.splice(index, 1);
            return {
                ...prevData,
                employmentHistory: updatedEmploymentHistory,
            };
        });
    };

    const handleInputChange = (index, field, value) => {
        setFormData((prevData) => {
            const updatedEmploymentHistory = [...prevData.employmentHistory];
            updatedEmploymentHistory[index][field] = value;
    
            if (field === 'present' && value) {
                updatedEmploymentHistory[index].present = true;
                updatedEmploymentHistory[index].endDate = 'Present';
            } else if (field === 'endDate' && updatedEmploymentHistory[index].present) {
                updatedEmploymentHistory[index].present = false;
            }
    
            // Format supervisor phone numbers to (XXX)-XXX-XXXX and limit to 10 digits
            if (field === 'supervisorPhoneNumber') {
                const formattedPhoneNumber = value.replace(/\D/g, '').slice(0, 10);
                updatedEmploymentHistory[index][field] = formattedPhoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1)-$2-$3');
            }
    
            return {
                ...prevData,
                employmentHistory: updatedEmploymentHistory,
            };
        });
    };

    return (
        <div className="form-container" style={{ width: '50%', margin: '60px auto', maxHeight: '80vh', overflowY: 'auto', overflowX: 'auto', padding: '20px' }}>
        <h2 className="step-title">Employment History</h2>
            <p className="step-description">Please Add Your Previous and Current Employment History</p>

            {Array.isArray(formData.employmentHistory) && formData.employmentHistory.map((entry, index) => (
                <div key={index} className="employment-entry">
                    <div className="form-row">
                        <label>Employer:</label>
                        <input
                            type="text"
                            value={entry.employer}
                            onChange={(e) => handleInputChange(index, 'employer', e.target.value)}
                        />
                        <label className="end-label">Title:</label>
                        <input
                            type="text"
                            value={entry.title}
                            onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                        />
                        
                    </div>
                    <div className="form-row">
                        <label>Start:</label>
                        <input
                            type="date"
                            value={entry.startDate}
                            onChange={(e) => handleInputChange(index, 'startDate', e.target.value)}
                        />
                        <label className="end-label">End:</label>
                        {entry.present ? (
                            <span></span>
                        ) : (
                            <input
                                type="date"
                                value={entry.endDate}
                                onChange={(e) => handleInputChange(index, 'endDate', e.target.value)}
                            />
                        )}
                        <label className="end-label">
                            <input
                                type="checkbox"
                                checked={entry.present}
                                onChange={(e) => handleInputChange(index, 'present', e.target.checked)}
                            />
                            Present
                        </label>
                    </div>
                    <div className="form-row">
                        <label>Supervisor:</label>
                        <input
                            type="text"
                            value={entry.nameOfSupervisor}
                            onChange={(e) => handleInputChange(index, 'nameOfSupervisor', e.target.value)}
                        />
                        <label className="end-label">Supervisor Phone:</label>
                        <input
                            type="text"
                            value={entry.supervisorPhoneNumber}
                            onChange={(e) => handleInputChange(index, 'supervisorPhoneNumber', e.target.value)}
                        />
                        <label className="end-label">City of Employment:</label>
                        <input
                            type="text"
                            value={entry.cityOfEmployment}
                            onChange={(e) => handleInputChange(index, 'cityOfEmployment', e.target.value)}
                        />
                    </div>
                    <button onClick={() => handleDeleteEntry(index)} className='end-label'> - </button>
                </div>
            ))}
            <div className="add-another-container">
                <button onClick={handleAddEntry}>+ Add Another</button>
            </div>

            <Link to="/rent/off-campus/step10">
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

export default OffCampusHousingFormStep11;
