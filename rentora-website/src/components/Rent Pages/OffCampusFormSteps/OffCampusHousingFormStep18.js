import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { db, storage } from "../../config";
import { PDFDocument } from 'pdf-lib';
import Spinner from './Spinner';
import Stepper from './Stepper';
import './styles.css';

import { useSteps } from './StepContext';
import ProgressBar from './ProgressBar';


const OffCampusHousingFormStep18 = () => {
  const { user } = useUser();
  const navigate = useNavigate();


  const { steps, completeStep } = useSteps(); // Use the useSteps hook
  const currentStep = 17; // Step index starts from 0, so step 3 is index 2
  const onStepChange = (stepIndex) => {
    navigate(`/rent/off-campus/step${stepIndex + 1}`);
  };

  const [formData, setFormData] = useState({
    governmentId: '',
    photoIdType: '',
    photoIdNumber: '',
    idExpiryDate: '',
    issuingGovernment: '', // New state for issuing government
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state


  useEffect(() => {
    if (user) {
      db.collection('SurveyResponses')
        .doc(user.id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const storedData = doc.data();
            setFormData(storedData);

            if (storedData.governmentId) {
              setImagePreview(storedData.governmentId);
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }
  }, [user]);

  useEffect(() => {
    // Save photoIdType, photoIdNumber, and issuingGovernment to the database whenever they change
    if (user) {
      const updateData = {};

      if (formData.photoIdType) {
        updateData.photoIdType = formData.photoIdType;
      }

      if (formData.photoIdNumber) {
        updateData.photoIdNumber = formData.photoIdNumber;
      }
      if (formData.idExpiryDate) {
        updateData.idExpiryDate = formData.idExpiryDate;
      }
      if (formData.issuingGovernment) {
        updateData.issuingGovernment = formData.issuingGovernment;
      }

      if (Object.keys(updateData).length > 0) {
        // Only update if there is data to update
        db.collection('SurveyResponses').doc(user.id).update(updateData)
          .then(() => {
            console.log('Photo ID Type, Number, ID Expiry Date, and Issuing Government saved to the database');
          })
          .catch((error) => {
            console.error('Error saving Photo ID Type, Number, ID Expiry Date, and Issuing Government:', error);
          });
      }
    }
  }, [user, formData.photoIdType, formData.photoIdNumber, formData.issuingGovernment, formData.idExpiryDate]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsLoading(true); // Start loading
      try {
        // For images, convert to PDF. Otherwise, you might just want to alert the user.
        if (file.type.startsWith('image/')) {
          // Create a new PDF document
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage();
          const jpgUrl = URL.createObjectURL(file);
          const jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer());

          // Embed the JPG image
          const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
          const { width, height } = jpgImage.size();
          page.drawImage(jpgImage, {
            x: 0,
            y: 0,
            width: page.getWidth(),
            height: (height * page.getWidth()) / width,
          });

          // Serialize the PDFDocument to bytes (a Uint8Array)
          const pdfBytes = await pdfDoc.save();
          const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
          const pdfFile = new File([pdfBlob], 'converted.pdf', { type: 'application/pdf' });

          // Upload the PDF file instead of the original image
          const downloadURL = await uploadFileToStorage(user.id, pdfFile);
          setFormData({
            ...formData,
            governmentId: downloadURL,
          });
          setImagePreview(URL.createObjectURL(pdfBlob)); // Show preview of the PDF
        } else {
          // For non-image files, you might want to alert the user or handle differently
          alert('Please upload an image file.');
        }
      } catch (error) {
        console.error("Error processing file:", error);
        alert('An error occurred while processing the file.');
      }
      setIsLoading(false); // End loading
    }
  };

  const handlePhotoIdTypeChange = (e) => {
    const selectedType = e.target.value;
    setFormData({
      ...formData,
      photoIdType: selectedType,
    });
  };

  const handlePhotoIdNumberChange = (e) => {
    const number = e.target.value;
    setFormData({
      ...formData,
      photoIdNumber: number,
    });
  };



  const handleIssuingGovernmentChange = (e) => {
    const selectedGovernment = e.target.value;
    setFormData({
      ...formData,
      issuingGovernment: selectedGovernment,
    });
  };

  const handleNext = async () => {
    if (!formData.photoIdType || !formData.photoIdNumber || !formData.issuingGovernment || !formData.idExpiryDate) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsLoading(true); // Start loading indicator

    if (user) {
      let updatedFormData = {
        ...formData,
        photoIdType: formData.photoIdType,
        photoIdNumber: formData.photoIdNumber,
        issuingGovernment: formData.issuingGovernment,
        idExpiryDate: formData.idExpiryDate,
      };

      if (formData.file) {
        // Upload the file and get the download URL
        const governmentIdUrl = await uploadFileToStorage(user.id, formData.file);
        updatedFormData.governmentId = governmentIdUrl; // Update the governmentId in the formData
      }

      // Update the SurveyResponses document with the updated formData
      await db.collection('SurveyResponses').doc(user.id).update(updatedFormData)
        .then(() => {
          console.log("SurveyResponses document successfully updated");
        })
        .catch((error) => {
          console.error("Error updating SurveyResponses document:", error);
        });
    }

    setIsLoading(false); // Stop loading indicator

    completeStep(currentStep);
    navigate('/rent/off-campus/step19');
  };



  const uploadFileToStorage = async (userId, file) => {
    const fileName = `${formData.firstName} ${formData.lastName}-Photo_ID.pdf`; // Save with .pdf extension
    const storageRef = storage.ref(`userGovernmentIds/${userId}/${fileName}`);

    try {
      await storageRef.put(file);
      const downloadURL = await storageRef.getDownloadURL();
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file: ", error);
      return '';
    }
  };


  const top50Countries = [
    "United States", "China", "India", "Indonesia", "Pakistan", "Brazil", "Nigeria", "Bangladesh", "Russia", "Mexico",
    "Japan", "Ethiopia", "Philippines", "Egypt", "Vietnam", "DR Congo", "Turkey", "Iran", "Germany", "Thailand",
    "United Kingdom", "France", "Italy", "Tanzania", "South Africa", "Myanmar", "Kenya", "South Korea", "Colombia", "Spain",
    "Uganda", "Argentina", "Algeria", "Sudan", "Ukraine", "Iraq", "Afghanistan", "Poland", "Canada", "Morocco", "Saudi Arabia",
    "Uzbekistan", "Malaysia", "Peru", "Angola", "Ghana", "Mozambique", "Yemen", "Nepal", "Venezuela"
  ];

  return (
    <>
      <ProgressBar steps={steps} currentStep={currentStep} onStepChange={onStepChange} />
      <div className="form-container" >
        <Stepper currentStep={currentStep} /> {/* Update Stepper with currentStep */}
        <h2 className="step-title">{steps[currentStep].title}</h2> {/* Display the step title */}
      <p className="step-description">(Required) Please Upload a Government-Issued Photo ID*</p>
  
      <div className="file-input-container">
        <input
          type="file"
          accept=".jpg, .jpeg"
          onChange={handleFileChange}
          className="input-field file-input"
        />
      </div>
  
      {(imagePreview && !isLoading) && (
        <button
          onClick={() => window.open(imagePreview, '_blank', 'noopener,noreferrer')}
          className="next-button"
          style={{ width: 'fit-content' }} // Adjust width to fit the content
        >
          View Government-Issued Photo ID
        </button>
      )}
  
      {isLoading && <Spinner />}
  
      <div className="select-container">
        <label htmlFor="photoIdType">Select Photo ID Type:</label>
        <select
          id="photoIdType"
          name="photoIdType"
          value={formData.photoIdType}
          onChange={handlePhotoIdTypeChange}
          className="input-field"
        >
          <option value="">Select Type</option>
          <option value="Driver License">Driver's License</option>
          <option value="Passport">Passport</option>
        </select>
      </div>
  
      <div className="input-container">
        <label htmlFor="photoIdNumber">Photo ID Number:</label>
        <input
          type="text"
          id="photoIdNumber"
          name="photoIdNumber"
          value={formData.photoIdNumber}
          onChange={handlePhotoIdNumberChange}
          className="input-field"
        />
      </div>
  
      {/* Label for Date of Birth */}
      <label htmlFor="idExpiryDate">Enter Photo ID Expiration Date:</label>
      {/* Input field for Date of Birth */}
      <input
        type="date"
        id="idExpiryDate"
        placeholder="Expiry Date"
        className="input-field"
        value={formData.idExpiryDate}
        onChange={(e) => setFormData({ ...formData, idExpiryDate: e.target.value })}
      />
  
      {/* Add dropdown for Issuing Government */}
      <div className="select-container">
        <label htmlFor="issuingGovernment">Issuing Government:</label>
        <select
          id="issuingGovernment"
          name="issuingGovernment"
          value={formData.issuingGovernment}
          onChange={handleIssuingGovernmentChange}
          className="input-field"
        >
          <option value="">Select Government</option>
          {top50Countries.map((country, index) => (
            <option key={index} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
  
      <Link to="/rent/off-campus/step17">
        <span className="back-button">{'<-'}</span>
      </Link>
  
      <button
        className="next-button"
        onClick={handleNext}
        disabled={!formData.governmentId}
      >
        Next
      </button>
    </div>
    </>
  );
  
};  

export default OffCampusHousingFormStep18;