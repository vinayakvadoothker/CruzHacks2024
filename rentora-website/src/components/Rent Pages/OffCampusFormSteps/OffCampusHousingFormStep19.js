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

  useEffect(() => {
    if (user) {
      db.collection('SurveyResponses')
        .doc(user.id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const formData = doc.data();
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
      const fileName = `${user.firstName} ${user.lastName}-Letter_of_Reference.pdf`;
      const storageRef = storage.ref(`userLettersOfReference/${user.id}/${fileName}`);
      await storageRef.put(file);
      const downloadURL = await storageRef.getDownloadURL();

      setFileUrl(downloadURL);
      setIsLoading(false);
    } catch (error) {
      console.error("Error in handleFileChange:", error);
      setIsLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFileUrl(null);
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
    <div className="form-container" style={{ width: '50%', margin: '60px auto', maxHeight: '80vh', overflowY: 'auto', overflowX: 'auto', padding: '20px' }}>
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