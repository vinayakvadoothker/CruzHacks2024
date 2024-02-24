// pages/api/generate-pdf/[userId].js

import admin from 'firebase-admin';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { useRouter } from 'next/router';

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

export default async function handler(req, res) {
    const router = useRouter();
    const { userId } = router.query;

    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', 'https://www.rentora.net'); // Adjust as needed for your domain
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Retrieve user data from Firestore based on the user ID
        const docSnapshot = await db.collection('SurveyResponses').doc(userId).get();


        if (!docSnapshot.exists) {
            return res.status(404).json({ error: 'User data not found' });
        }

        const formData = docSnapshot.data();

        async function generateQRCodeImage(url) {
            try {
                // Generate the QR code with a transparent background
                const qrCode = await QRCode.toDataURL(url, {
                    errorCorrectionLevel: 'H',
                    type: 'image/png',
                    margin: 1,
                    color: {
                        dark: '#426aa3ff', 
                        light: '#0000' // RGBA value for transparent background
                    }
                });
                return qrCode; // This is a data URL of the QR code image
            } catch (error) {
                console.error('Error generating QR code', error);
                throw error;
            }
        }


        // Function to handle the creation and uploading of a PDF
        async function createAndUploadPDF(templatePath, outputFilename, qrCodeText) {
            const pdfBuffer = await fs.promises.readFile(templatePath);
            const pdfDoc = await PDFDocument.load(pdfBuffer);
            const form = pdfDoc.getForm();


            // Generate QR code image for the URL
            const qrCodeDataURL = await generateQRCodeImage(`https://www.rentora.net/profiles/${userId}`);

            // Extract the raw image data from the Data URL
            const qrImageBytes = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');

            // Embed the QR code image into the PDF
            const qrImage = await pdfDoc.embedPng(qrImageBytes);

            // Get the first page of the document
            const page1 = pdfDoc.getPages()[0];

            // Calculate position for the QR code (top-right corner)
            const pageWidth1 = page1.getSize().width;
            const pageHeight = page1.getSize().height;
            const qrSize = 65; // Set the size of the QR code
            const qrX = pageWidth1 - qrSize - 30; // 30 is the margin from the right edge
            const qrY = pageHeight - qrSize - 48; // 30 is the margin from the top edge

            // Draw the QR code image
            page1.drawImage(qrImage, {
                x: qrX,
                y: qrY,
                width: qrSize,
                height: qrSize
            });



            function getFieldValue(fieldValue) {
                return fieldValue && fieldValue.toString().trim() ? fieldValue.toString().trim() : 'N/A';
            }

            // Enhanced splitAddress function to handle undefined addresses
            function splitAddress(address) {
                if (!address) return { street: 'N/A', city: 'N/A', state: 'N/A' };
                const parts = address.split(',').map(part => getFieldValue(part)); // Use getFieldValue to handle empty parts
                return {
                    street: parts[0],
                    city: parts[1] || 'N/A', // Provide default value if undefined
                    state: parts[2] || 'N/A'
                };
            }

            // Basic Personal Information
            form.getTextField('firstName').setText(getFieldValue(formData.firstName));
            form.getTextField('lastName').setText(getFieldValue(formData.lastName));
            form.getTextField('middleInitial').setText(getFieldValue(formData.middleInitial));
            form.getTextField('dateOfBirth').setText(getFieldValue(formData.dateOfBirth));
            form.getTextField('phone').setText(getFieldValue(formData.phone));
            form.getTextField('firstNamelastName').setText(getFieldValue(formData.firstName + " " + formData.lastName));
            form.getTextField('TodaysDate1').setText(getFieldValue(formData.GuarantorSubmissionDate));

            // ID and School Information
            form.getTextField('photoIdType').setText(getFieldValue(formData.photoIdType));
            form.getTextField('photoIdNumber').setText(getFieldValue(formData.photoIdNumber));
            form.getTextField('issuingGovernment').setText(getFieldValue(formData.issuingGovernment));
            form.getTextField('idExpiryDate').setText(getFieldValue(formData.idExpiryDate));
            form.getTextField('schoolName').setText(getFieldValue(formData.schoolName));
            form.getTextField('datesOfEnrollment').setText(getFieldValue(formData.startDate + ' - ' + (formData.endDate || 'Present')));
            form.getTextField('studentId').setText(getFieldValue(formData.studentId));

            // Employment History (assuming a single entry for demonstration)
            if (formData.employmentHistory && formData.employmentHistory.length > 0) {
                const employment = formData.employmentHistory[0]; // First employment entry
                form.getTextField('emplyoment_1-title').setText(getFieldValue(employment.title));
                form.getTextField('emplyoment_1-employer').setText(getFieldValue(employment.employer));
                form.getTextField('emplyoment_1-dates').setText(getFieldValue(employment.startDate + ' - ' + employment.endDate));
                form.getTextField('emplyoment_1-employer_name').setText(getFieldValue(employment.nameOfSupervisor));
                form.getTextField('emplyoment_1-employer_phone').setText(getFieldValue(employment.supervisorPhoneNumber));
                form.getTextField('emplyoment_1-city').setText(getFieldValue(employment.cityOfEmployment));
            }

            // Monthly Income and Financial Aid
            form.getTextField('monthlyIncome').setText(getFieldValue(formData.monthlyIncome));
            // Assuming 'monthlyIncome2' contains additional sources of income
            formData.monthlyIncome2.forEach((income, index) => {
                if (index === 0) { // Only filling out the first entry for demonstration
                    form.getTextField('financialAidAmount').setText(getFieldValue(income.amount));
                }
            });

            // Rental History (assuming two entries for demonstration)
            formData.rentalHistory.forEach((rental, index) => {
                const addressComponents = splitAddress(rental.address);
                if (index === 0) { // First rental entry
                    form.getTextField('rentalHistory1-street').setText(getFieldValue(addressComponents.street));
                    form.getTextField('rentalHistory1-city').setText(getFieldValue(addressComponents.city));
                    form.getTextField('rentalHistory1-state').setText(getFieldValue(addressComponents.state));
                    form.getTextField('rentalHistory1-monthlyRent').setText(getFieldValue(rental.monthlyRent));
                    form.getTextField('rentalHistory1-ownerName').setText(getFieldValue(rental.ownerName));
                    form.getTextField('rentalHistory1-ownerPhoneNumber').setText(getFieldValue(rental.ownerPhoneNumber));
                    form.getTextField('rentalHistory1-dates').setText(getFieldValue(rental.startDate + ' - ' + rental.endDate));
                    form.getTextField('rentalHistory1-reasonForLeaving').setText(getFieldValue(rental.reasonForLeaving));
                } else if (index === 1) { // Second rental entry
                    form.getTextField('rentalHistory2-street').setText(getFieldValue(addressComponents.street));
                    form.getTextField('rentalHistory2-city').setText(getFieldValue(addressComponents.city));
                    form.getTextField('rentalHistory2-state').setText(getFieldValue(addressComponents.state));
                    form.getTextField('rentalHistory2-monthlyRent').setText(getFieldValue(rental.monthlyRent));
                    form.getTextField('rentalHistory2-ownerName').setText(getFieldValue(rental.ownerName));
                    form.getTextField('rentalHistory2-ownerPhoneNumber').setText(getFieldValue(rental.ownerPhoneNumber));
                    form.getTextField('rentalHistory2-dates').setText(getFieldValue(rental.startDate + ' - ' + rental.endDate));
                    form.getTextField('rentalHistory2-reasonForLeaving').setText(getFieldValue(rental.reasonForLeaving));
                }
            });

            // References
            formData.references.forEach((reference, index) => {
                if (index === 0) { // First reference entry
                    form.getTextField('reference1-name').setText(getFieldValue(reference.name));
                    form.getTextField('reference1-relation').setText(getFieldValue(reference.relation));
                    form.getTextField('reference1-email').setText(getFieldValue(reference.email));
                    form.getTextField('reference1-phoneNumber').setText(getFieldValue(reference.phoneNumber));
                } else if (index === 1) { // Second reference entry
                    form.getTextField('reference2-name').setText(getFieldValue(reference.name));
                    form.getTextField('reference2-relation').setText(getFieldValue(reference.relation));
                    form.getTextField('reference2-email').setText(getFieldValue(reference.email));
                    form.getTextField('reference2-phone').setText(getFieldValue(reference.phoneNumber));
                }
            });

            // Guarantor Information
            if (formData.guarantor) {
                form.getTextField('Guarantor-Name').setText(getFieldValue(formData.guarantor.guarantorName));
                form.getTextField('guarantor-name1').setText(getFieldValue(formData.guarantor.guarantorName));
                form.getTextField('guarantor-license').setText(getFieldValue(formData.guarantor.driversLicense));
                form.getTextField('guarantor-dateOfBirth').setText(getFieldValue(formData.guarantor.dateOfBirth));
                form.getTextField('guarantor-phoneNumber').setText(getFieldValue(formData.guarantor.guarantorPhone));
                form.getTextField('guarantor-address').setText(getFieldValue(formData.guarantor.homeAddress));
                form.getTextField('guarantor-relation').setText(getFieldValue(formData.guarantor.guarantorRelation));
                form.getTextField('guarantor-email').setText(getFieldValue(formData.guarantor.guarantorEmail));
            }



            // Define the custom color
            const customColor = rgb(0x42 / 255, 0x6a / 255, 0xa3 / 255);

            const regColor = rgb(0x00 / 255, 0x30 / 255, 0x75 / 255);

            // Embed the standard Helvetica and Helvetica-Bold fonts
            const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            // Add this inside your endpoint where you generate the PDF
            const page = pdfDoc.addPage();
            // Set font sizes and line height
            const fontSize = 11;
            const titleFontSize = 23;
            const nameFontSize = 19;
            const lineHeight = fontSize * 1.4; // Line height for better readability

            // Define the starting Y position from the top of the page
            let yPos = page.getHeight() - 50;

            // Embed a standard font (Times-like font)
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

            // Calculate text width for center alignment
            const textWidth = font.widthOfTextAtSize('Tenant Resume', titleFontSize);
            const pageWidth = page.getWidth();
            const textXPosition = (pageWidth / 2) - (textWidth / 2 + 10); // Center the text

            // Draw the resume title centered
            page.drawText('Tenant Resume', {
                x: textXPosition,
                y: yPos,
                size: titleFontSize,
                font: fontBold,
                color: customColor,
            });

            yPos -= lineHeight * 2; // Adjust space after title

            // Calculate text width for the full name for center alignment
            const fullName = `${formData.firstName} ${formData.lastName}`;
            const fullNameWidth = font.widthOfTextAtSize(fullName, titleFontSize);
            const fullNameXPosition = (pageWidth / 2) - (fullNameWidth / 2 - 5); // Center the text

            // Draw the full name centered
            page.drawText(fullName, {
                x: fullNameXPosition,
                y: yPos,
                size: nameFontSize,
                font: fontRegular,
                color: customColor,
            });

            yPos -= lineHeight / 2; // Adjust the space as needed

            // Drawing a line under the name
            const margin = 72; // One inch margin in points

            page.drawLine({
                start: { x: margin, y: yPos },
                end: { x: pageWidth - margin, y: yPos },
                color: customColor,
                thickness: 1.5,
            });

            // Adjust the yPos for the next text block
            yPos -= lineHeight;

            // Contact Information
            const contactInfo = `${formData.rentalHistory[0].address}, Phone: ${formData.phone}, Email: ${formData.email}`;
            const contactInfoWidth = font.widthOfTextAtSize(contactInfo, fontSize);
            const contactInfoXPosition = (page.getWidth() / 2) - (contactInfoWidth / 2 + 15);

            page.drawText(contactInfo, {
                x: contactInfoXPosition,
                y: yPos,
                size: fontSize,
                font: fontRegular,
                color: regColor,
            });
            yPos -= lineHeight * 2;

            // Objective
            page.drawText('Objective:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: fontBold,
                color: customColor,
            });
            yPos -= lineHeight;
            page.drawText(`To acquire an appropriate place for studying close to ${formData.schoolName}`, {
                x: 50,
                y: yPos,
                size: fontSize,
                font: fontRegular,
                color: regColor,
            });
            yPos -= lineHeight * 2;

            // Education
            page.drawText('Education:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: fontBold,
                color: customColor,
            });
            yPos -= lineHeight;
            const educationInfo = `${formData.schoolName}, Full-Time, Graduation Date: ${formData.endDate}, ${formData.major} Major`;
            page.drawText(educationInfo, {
                x: 50,
                y: yPos,
                size: fontSize,
                font: fontRegular,
                color: regColor,
            });
            yPos -= lineHeight * 2;

            // Activities
            page.drawText('Activities:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: fontBold,
                color: customColor,
            });
            formData.activitiesHistory.forEach(activity => {
                yPos -= lineHeight;
                const activityInfo = `${activity.title}, ${activity.organization}, ${activity.startDate} - ${activity.endDate}`;
                page.drawText(activityInfo, {
                    x: 50,
                    y: yPos,
                    size: fontSize,
                    font: fontRegular,
                    color: regColor,
                });
            });
            yPos -= lineHeight * 2; // Space before the next section

            // Employment
            page.drawText('Employment:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: fontBold,
                color: customColor,
            });
            formData.employmentHistory.forEach(employment => {
                yPos -= lineHeight;
                const employmentInfo = `${employment.title}, ${employment.employer}, ${employment.startDate} - ${employment.endDate}`;
                page.drawText(employmentInfo, {
                    x: 50,
                    y: yPos,
                    size: fontSize,
                    font: fontRegular,
                    color: regColor,
                });
            });
            yPos -= lineHeight * 2;

            // Previous Rental Experience
            const rentalInfo = `${formData.rentalHistory[0].address}, ${formData.college.name}, ${formData.startDate} - ${formData.endDate}`;
            page.drawText('Previous Rental Experience:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: fontBold,
                color: customColor,
            });
            yPos -= lineHeight;
            page.drawText(rentalInfo, {
                x: 50,
                y: yPos,
                size: fontSize,
                font: fontRegular,
                color: regColor,
            });
            yPos -= lineHeight * 2;

            // Monthly Income
            page.drawText('Monthly Income:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: fontBold,
                color: customColor,
            });
            formData.monthlyIncome2.forEach(income => {
                yPos -= lineHeight;
                page.drawText(`${income.source}: ${income.amount}`, {
                    x: 50,
                    y: yPos,
                    size: fontSize,
                    font: fontRegular,
                    color: regColor,
                });
            });
            yPos -= lineHeight * 2;

            // Bank Accounts
            page.drawText('Bank Accounts:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: fontBold,
                color: customColor,
            });
            formData.bankAccounts.checkingAccounts.forEach(account => {
                yPos -= lineHeight;
                page.drawText(`Checking Account: ${account.name}`, {
                    x: 50,
                    y: yPos,
                    size: fontSize,
                    font: fontRegular,
                    color: regColor,
                });
            });
            formData.bankAccounts.savingsAccounts.forEach(account => {
                yPos -= lineHeight;
                page.drawText(`Savings Account: ${account.name}`, {
                    x: 50,
                    y: yPos,
                    size: fontSize,
                    font: fontRegular,
                    color: regColor,
                });
            });
            yPos -= lineHeight * 2;

            // Credit Cards
            page.drawText('Credit Cards:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: fontBold,
                color: customColor,
            });
            formData.creditCards.forEach(card => {
                yPos -= lineHeight;
                page.drawText(`Credit Card: ${card.name}`, {
                    x: 50,
                    y: yPos,
                    size: fontSize,
                    font: fontRegular,
                    color: regColor,
                });
            });
            yPos -= lineHeight * 2;

            // References
            page.drawText('References:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: fontBold,
                color: customColor,
            });
            formData.references.forEach(reference => {
                yPos -= lineHeight;
                const referenceInfo = `Name: ${reference.name}, Phone: ${reference.phoneNumber}, Email: ${reference.email}, Relation: ${reference.relation}`;
                page.drawText(referenceInfo, {
                    x: 50,
                    y: yPos,
                    size: fontSize,
                    font: fontRegular,
                    color: regColor,
                });
            });
            yPos -= lineHeight * 2;

            // Add the Government-Issued Photo ID and Letter of Reference to the end of the document
            const appendDocumentToPdf = async (pdfDoc, userId, fileName, storageFolderPath) => {
                const filePath = `${storageFolderPath}/${userId}/${fileName}`;
                const fileExists = await bucket.file(filePath).exists();

                if (fileExists[0]) {
                    const fileBlob = await bucket.file(filePath).download();
                    const fileBytes = fileBlob[0];

                    // Load the document as a PDFDocument
                    const documentPdf = await PDFDocument.load(fileBytes);

                    // Copy the pages from the document PDF to the end of the original document
                    const copiedPages = await pdfDoc.copyPages(documentPdf, documentPdf.getPageIndices());
                    copiedPages.forEach((page) => pdfDoc.addPage(page));
                } else {
                    console.log(`File ${fileName} does not exist, skipping.`);
                }
            };


            // Append Letter of Reference
            const letterRefFileName = `${formData.firstName} ${formData.lastName}-Letter_of_Reference.pdf`; // Update with your actual file naming convention
            await appendDocumentToPdf(pdfDoc, userId, letterRefFileName, 'userLettersOfReference');

            // Inside the try block of the /generate-pdf/:userId route after creating the pdfDoc
            // Append Government-Issued Photo ID
            const photoIdFileName = `${formData.firstName} ${formData.lastName}-Photo_ID.pdf`; // Update with your actual file naming convention
            await appendDocumentToPdf(pdfDoc, userId, photoIdFileName, 'userGovernmentIds');

            // Add the rental workshop certificate to the end of the document
            const certificateFileName = `${formData.firstName} ${formData.lastName}-Rental_Certificate.pdf`;
            await appendDocumentToPdf(pdfDoc, userId, certificateFileName, 'userCertificates');


            // Continue adding other details from formData
            // You can adjust the y value to move down for each new line
            // Example: Address, Phone, Email, Education, Employment History, etc.

            // Flatten the form to prevent editing after filling
            const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

            // Construct the folder path with user's first and last name
            const userFolderPath = `Rental Applications/${formData.firstName} ${formData.lastName}`;
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
                    await db.collection('FilledPDFs').doc(userId).set({ [outputFilename]: url }, { merge: true });

                    resolve(url);
                });

                stream.end(pdfBytes);
            });
        }

        // Then, use this function as before to generate and upload both versions of the PDF
        await createAndUploadPDF('./rentora-application.pdf', `${userId}_filled.pdf`, userId, formData);
        await createAndUploadPDF('./rentora-application.pdf', `${userId}_official_filled.pdf`, userId, formData);

        res.status(200).json({ success: 'PDF generated and saved' });
    } catch (error) {
        console.error('Error generating and saving PDF:', error);
        res.status(500).json({ error: 'Error generating and saving PDF' });
    }
}
