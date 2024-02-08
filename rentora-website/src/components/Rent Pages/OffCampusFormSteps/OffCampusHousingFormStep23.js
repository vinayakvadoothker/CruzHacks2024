import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { db } from "../../config";
import axios from 'axios'; // Import Axios for making HTTP requests
import './styles.css';

const OffCampusHousingFormStep23 = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    const [guarantorFormFilled, setGuarantorFormFilled] = useState(false);

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
        try {
            // Save the offcampusformdone boolean as true
            await db.collection('SurveyResponses').doc(user.id).update({
                offcampusformdone: true,
            });

            // Log the data being sent to the server
            console.log('Data sent to server for PDF generation:', { userId: user.id });

            // Make an HTTP request to generate the PDF
            const response = await axios.get(`http://localhost:3010/generate-pdf/${user.id}`, {
                responseType: 'blob', // Specify that the response should be treated as a Blob
            });

            // Log the response from the server
            console.log('Response from server:', response);

            // Handle the response or further actions as needed

            // Clean up and navigate to the next step or any other route
            navigate('/onboarding');
        } catch (error) {
            console.error('Error saving form data:', error);
            // Handle error (e.g., show an error message)
            alert('Error submitting form. Please try again.');
        }
    };

    return (
        <div className="form-container" style={{ width: '50%', margin: '60px auto', maxHeight: '80vh', overflowY: 'auto', overflowX: 'auto', padding: '20px' }}>
            <h2 className="step-title">Guarantor Confirmation</h2>
            <p className="step-description">Status of the Guarantor Form:</p>

            <div className="status-indicator">
                {guarantorFormFilled ? (
                    <span className="check-mark">&#10004;</span> // Green check mark
                ) : (
                    <span className="red-x">&#10006;</span> // Red 'x'
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
    );
};

export default OffCampusHousingFormStep23;
