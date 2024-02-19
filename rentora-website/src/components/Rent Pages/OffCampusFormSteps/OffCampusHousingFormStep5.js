import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { db, storage } from "../../config";
import Spinner from './Spinner';
import Stepper from './Stepper';
import './styles.css';

import { useSteps } from './StepContext';
import ProgressBar from './ProgressBar';


const OffCampusHousingFormStep5 = () => {
  const { user } = useUser();
  const navigate = useNavigate();


  const { steps, completeStep } = useSteps(); // Use the useSteps hook
  const currentStep = 4; // Step index starts from 0, so step 3 is index 2
  const onStepChange = (stepIndex) => {
    navigate(`/rent/off-campus/step${stepIndex + 1}`);
  };
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.imageUrl || "url_to_default_image.jpg"); // Default to Clerk image or a default image

  const uploadFileToStorage = useCallback(async (userId, file) => {
    // Construct the new file name with a fixed '.jpg' extension
    const newFileName = `${user.firstName}_${user.lastName}_Profile_Picture.jpg`;
    // Create a reference in your storage with the desired path and file name
    const storageRef = storage.ref(`userProfilePictures/${userId}/${newFileName}`);
  
    try {
      // Convert the file to a Blob if it's not a jpg to ensure it's in the right format before uploading
      let blob = file;
      if (file.type !== 'image/jpeg') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(e);
          img.src = URL.createObjectURL(file);
        });
  
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg'));
      }
  
      // Upload the Blob or the original jpg file
      await storageRef.put(blob);
      // Get the download URL of the uploaded jpg file
      const downloadURL = await storageRef.getDownloadURL();
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file: ", error);
      return ''; // Return an empty string in case of error
    }
  }, [user.firstName, user.lastName]);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (user) {
        const docRef = db.collection('SurveyResponses').doc(user.id);
        const doc = await docRef.get();
        if (doc.exists && doc.data().profilePicture) {
          setImagePreview(doc.data().profilePicture);
        } else if (user.imageUrl) { // Check if Clerk image is available
          try {
            const response = await fetch(user.imageUrl);
            const blob = await response.blob();
            const file = new File([blob], "clerkProfileImage.jpg", { type: "image/jpeg" });
  
            const downloadURL = await uploadFileToStorage(user.id, file);
            setImagePreview(downloadURL);
            await db.collection('SurveyResponses').doc(user.id).update({ profilePicture: downloadURL });
            console.log("Clerk image successfully uploaded to storage and saved to database.");
          } catch (error) {
            console.error("Error fetching and uploading Clerk image:", error);
          }
        }
      }
    };
  
    fetchProfilePicture();
  }, [user, uploadFileToStorage]);
  

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && user) {
      setUploading(true);
      const downloadURL = await uploadFileToStorage(user.id, file);
      setImagePreview(downloadURL); // Update the image preview immediately
      await db.collection('SurveyResponses').doc(user.id).update({ profilePicture: downloadURL });
      setUploading(false);
    }
  };

  const handleNext = () => {
    completeStep(currentStep);
    navigate('/rent/off-campus/step6');
  };

  return (
    <>
    <ProgressBar steps={steps} currentStep={currentStep} onStepChange={onStepChange} />
    <div className="form-container" >
      <Stepper currentStep={currentStep} /> {/* Update Stepper with currentStep */}
      <h2 className="step-title">{steps[currentStep].title}</h2> {/* Display the step title */}
      <p className="step-description">Please Upload a Professional Picture For The Cover Of Your Application *</p>
      {uploading ? (
        <Spinner />
      ) : (
        <img
          src={imagePreview}
          alt="Profile"
          className="image-preview"
        />
      )}
      <div className="file-input-container">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="input-field file-input"
          disabled={uploading}
        />
      </div>

      <Link to="/rent/off-campus/step4">
        <span className="back-button">{'<-'}</span>
      </Link>
      <button className="next-button" onClick={handleNext} disabled={uploading}>
        Next
      </button>
    </div>
    </>
  );
};

export default OffCampusHousingFormStep5;
