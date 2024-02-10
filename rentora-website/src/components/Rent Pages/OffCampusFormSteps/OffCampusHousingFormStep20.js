import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { db, storage } from "../../config";
import './styles.css';

const OffCampusHousingFormStep20 = () => {
    const { user } = useUser();
    const navigate = useNavigate();

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
            db.collection('SurveyResponses')
                .doc(user.id)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        setFormData(currentFormData => ({
                            ...currentFormData,
                            ...userData,
                        }));
                        if (userData.rentalWorkshopCertificate) {
                            setCertificateUrlFromDb(userData.rentalWorkshopCertificate);
                        }
                    }
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [user]);
    
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
        navigate('/rent/off-campus/step21');
    };

    const handleLinkClick = (newSrc) => {
        setModalUrl(newSrc); // Set the URL for the modal
        setShowModal(true); // Open the modal
    };


    return (
        <div className="form-container" style={{ width: '50%', margin: '60px auto', maxHeight: '80vh', overflowY: 'auto', overflowX: 'auto', padding: '20px' }}>
            <h2 className="step-title">Rental Workshop Certificate</h2>
            <p className="step-description">
                Please Complete the Following Workshop and Upload Your Certificate
            </p>

            <button onClick={() => handleLinkClick("https://canvas.ucsc.edu/enroll/7DWCHX")}>
                Open Workshop
            </button>

            {showModal && (
                <div className="modal-background">
                    <div className="modal-content">
                        <iframe
                            title="Workshop Content"
                            src={modalUrl}
                            width="100%"
                            height="100%"
                            allowFullScreen
                        />
                        <button onClick={closeModal} className="close-button">Close</button>
                    </div>
                </div>
            )}

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
    );
};

export default OffCampusHousingFormStep20;
