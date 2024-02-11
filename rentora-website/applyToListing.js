const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PDFDocument, PDFTextField } = require('pdf-lib');

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
    const { userIds, address } = req.body; // Expect userIds to be an array of user IDs

    if (!userIds || userIds.length === 0 || !address) {
        return res.status(400).json({ error: 'User IDs and address are required.' });
    }

    try {
        const combinedPdfDoc = await PDFDocument.create();

        const fieldNames = [
            '13 Address of Proposed Rental',
            '14 Proposed Movein Date',
            '5 Pets',
            '6',
            '5',
            '4',
            '3',
            '2',
            '1',
            'Dated',
            'Deposit Amount',
            'Street',
        ];

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

                const form = userPdfDoc.getForm();

                for (const fieldName of fieldNames) {
                    const field = form.getField(fieldName);
                    if (!field) {
                        console.log(`Field "${fieldName}" not found for user ${userId}`);
                        continue;
                    }

                    const originalText = field.getText();
                    console.log(`Text field found for user ${userId}. Original text: "${originalText}"`);

                    if (field instanceof PDFTextField) {
                        // Handle PDFTextField
                        field.setText(address[fieldName]);
                    } else {
                        // Handle other field types (if needed)
                        console.log(`Unhandled field type ${field.constructor.name} for field "${fieldName}"`);
                    }
                }

                // Copy only the modified pages to the combined PDF
                const modifiedPdfBytes = await userPdfDoc.save({ useObjectStreams: false });

                // Append modified document to the combined PDF
                const modifiedPdfDoc = await PDFDocument.load(modifiedPdfBytes);
                const modifiedPages = await combinedPdfDoc.copyPages(modifiedPdfDoc, modifiedPdfDoc.getPageIndices());
                modifiedPages.forEach((page) => combinedPdfDoc.addPage(page));
            } else {
                console.log(`PDF for user ${userId} not found.`);
            }
        }

        const combinedPdfBytes = await combinedPdfDoc.save({ useObjectStreams: false });
        const combinedPdfBuffer = Buffer.from(combinedPdfBytes.buffer); // Convert Uint8Array to Buffer

        const combinedPdfPath = `Combined_Applications/combined_application-${userIds}.pdf`;
        const combinedPdfFile = bucket.file(combinedPdfPath);

        await combinedPdfFile.save(combinedPdfBuffer, {
            metadata: { contentType: 'application/pdf' },
        });

        const [url] = await combinedPdfFile.getSignedUrl({
            action: 'read',
            expires: '03-01-2500',
        });

        console.log('Combined PDF generated and saved');
        res.status(200).json({ success: 'Combined PDF generated and saved', url });
    } catch (error) {
        console.error('Error combining PDFs:', error);
        res.status(500).json({ error: 'Error combining PDFs' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
