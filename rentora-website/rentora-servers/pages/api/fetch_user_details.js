// pages/api/fetchUserDetails.js

import { db } from './firebase_admin'; // Adjust the path according to your project structure

export default async function handler(req, res) {

    res.setHeader('Access-Control-Allow-Origin', 'https://www.rentora.net'); // Adjust as needed for your domain
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Return early for OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
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
            phone: data.phone || 'No phone',
            schoolName: data.schoolName || 'No school name',
            addToRoommateSearch: typeof data.addToRoommateSearch === 'boolean' ? data.addToRoommateSearch : false,
            lookingForRoommates: typeof data.lookingForRoommates === 'boolean' ? data.lookingForRoommates : false,
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

      res.status(200).json(userDetails);
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
