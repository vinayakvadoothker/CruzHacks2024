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
      addToRoommateSearch: data.addToRoommateSearch || 'Not specified',
      activitiesHistory: data.activitiesHistory || [], // Assuming this is an array of objects
      major: data.major || 'No major specified',
      middleInitial: data.middleInitial || '',
      residence: data.residence || 'No residence specified',
      startDate: data.startDate || 'No start date',
      profilePicture: data.profilePicture || 'No profile picture URL',
      lifestyle: data.lifestyle || 'No lifestyle specified',
      studyHabits: data.studyHabits || 'No study habits specified',
      socializingFrequency: data.socializingFrequency || 'No socializing frequency specified',
      choresPreference: data.choresPreference || 'No chores preference specified',
      privacyComfort: data.privacyComfort || 'No privacy comfort specified',
      communicationComfort: data.communicationComfort || 'No communication comfort specified',
      expenseHandling: data.expenseHandling || 'No expense handling specified',
      scheduleCoordination: data.scheduleCoordination || 'No schedule coordination specified',
      goalsSupport: data.goalsSupport || 'No goals support specified',
      overnightGuests: data.overnightGuests || 'No overnight guests specified'
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
