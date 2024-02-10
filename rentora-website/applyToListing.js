const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PDFDocument } = require('pdf-lib');

// Initialize Firebase Admin SDK with your credentials and settings
const serviceAccount = require('./rentora1.json'); 
const databaseURL = "https://rentora-dbfa3.firebaseio.com"; 

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL,
    storageBucket: 'gs://rentora-dbfa3.appspot.com',
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();
const port = 3200; // Use your desired port

app.use(cors());
app.use(bodyParser.json());

app.post('/combine-roommate-applications', async (req, res) => {
  const { userIds } = req.body; // Expect userIds to be an array of user IDs

  if (!userIds || userIds.length === 0) {
    return res.status(400).json({ error: 'User IDs are required.' });
  }

  try {
    const combinedPdfDoc = await PDFDocument.create();

    for (const userId of userIds) {
      // Retrieve user data from Firestore to get first and last names
      const userData = await db.collection('SurveyResponses').doc(userId).get();
      if (!userData.exists) {
        console.log(`User data for ${userId} not found.`);
        continue; // Skip this user and continue with the next one
      }

      const { firstName, lastName } = userData.data();
      const userPdfPath = `Rental Applications/${firstName} ${lastName}/${userId}_official_filled.pdf`;
      const file = bucket.file(userPdfPath);
      const [exists] = await file.exists();

      if (exists) {
        const [fileBuffer] = await file.download();
        const userPdfDoc = await PDFDocument.load(fileBuffer);
        const copiedPages = await combinedPdfDoc.copyPages(userPdfDoc, userPdfDoc.getPageIndices());
        copiedPages.forEach((page) => combinedPdfDoc.addPage(page));
      } else {
        console.log(`PDF for user ${userId} not found.`);
      }
    }

    const combinedPdfBytes = await combinedPdfDoc.save();
    const combinedPdfBuffer = Buffer.from(combinedPdfBytes.buffer); // Convert Uint8Array to Buffer
    
    const combinedPdfPath = `Combined_Applications/combined_application-${userIds}.pdf`;
    const combinedPdfFile = bucket.file(combinedPdfPath);
    
    await combinedPdfFile.save(combinedPdfBuffer, { // Use combinedPdfBuffer instead of combinedPdfBytes
      metadata: { contentType: 'application/pdf' },
    });
    
    const [url] = await combinedPdfFile.getSignedUrl({
      action: 'read',
      expires: '03-01-2500',
    });

    res.status(200).json({ success: 'Combined PDF generated and saved', url });
  } catch (error) {
    console.error('Error combining PDFs:', error);
    res.status(500).json({ error: 'Error combining PDFs' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});