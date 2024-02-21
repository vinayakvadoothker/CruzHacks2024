// ProfilePage.js
import React, { useRef, useEffect, useState } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { db } from "./config.js";
import './ProfilePage.css'



const ProfilePage = () => {
  const { user } = useClerk();
  const [pdfUrl, setPdfUrl] = useState('');
  const fileInputRef = useRef(null);


  const viewPublicProfile = () => {
    const publicProfileUrl = `https://www.rentora.net/profiles/${user.id}`; // Construct the URL
    window.open(publicProfileUrl, '_blank'); // Open the URL in a new tab
  };

  const editForm = () => {
    const editFormUrl = `https://www.rentora.net/rent/off-campus/step1`; // Construct the URL
    window.location.href = editFormUrl; // Navigate to the URL in the same tab
  };

  useEffect(() => {
    const fetchPdfUrl = async () => {
      if (user) {
        try {
          const userId = user.id;
          // Fetch the PDF data from the database based on the user's ID
          const doc = await db.collection('FilledPDFs').doc(userId).get();

          if (doc.exists) {
            const userData = doc.data();
            // Use the constructed field name to fetch the watermarked PDF URL
            const watermarkedPdfFieldName = `${userId}_filled.pdf`;

            if (userData[watermarkedPdfFieldName]) {
              setPdfUrl(userData[watermarkedPdfFieldName]);
            }
          }
        } catch (error) {
          console.error('Error fetching PDF URL:', error);
        }
      }
    };

    fetchPdfUrl();
  }, [user]);


  // Dummy data for demonstration, replace with actual user data
  const userProfile = {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.primaryEmailAddress?.email ?? '',
    phoneNumber: user?.primaryPhoneNumber?.phoneNumber ?? '',
    profileImage: user?.imageUrl ?? 'url_to_default_image.jpg',
    housingPreferences: user?.housingPreferences ?? '',
  };

  // Function to handle editing the profile image
  const handleEditProfileImage = () => {
    // Trigger file input click
    fileInputRef.current.click();
  };

  // Function to handle file selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      try {
        // Call setProfileImage with the selected file
        const uploadedImage = await user.setProfileImage({ file });

        // You can update the UI or handle success as needed
        window.location.reload();
        console.log('Image uploaded successfully:', uploadedImage);
      } catch (error) {
        // Handle error
        console.error('Error uploading image:', error);
      }
    }
  };

  return (
    <div className="profile-page-container">
      <div className="profile-image-container">
        <img src={userProfile.profileImage} alt="Profile" className="profile-image" />
        <button onClick={handleEditProfileImage} className="edit-image-button">Edit</button>
        <input type="file" accept="image/*" ref={fileInputRef} className="file-input-profile-page" onChange={handleFileChange} />
      </div>

      <div className="user-name-container">
        <h2 className="user-name"><strong>{userProfile.firstName} {userProfile.lastName}</strong></h2>
        <p className="username">{user?.username && <em>{user.username}</em>}</p>
      </div>

      <div className="contact-info-container">
      </div>

      <button className="view-public-profile-button" onClick={viewPublicProfile}>View Public Profile</button>
      <button className="edit-info-button" onClick={editForm}>Edit My Information</button>

      <div className="housing-preferences-container">
        <h3 className="housing-preferences-heading">Rental Application Packet</h3>
      </div>

      {pdfUrl && (
        <button className="view-pdf-button" onClick={() => window.open(pdfUrl, '_blank')}>View PDF</button>
      )}
    </div>
  );
};

export default ProfilePage;