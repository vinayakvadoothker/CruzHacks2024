import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { db, storage } from "../../config";
import Spinner from './Spinner';
import './styles.css';

const OffCampusHousingFormStep19 = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [fileUrl, setFileUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // Add state to store user's first and last names
  const [userName, setUserName] = useState({ firstName: '', lastName: '' });

  useEffect(() => {
    if (user) {
      db.collection('SurveyResponses')
        .doc(user.id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const formData = doc.data();
            // Update userName state with first and last names
            setUserName({ firstName: formData.firstName, lastName: formData.lastName });

            if (formData.letterOfReference) {
              setFileUrl(formData.letterOfReference);
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

    if (!file) {
      console.error("No file selected");
      return;
    }

    if (file.type !== "application/pdf") {
      console.error("File is not a PDF");
      return;
    }

    setIsLoading(true); // Start loading

    try {
      // Use userName state to construct the file name
      const fileName = `${userName.firstName} ${userName.lastName}-Letter_of_Reference.pdf`;
      const storageRef = storage.ref(`userLettersOfReference/${user.id}/${fileName}`);
      await storageRef.put(file);
      const downloadURL = await storageRef.getDownloadURL();

      setFileUrl(downloadURL);
      setIsLoading(false); // Stop loading after upload is complete
    } catch (error) {
      console.error("Error in handleFileChange:", error);
      setIsLoading(false); // Ensure loading is stopped in case of an error
    }
  };

  const handleRemoveFile = async () => {
    // Logic to remove the file from storage and update Firestore
    setIsLoading(true); // Start loading

    try {
      // Construct the file name using the userName state
      const fileName = `${userName.firstName} ${userName.lastName}-Letter_of_Reference.pdf`;
      const storageRef = storage.ref(`userLettersOfReference/${user.id}/${fileName}`);
      await storageRef.delete(); // Delete the file from storage

      await db.collection('SurveyResponses').doc(user.id).update({
        letterOfReference: null, // Remove the reference from Firestore
      });

      setFileUrl(null); // Clear the file URL state
      setIsLoading(false); // Stop loading after removal is complete
    } catch (error) {
      console.error("Error removing file:", error);
      setIsLoading(false); // Ensure loading is stopped in case of an error
    }
  };

  const handleNext = async () => {
    if (user && fileUrl) {
      const newFormData = {
        letterOfReference: fileUrl,
      };

      await db.collection('SurveyResponses').doc(user.id).update(newFormData);
    }

    navigate('/rent/off-campus/step20');
  };

  return (
    <div className="form-container">
      <h2 className="step-title">Letter of Reference</h2>
      <p className="step-description">Please Upload a Letter of Reference (Optional) - Limit 1</p>

      {isLoading ? (
        <Spinner />
      ) : (
        fileUrl && (
          <div className="image-preview-container">
            <button
              onClick={() => window.open(fileUrl, '_blank', 'noopener,noreferrer')}
              className="next-button"
            >
              View Letter of Reference
            </button>
            <button onClick={handleRemoveFile} className="remove-button">
              Remove
            </button>
          </div>
        )
      )}

      <div className="file-input-container">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="input-field file-input"
        />
      </div>

      <Link to="/rent/off-campus/step18">
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

export default OffCampusHousingFormStep19;