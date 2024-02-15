import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { db } from "../../config";
import axios from 'axios';
import Spinner from './Spinner';
import './styles.css';

const OffCampusHousingFormStep23 = () => {
    const { user } = useUser();
    const navigate = useNavigate();

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

            const response = await axios.get(`http://35.239.196.142:3010/generate-pdf/${user.id}`, {
                responseType: 'blob',
            });

            console.log('Response from server:', response);

            setIsGeneratingPDF(false);
            navigate('/onboarding');
        } catch (error) {
            console.error('Error saving form data:', error);
            setIsGeneratingPDF(false);
            alert('Error submitting form. Please try again.');
        }
    };

    return (
        <div className="form-container" style={{ width: '50%', margin: '60px auto', maxHeight: '70vh', overflowY: 'auto', overflowX: 'auto', padding: '20px' }}>
            <h2 className="step-title">Guarantor Confirmation</h2>
            <p className="step-description">Status of the Guarantor Form:</p>

            <div className="status-indicator">
                {isGeneratingPDF ? (
                    <Spinner />
                ) : guarantorFormFilled ? (
                    <span className="check-mark">&#10004;</span> // Display green check mark
                ) : (
                    <span className="red-x">&#10006;</span> // Display red 'x'
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
