import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from "../../config";
import { useUser } from "@clerk/clerk-react";
import Stepper from './Stepper';
import './styles.css';

const OffCampusHousingFormStep22 = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        vehicleInfo: [],
    });

    useEffect(() => {
        // Fetch and set the saved data when the component mounts
        if (user) {
            db.collection('SurveyResponses')
                .doc(user.id)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        const savedData = doc.data().vehicleInfo || [];

                        setFormData({
                            vehicleInfo: savedData.map(car => ({ ...car })),
                        });
                    }
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [user]);

    const handleInputChange = (index, field, value) => {
        setFormData((prevData) => {
            const updatedVehicleInfo = [...prevData.vehicleInfo];
    
            // Apply specific formatting and validation for the "Year" field
            if (field === 'year') {
                let formattedValue = value;
                // Restrict the "Year" field to accept only numbers and exactly 4 digits
                formattedValue = formattedValue.replace(/\D/g, '').slice(0, 4);
                updatedVehicleInfo[index][field] = formattedValue;
            } else {
                // No specific formatting or validation for other fields
                updatedVehicleInfo[index][field] = value;
            }
    
            return {
                ...prevData,
                vehicleInfo: updatedVehicleInfo,
            };
        });
    };

    const handleAddCar = () => {
        setFormData((prevData) => ({
            ...prevData,
            vehicleInfo: [...prevData.vehicleInfo, {
                make: '',
                year: '',
                licenseNumber: '',
            }],
        }));
    };

    const handleDeleteCar = (index) => {
        setFormData((prevData) => {
            const updatedVehicleInfo = [...prevData.vehicleInfo];
            updatedVehicleInfo.splice(index, 1);

            return {
                ...prevData,
                vehicleInfo: updatedVehicleInfo,
            };
        });
    };

    const validateYear = (year) => {
        return /^\d{4}$/.test(year);
    };

    const saveAnswer = () => {
        // Validation logic here
        const isVehicleDataValid = formData.vehicleInfo.every(car => (
            car.make.trim() !== '' &&
            /^\d+$/.test(car.year.trim()) && // Year should be numbers only
            car.licenseNumber.trim() !== ''
        ));

        const isYearValid = formData.vehicleInfo.every((car, index) => validateYear(car.year));

        if (!isYearValid) {
            // Display an alert if any "Year" field is not 4 digits
            alert('Please provide a valid 4-digit year for each vehicle.');
            return;
        }
        if (!isVehicleDataValid) {
            // Display an alert if any of the fields are empty or invalid
            alert('Please fill out all fields for each vehicle with valid information before proceeding.');
            return;
        }

        const formattedData = {
            vehicleInfo: formData.vehicleInfo.map(car => ({
                make: car.make.trim(),
                year: car.year.trim(),
                licenseNumber: car.licenseNumber.trim().toUpperCase(),
            })),
        };

        db.collection('SurveyResponses')
            .doc(user.id)
            .update({ vehicleInfo: formattedData.vehicleInfo })
            .then(() => {
                console.log("Document successfully updated!");
                // Navigate to the next step or any other step
                navigate('/rent/off-campus/step23');
            })
            .catch((error) => {
                console.error("Error updating document: ", error);
            });
    };

    return (
        <div className="form-container" >
            <Stepper currentStep={21} />
            <h2 className="step-title">Vehicle Information</h2>
            <p className="step-description">Please Provide Information About Your Vehicles</p>

            {formData.vehicleInfo.map((car, index) => (
                <div key={index} className="car-entry" style={{ marginBottom: '15px' }}>
                    <div className="input-group">
                        <label>Make:</label>
                        <input
                            type="text"
                            value={car.make}
                            onChange={(e) => handleInputChange(index, 'make', e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Year:</label>
                        <input
                            type="text"
                            value={car.year}
                            onChange={(e) => handleInputChange(index, 'year', e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>License Number:</label>
                        <input
                            type="text"
                            value={car.licenseNumber}
                            onChange={(e) => handleInputChange(index, 'licenseNumber', e.target.value.toUpperCase())}
                            autoCapitalize="characters"
                        />
                        {/* <button onClick={() => handleDeleteCar(index)}> - </button> */}
                    </div>
                </div>
            ))}

            <div className="add-another-container">
                <button onClick={handleAddCar}>+ Add Another Car</button>
                {formData.vehicleInfo.length > 0 && ( // Only show the delete button if there are car entries
        <button onClick={() => handleDeleteCar(formData.vehicleInfo.length - 1)}> - Remove Last Car</button>
    )}
            </div>

            <Link to="/rent/off-campus/step21">
                <span className="back-button">{'<-'}</span>
            </Link>

            <button className="next-button" onClick={saveAnswer}>
                Next
            </button>
        </div>
    );
};

export default OffCampusHousingFormStep22;
