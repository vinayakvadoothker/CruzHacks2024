// pages/api/generate-pdf/[userId].js

import admin from 'firebase-admin';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import fs from 'fs';


// Initialize Firebase Admin SDK
const serviceAccount = require('../rentora1.json');
const databaseURL = "https://rentora-dbfa3.firebaseio.com";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL,
        storageBucket: 'gs://rentora-dbfa3.appspot.com',
    });
}

const storage = admin.storage();
const bucket = storage.bucket();
const db = admin.firestore();


// Function to download the PDF template from Firebase Storage
async function downloadPdfTemplate() {
    try {
        // Define the path to save the PDF template
        const localFilePath = '/tmp/sublease_agreement_fillable.pdf'; // Use a temporary directory

        // Specify the path to the PDF template in Firebase Storage
        const remoteFilePath = 'sublease_agreement_fillable.pdf'; // Update with the actual path

        // Download the PDF template from Firebase Storage
        await bucket.file(remoteFilePath).download({ destination: localFilePath });

        return localFilePath;
    } catch (error) {
        console.error('Error downloading PDF template:', error);
        throw error;
    }
}

export default async function handler(req, res) {
    const { userId } = req.query;

    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Adjust as needed for your domain
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Retrieve user data from Firestore based on the user ID
        const docSnapshot = await db.collection('SurveyResponses').doc(userId).get();


        if (!docSnapshot.exists) {
            return res.status(404).json({ error: 'User data not found' });
        }

        const formData = docSnapshot.data();



        // Function to handle the creation and uploading of a PDF
        async function createAndUploadPDF(templatePath, outputFilename, qrCodeText) {
            const pdfBuffer = await fs.promises.readFile(templatePath);
            const pdfDoc = await PDFDocument.load(pdfBuffer);
            const form = pdfDoc.getForm();


            // Get the first page of the document
            const page1 = pdfDoc.getPages()[0];

            const pageWidth1 = page1.getSize().width;
            const pageHeight = page1.getSize().height;


            function getFieldValue(fieldValue) {
                return fieldValue && fieldValue.toString().trim() ? fieldValue.toString().trim() : 'N/A';
            }



            // Sub landlord information
            form.getTextField('subLandlordFirstName').setText(getFieldValue(formData.subLandlordFirstName));
            if (formData.subLandlordMiddleInitial.length > 0) {form.getTextField('subLandlordMiddleInitial').setText(getFieldValue(formData.subLandlordMiddleInitial))};
            form.getTextField('subLandlordLastName').setText(getFieldValue(formData.subLandlordLastName));

            // Sub tenant information
            form.getTextField('subtenantFirstName').setText(getFieldValue(formData.subtenantFirstName));
            if (formData.subtenantMiddleInitial.length > 0) {form.getTextField('subtenantMiddleInitial').setText(getFieldValue(formData.subtenantMiddleInitial))};
            form.getTextField('subtenantLastName').setText(getFieldValue(formData.subtenantLastName));

            // Address information
            form.getTextField('address').setText(getFieldValue(formData.address));
            form.getTextField('city').setText(getFieldValue(formData.city));
            form.getTextField('aptNumber').setText(getFieldValue(formData.aptNumber));
            form.getTextField('state').setText(getFieldValue(formData.state));

            // Rental period
            form.getTextField('startDate').setText(getFieldValue(formData.startDate));
            form.getTextField('endDate').setText(getFieldValue(formData.endDate));

            // Financial information
            form.getTextField('monthlyRentAmount').setText(getFieldValue(formData.monthlyRentAmount));
            form.getTextField('securityDepositAmount').setText(getFieldValue(formData.securityDepositAmount));


            // Continue adding other details from formData
            // You can adjust the y value to move down for each new line
            // Example: Address, Phone, Email, Education, Employment History, etc.

            // Flatten the form to prevent editing after filling
            const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

            // Construct the folder path with user's first and last name
            const userFolderPath = `Subleasing Agreements/${formData.firstName} ${formData.lastName}`;
            const filePath = `${userFolderPath}/${outputFilename}`;

            const file = bucket.file(filePath);
            const stream = file.createWriteStream({
                metadata: {
                    contentType: 'application/pdf',
                },
            });

            return new Promise((resolve, reject) => {
                stream.on('error', (error) => {
                    console.error(`Error uploading ${filePath} to Firebase Storage:`, error);
                    reject(error);
                });

                stream.on('finish', async () => {
                    const [url] = await file.getSignedUrl({
                        action: 'read',
                        expires: '03-01-2500',
                    });

                    // Save the URL with a reference in Firestore, you might want to adjust the structure
                    await db.collection('FilledPDFsSubleasing').doc(userId).set({ [outputFilename]: url }, { merge: true });

                    resolve(url);
                });

                stream.end(pdfBytes);
            });
        }

        // Download the PDF template from Firebase Storage
        const pdfTemplatePath = await downloadPdfTemplate();

        // Use the downloaded PDF template path to generate and upload the PDF
        await createAndUploadPDF(pdfTemplatePath, `${userId}_filled.pdf`, userId, formData);
        await createAndUploadPDF(pdfTemplatePath, `${userId}_official_filled.pdf`, userId, formData);

        res.status(200).json({ success: 'PDF generated and saved' });
    } catch (error) {
        console.error('Error generating and saving PDF:', error);
        res.status(500).json({ error: 'Error generating and saving PDF' });
    }
}
