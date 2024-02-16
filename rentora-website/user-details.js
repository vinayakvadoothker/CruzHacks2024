const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

// Enable CORS
app.use(cors());

// Initialize Firebase Admin SDK
const serviceAccount = require('./rentora-dbfa3-firebase-adminsdk-4rpix-4bb6bae0fe.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Function to fetch user details
const fetchUserDetails = async () => {
  const responsesRef = db.collection('SurveyResponses');
  const snapshot = await responsesRef.get();

  const userDetails = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    userDetails.push({
      id: doc.id,
      firstName: data.firstName || 'No first name',
      lastName: data.lastName || 'No last name',
      email: data.email || 'No email',
      schoolName: data.schoolName || 'No school name',
      addToRoommateSearch: data.addToRoommateSearch || 'Not specified'
    });
  });

  return userDetails;
};

// Route to fetch user details
app.get('/fetch_user_details', async (req, res) => {
  try {
    const userDetails = await fetchUserDetails();
    res.json(userDetails);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
const port = 3002;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
