// ProfilePage.js
import React, { useRef, useEffect, useState } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { db } from "./config.js";




const ProfilePage = () => {
  const { user } = useClerk();
  const [pdfUrl, setPdfUrl] = useState('');
  const fileInputRef = useRef(null);


  const viewPublicProfile = () => {
    const publicProfileUrl = `https://www.rentora.net/profiles/${user.id}`; // Construct the URL
    window.open(publicProfileUrl, '_blank'); // Open the URL in a new tab
  };

  const editForm = () => {
    const publicProfileUrl = `https://www.rentora.net/rent/off-campus/step1`; // Construct the URL
    window.open(publicProfileUrl, '_blank'); // Open the URL in a new tab
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
    <div style={{ ...styles.container, maxWidth: '290px' }} className="form-container">
      {/* Profile Image with Edit Button */}
      <div style={{ ...styles.imageContainer, marginBottom: '20px' }}>
        <img src={userProfile.profileImage} alt="Profile" style={styles.profileImage} />
        <div style={styles.editImageButtonContainer}>
          <button onClick={handleEditProfileImage} style={styles.editImageButton}>
            Edit
          </button>
        </div>
        {/* File input for profile image */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
  
      {/* User Name */}
      <div style={{ ...styles.nameContainer, marginBottom: '20px' }}>
        <h2 style={styles.userName}>
          <strong>{userProfile.firstName} {userProfile.lastName}</strong>
        </h2>
        <p style={styles.username}>{user?.username && <em>{user.username}</em>}</p>
      </div>
  
      {/* Contact Info */}
      <div style={{ ...styles.contactContainer, marginBottom: '20px' }}>
        {/* Add your contact info elements here */}
      </div>
        {/* Button for Viewing the Public Profile */}
        <div>
        <button
          style={{
            backgroundColor: '#426aa3', // Green color for differentiation
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontFamily: 'Verdana',
            fontSize: '16px',
            marginBottom: '10px', // Add some space below the button
          }}
          onClick={viewPublicProfile}
        >
          View Public Profile
        </button>

        <button
          style={{
            backgroundColor: '#6066c9', // Green color for differentiation
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontFamily: 'Verdana',
            fontSize: '16px',
            marginBottom: '10px', // Add some space below the button
            marginLeft: '10px',
          }}
          onClick={editForm}
        >
          Edit My Information
        </button>
      </div>
      {/* Preferences for Housing Types */}
      <div style={{ ...styles.preferencesContainer }}>
        <h3 style={styles.preferencesHeading}>Rental Application Packet</h3>
      </div>
      {/* Display the PDF URL */}
      {pdfUrl && (
        <div>
          <h3>Your Rental Application:</h3>
          <button
            style={{
              backgroundColor: '#3498db',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: 'Verdana', 
              fontSize: '16px',
            }}
            onClick={() => window.open(pdfUrl, '_blank')}
          >
            View PDF
          </button>
        </div>
      )}
    </div>
  );
  
};

export default ProfilePage;

// Updated Styling
const styles = {
  container: {
    textAlign: 'center',
    padding: '50px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: '80%', // Increased width
  },
  imageContainer: {
    position: 'relative',
    marginBottom: '20px',
  },
  profileImage: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
  },
  editImageButton: {
    position: 'absolute',
    bottom: '0',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    padding: '8px', // Smaller padding
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontFamily: 'Verdana',
    fontSize: '12px', // Smaller font size
  },
  nameContainer: {
    marginBottom: '10px',
  },
  userName: {
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: 'Verdana',
  },
  username: {
    fontSize: '14px', // Smaller font size
    fontStyle: 'italic',
  },
  contactContainer: {
    marginBottom: '20px',
  },
  contactInfo: {
    fontSize: '16px',
    marginBottom: '10px',
    fontFamily: 'Verdana',
  },
  portfolioContainer: {
    marginBottom: '20px',
  },
  portfolioHeading: {
    fontSize: '18px',
    fontWeight: 'bold',
    fontFamily: 'Verdana',
  },
  socialLink: {
    fontSize: '16px',
    margin: '5px 0',
    fontFamily: 'Verdana',
  },
  preferencesContainer: {
    marginTop: '20px',
  },
  preferencesHeading: {
    fontSize: '18px',
    fontWeight: 'bold',
    fontFamily: 'Verdana',
  },
  preferencesText: {
    fontSize: '16px',
    fontFamily: 'Verdana', 
  },
};
