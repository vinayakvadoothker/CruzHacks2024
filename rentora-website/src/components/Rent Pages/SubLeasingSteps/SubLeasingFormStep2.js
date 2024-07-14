import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { db } from "../../config";
import axios from 'axios';
import Spinner from './Spinner';
import Stepper from './Stepper';
import './styles.css';

import { useSteps } from './SubLeasingStepContext';
import ProgressBar from './ProgressBar';

const SubleasingFormStep2 = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [submissionComplete, setSubmissionComplete] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
          if (user) {
            try {
              const doc = await db.collection('SurveyResponses').doc(user.id).get();
              if (doc.exists) {
                const formDataFromDb = doc.data();
                console.log('Fetched form data:', formDataFromDb);
              }
            } catch (error) {
              console.error('Error fetching guarantor form data:', error);
            }
          }
        };
        fetchData();
    }, [user]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsGeneratingPDF(true);
    
        try {
            // Generate PDF
            console.log("Somethign is happening")
            await db.collection('SurveyResponses').doc(user.id).update({
                subleasingFormDone: true,
            });
    
            const response = await axios.get(`http://localhost:3000/api/generate-pdf-subleasing/${user.id}`, {
                responseType: 'blob',
            });
    
            console.log('Response from server:', response);
    
            // Fetch the user's filled PDF URL from Firestore
            const pdfDoc = await db.collection('FilledPDFsSubleasing').doc(`${user.id}`).get();
            if (!pdfDoc.exists) {
                throw new Error('No PDF found for the user.');
            }
            
            const pdfData = pdfDoc.data();
            const pdfUrl = pdfData[`${user.id}_filled.pdf`]; 
            const doc = await db.collection('SurveyResponses').doc(user.id).get();
            const formDataFromDb = doc.data();
            
            console.log("Success??")
            setIsGeneratingPDF(false);
        } catch (error) {
            console.error('Error saving form data:', error);
            setIsGeneratingPDF(false);
            alert('Error submitting form. Please try again.');
        }
    };    

    return (
        <div className="form-container">
            <h2 className="step-title">Generate Your Document</h2>
            <form onSubmit={handleSubmit}>
                <button className="submit-button" type="submit">Generate PDF</button>
            </form>
        </div>
    );
};

export default SubleasingFormStep2;
