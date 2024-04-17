import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { db, storage } from "../../config";
import Stepper from './Stepper';
import './styles.css';

import { useSteps } from './StepContext';
import ProgressBar from './ProgressBar';


const OffCampusHousingFormStep20 = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [fileExists, setFileExists] = useState(false);

  const { steps, completeStep } = useSteps(); // Use the useSteps hook
  const currentStep = 19; // Step index starts from 0, so step 3 is index 2
  const onStepChange = (stepIndex) => {
    navigate(`/rent/off-campus/step${stepIndex + 1}`);
  };

    const [certificateUrlFromDb, setCertificateUrlFromDb] = useState(null);
    const [modalUrl, setModalUrl] = useState(""); 
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        rentalWorkshopCertificate: '',
    });

    const closeModal = () => {
        setModalUrl(""); // Clear the modal URL when closing
        setShowModal(false);
    };

    useEffect(() => {
        if (user) {
          db.collection('SurveyResponses').doc(user.id).get()
            .then(doc => {
              if (doc.exists) {
                const userData = doc.data();
                setFormData({
                  schoolName: userData.schoolName,
                  firstName: userData.firstName, // Assuming the first name is stored like this
                  lastName: userData.lastName,   // Assuming the last name is stored like this
                  rentalWorkshopCertificate: userData.rentalWorkshopCertificate
                });
    
                if (userData.schoolName !== 'UC Santa Cruz') {
                  completeStep(currentStep);
                  navigate('/rent/off-campus/step21');
                }
              }
            })
            .catch(error => {
              console.error('Error fetching data:', error);
            });
        }
    }, [user, completeStep, currentStep, navigate]);
    
    
    
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (formData.firstName && formData.lastName) { // Check if firstName and lastName are defined
                const certificateURL = await uploadFileToStorage(user.id, file);
                await db.collection('SurveyResponses').doc(user.id).update({
                    rentalWorkshopCertificate: certificateURL,
                });
                setCertificateUrlFromDb(certificateURL);
            } else {
                console.error('User first name or last name is undefined.'); // Debug: Log an error if names are undefined
            }
        }
    };

    const uploadFileToStorage = async (userId, file) => {
        // Use formData for fileName construction to include user's first and last name
        const fileName = `${formData.firstName} ${formData.lastName}-Rental_Certificate`;
        const fileExtension = file.name.split('.').pop(); // Extract the file extension
        const storageRef = storage.ref(`userCertificates/${userId}/${fileName}.${fileExtension}`);

        try {
            // Check if the file already exists
            const fileSnapshot = await storageRef.getMetadata();
            // If file exists, delete it before uploading the new one
            if (fileSnapshot.name) {
                await storageRef.delete();
            }
        } catch (error) {
            // Proceed to upload if the file doesn't exist
        }

        // Upload the new file
        const snapshot = await storageRef.put(file);
        const downloadURL = await storageRef.getDownloadURL();
        return downloadURL;
    };

    const handleNext = () => {
        completeStep(currentStep);
        navigate('/rent/off-campus/step21');
    };



    const handleLinkClick = () => {
        window.open("http://canvas.ucsc.edu/enroll/7DWCHX", "_blank", "noopener,noreferrer");
    };
    return (
        <>
        <ProgressBar steps={steps} currentStep={currentStep} onStepChange={onStepChange} />
        <div className="form-container" >
          <Stepper currentStep={currentStep} /> {/* Update Stepper with currentStep */}
          <h2 className="step-title">{steps[currentStep].title}</h2> {/* Display the step title */}
            <p className="step-description">
                (Optional) Please Complete the Following Workshop and Upload Your Certificate
            </p>

            <button onClick={handleLinkClick} className="link-button">
            Open Workshop
        </button>

            

            {certificateUrlFromDb && (
                <div className="image-preview-container">
                    <button
                        onClick={() => window.open(certificateUrlFromDb, '_blank')}
                        className="next-button"
                    >
                        View Certificate
                    </button>
                </div>
            )}


            <div className="file-input-container">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="input-field file-input"
                />
            </div>

            <Link to="/rent/off-campus/step19">
                <span className="back-button">{'<-'}</span>
            </Link>

            <button
                className="next-button"
                onClick={handleNext}
            >
                Next
            </button>
        </div>
        </>
    );
};

export default OffCampusHousingFormStep20;
