const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const app = express();
const port = 3010; // You can change the port number as needed

// Replace with your Firebase service account key path and Firebase project URL
const serviceAccount = require('./rentora1.json'); // Update with the actual path
const databaseURL = "https://rentora-dbfa3.firebaseio.com"; // Update with your Firebase project URL

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL,
    storageBucket: 'gs://rentora-dbfa3.appspot.com', // Replace with your Firebase Storage bucket URL

});

const storage = admin.storage();
const bucket = storage.bucket();
// Firestore database instance
const db = admin.firestore();

app.use(cors());
app.use(bodyParser.json());

// Define the route to fill the PDF form
app.get('/generate-pdf/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        // Retrieve user data from Firestore based on the user ID
        const docSnapshot = await db.collection('SurveyResponses').doc(userId).get();

        if (!docSnapshot.exists) {
            return res.status(404).json({ error: 'User data not found' });
        }

        const formData = docSnapshot.data();
        // Function to handle the creation and uploading of a PDF
        async function createAndUploadPDF(templatePath, outputFilename) {
            const pdfBuffer = await fs.promises.readFile(templatePath);
            const pdfDoc = await PDFDocument.load(pdfBuffer);
            const form = pdfDoc.getForm();

            // Fill in the form fields with data from formData
            form.getTextField("Applicant's First Name").setText(formData.firstName.toString());
            form.getTextField("Applicant's Last Name").setText(formData.lastName.toString());
            form.getTextField('Middle initial').setText(formData.middleInitial.toString());
            form.getTextField('Date of birth').setText(formData.dateOfBirth.toString());
            form.getTextField('Email Address').setText(formData.email.toString());
            form.getTextField('Contact number').setText(formData.phone.toString());
            form.getTextField('ID number').setText(formData.studentId.toString());
            form.getTextField('Issuing Govt').setText(formData.issuingGovernment.toString());
            form.getTextField('Expires').setText(formData.idExpiryDate.toString());
            form.getTextField('3 If applicable Current or Previous Campus Address').setText(formData.college.address.toString());
            form.getTextField('FromTo_3').setText(`${formData.startDate.toString()} - Present`);
            form.getTextField('Rent Amount_3').setText(formData.rentalHistory[0].monthlyRent.toString());
            form.getTextField('HousingResidentialLife Office Phone').setText(formData.college.phoneNumber.toString());
            form.getTextField('Student ID').setText(formData.studentId.toString());
            form.getTextField('10 Personal Reference').setText(formData.references[1].name.toString());
            form.getTextField('Phone Number').setText(formData.references[1].phoneNumber.toString());
            form.getTextField('11 In case of emergency please contact').setText(formData.references[0].name.toString());
            form.getTextField('Phone_3').setText(formData.references[0].phoneNumber.toString());
            form.getTextField('Relation').setText(formData.references[0].relation.toString());
            form.getTextField('Email').setText(formData.references[0].email.toString());
            form.getTextField('Photo ID Type').setText(formData.photoIdType.toString());
            form.getTextField('Name of Guarantor').setText(formData.guarantor.guarantorName.toString());
            form.getTextField('Name of Student').setText((formData.firstName + " " + formData.lastName).toString());
            form.getTextField('State Drivers Licenses').setText(formData.driversLicense.toString());
            form.getTextField('Date of Birth').setText(formData.dateOfBirth.toString());
            form.getTextField('Home Address Street').setText(formData.homeAddress.split(', ')[0].toString());
            form.getTextField('Home Address  City').setText(formData.homeAddress.split(', ')[1].toString());
            form.getTextField('Home Address  State').setText(formData.homeAddress.split(', ')[2].toString());
            form.getTextField('Home Phone').setText(formData.guarantor.guarantorPhone.toString());
            form.getTextField('Business Phone').setText('N/A');
            form.getTextField('Email').setText(formData.guarantor.guarantorEmail.toString());
            form.getTextField('Employer Name').setText(formData.guarantor.employerName.toString());
            form.getTextField('Monthly Income').setText(formData.guarantor.monthlyIncome.toString());
            form.getTextField('Business Address').setText(formData.guarantor.businessAddress.split(', ')[0].toString());
            form.getTextField('Business Address  State').setText(formData.guarantor.businessAddress.split(', ')[1].toString());
            form.getTextField('Business Address  City').setText(formData.guarantor.businessAddress.split(', ')[2].toString());
            form.getTextField('Supervisor').setText(formData.guarantor.supervisorName.toString());
            form.getTextField('Supervisor Phone').setText(formData.guarantor.supervisorPhone.toString());
            form.getTextField('Position').setText(formData.guarantor.jobTitle.toString());
            form.getTextField('Length of Employment').setText(formData.guarantor.employmentLength.toString());
            form.getTextField('Print Name').setText(formData.guarantor.guarantorName.toString());
            form.getTextField('Relationship').setText(formData.guarantor.guarantorRelation.toString());
            form.getTextField('Date_af_date').setText(formData.dateSaved.toString());

            if (formData.vehicleInfo && formData.vehicleInfo.length > 0) {
                const firstVehicle = formData.vehicleInfo[0];
                const vehicleDetails = `${firstVehicle.make} / ${firstVehicle.year} / ${firstVehicle.licenseNumber}`;
                form.getTextField('12 Vehicles MakeYearLicense  1').setText(vehicleDetails);
            }


            formData.monthlyIncome2.forEach((income) => {
                if (income.source === "Employment") {
                    form.getTextField('8 Current Gross Income').setText(income.amount.toString());
                    form.getTextField('Per').setText(`Month`.toString());
                    form.getTextField('Savings').setText(`N/A`.toString());
                } else if (income.source === "Scholarship") {
                    form.getTextField('9 Financial Aid Award').setText(income.amount.toString());
                    form.getTextField('Per_2').setText(`Month`.toString());

                }
            });

            // Sort employment history by endDate with present employment first
            const sortedEmploymentHistory = formData.employmentHistory.sort((a, b) => {
                if (a.present && !b.present) return -1;
                if (!a.present && b.present) return 1;
                return new Date(b.endDate) - new Date(a.endDate);
            });

            // Find the first previous employment entry after present employment
            const previousEmployment = sortedEmploymentHistory.find((employment) => !employment.present);

            // Fill in the form fields for present occupation
            if (sortedEmploymentHistory.length > 0 && sortedEmploymentHistory[0].present) {
                const presentEmployment = sortedEmploymentHistory[0];
                form.getTextField('6 Present Occupation').setText(presentEmployment.title.toString());
                form.getTextField('Employer').setText(presentEmployment.employer.toString());
                form.getTextField('FromTo_4').setText(`${presentEmployment.startDate.toString()} - ${presentEmployment.endDate.toString()}`);
                form.getTextField('Name of Supervisor').setText(presentEmployment.nameOfSupervisor.toString());
                form.getTextField('Phone').setText(presentEmployment.supervisorPhoneNumber.toString());
                form.getTextField('City_3').setText(presentEmployment.cityOfEmployment.toString());
            }

            // Fill in the form fields for the first previous occupation after present
            if (previousEmployment) {
                form.getTextField('7 Previous Occupation').setText(previousEmployment.title.toString());
                form.getTextField('Employer_2').setText(previousEmployment.employer.toString());
                form.getTextField('FromTo_5').setText(`${previousEmployment.startDate.toString()} - ${previousEmployment.endDate.toString()}`);
                form.getTextField('Name of Supervisor_2').setText(previousEmployment.nameOfSupervisor.toString());
                form.getTextField('Phone_2').setText(previousEmployment.supervisorPhoneNumber.toString());
                form.getTextField('City_4').setText(previousEmployment.cityOfEmployment.toString());
            }

            // Rental History
            // Order rental history by present first, then by end date

            // Separate rental history into present and previous addresses
            const presentAddresses = [];
            const previousAddresses = [];

            formData.rentalHistory.forEach((rental) => {
                const addressParts = rental.address.split(', ');
                if (rental.present) {
                    presentAddresses.push({
                        address: addressParts[0],
                        city: addressParts[1],
                        state: addressParts[2],
                        zipCode: formData.zipCode,
                        ownerManager: rental.ownerName,
                        phoneRequired: rental.ownerPhoneNumber,
                        rentAmount: rental.monthlyRent,
                        fromTo: `${rental.startDate} - ${rental.endDate}`,
                        reasonForLeaving: rental.reasonForLeaving,
                    });
                } else {
                    previousAddresses.push({
                        address: addressParts[0],
                        city: addressParts[1],
                        state: addressParts[2],
                        zipCode: formData.zipCode,
                        ownerManager: rental.ownerName,
                        phoneRequired: rental.ownerPhoneNumber,
                        rentAmount: rental.monthlyRent,
                        fromTo: `${rental.startDate} - ${rental.endDate}`,
                        reasonForLeaving: rental.reasonForLeaving,
                    });
                }
            });

            // Fill in the form fields for present address
            form.getTextField('1 Present Address').setText(presentAddresses[0].address.toString());
            form.getTextField('City').setText(presentAddresses[0].city.toString().toString());
            form.getTextField('State').setText(presentAddresses[0].state.toString().toString());
            form.getTextField('Zip Code').setText(presentAddresses[0].zipCode);
            form.getTextField('OwnerManager').setText(presentAddresses[0].ownerManager.toString());
            form.getTextField('Phone Required').setText(presentAddresses[0].phoneRequired.toString());
            form.getTextField('Rent Amount').setText(presentAddresses[0].rentAmount.toString());
            form.getTextField('FromTo').setText(presentAddresses[0].fromTo.toString());
            form.getTextField('Reason for Leaving').setText(presentAddresses[0].reasonForLeaving.toString());

            // Fill in the form fields for previous address
            form.getTextField('2 Previous Address').setText(previousAddresses[0].address.toString());
            form.getTextField('City_2').setText(previousAddresses[0].city.toString());
            form.getTextField('State_2').setText(previousAddresses[0].state.toString());
            form.getTextField('Zip Code_2').setText(previousAddresses[0].zipCode);
            form.getTextField('OwnerManager_2').setText(previousAddresses[0].ownerManager.toString());
            form.getTextField('Phone Required_2').setText(previousAddresses[0].phoneRequired.toString());
            form.getTextField('Rent Amount_2').setText(previousAddresses[0].rentAmount.toString());
            form.getTextField('FromTo_2').setText(previousAddresses[0].fromTo.toString());
            form.getTextField('Reason for Leaving_2').setText(previousAddresses[0].reasonForLeaving.toString());
            // ... Continue for other fields as necessary ...

            // // Employment History - Assuming your form has fields for each employment history entry
            // formData.employmentHistory.forEach((employment, index) => {
            //   form.getTextField(`Employer ${index + 1}`).setText(employment.employer.toString());
            //   form.getTextField(`Job Title ${index + 1}`).setText(employment.title.toString());
            //   form.getTextField(`City of Employment ${index + 1}`).setText(employment.cityOfEmployment.toString());
            //   // ... additional fields for each employment history entry ...
            // });

            // // Rental History - Similar approach as employment history
            // formData.rentalHistory.forEach((rental, index) => {
            //   form.getTextField(`Address ${index + 1}`).setText(rental.address.toString());
            //   form.getTextField(`Monthly Rent ${index + 1}`).setText(rental.monthlyRent.toString());
            //   // ... additional fields for each rental history entry ...
            // });

            // Flatten the form to prevent editing after filling

            // Add this inside your endpoint where you generate the PDF
            const page = pdfDoc.addPage();
            // Set font sizes and line height
            const fontSize = 11;
            const titleFontSize = 16;
            const lineHeight = fontSize * 1.4; // Line height for better readability

            // Define the starting Y position from the top of the page
            let yPos = page.getHeight() - 50;

            // Embed a standard font (Times-like font)
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

            // Calculate text width for center alignment
            const textWidth = font.widthOfTextAtSize('Tenant Resume', titleFontSize);
            const pageWidth = page.getWidth();
            const textXPosition = (pageWidth / 2) - (textWidth / 2); // Center the text

            // Draw the resume title centered
            page.drawText('Tenant Resume', {
                x: textXPosition,
                y: yPos,
                size: titleFontSize,
                font: font,
                color: rgb(0, 0, 0),
            });

            yPos -= lineHeight * 2; // Adjust space after title

            // Calculate text width for the full name for center alignment
            const fullName = `${formData.firstName} ${formData.lastName}`;
            const fullNameWidth = font.widthOfTextAtSize(fullName, titleFontSize);
            const fullNameXPosition = (pageWidth / 2) - (fullNameWidth / 2); // Center the text

            // Draw the full name centered
            page.drawText(fullName, {
                x: fullNameXPosition,
                y: yPos,
                size: titleFontSize,
                font: font,
            });

            yPos -= lineHeight / 2; // Adjust the space as needed

            // Drawing a line under the name
            const margin = 72; // One inch margin in points

            page.drawLine({
                start: { x: margin, y: yPos },
                end: { x: pageWidth - margin, y: yPos },
                color: rgb(0, 0, 0),
                thickness: 1.5,
            });

            // Adjust the yPos for the next text block
            yPos -= lineHeight;

            // Contact Information
            const contactInfo = `${formData.rentalHistory[0].address}, Phone: ${formData.phone}, Email: ${formData.email}`;
            const contactInfoWidth = font.widthOfTextAtSize(contactInfo, fontSize);
            const contactInfoXPosition = (page.getWidth() / 2) - (contactInfoWidth / 2);

            page.drawText(contactInfo, {
                x: contactInfoXPosition,
                y: yPos,
                size: fontSize,
                font: font,
            });
            yPos -= lineHeight * 2;

            // Objective
            page.drawText('Objective:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: font,
            });
            yPos -= lineHeight;
            page.drawText(`To acquire an appropriate place for studying close to ${formData.schoolName}`, {
                x: 50,
                y: yPos,
                size: fontSize,
                font: font,
            });
            yPos -= lineHeight * 2;

            // Education
            page.drawText('Education:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: font,
            });
            yPos -= lineHeight;
            const educationInfo = `${formData.schoolName}, Full-Time, Graduation Date: ${formData.endDate}, ${formData.major} Major`;
            page.drawText(educationInfo, {
                x: 50,
                y: yPos,
                size: fontSize,
                font: font,
            });
            yPos -= lineHeight * 2;

            // Activities
            page.drawText('Activities:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: font,
            });
            formData.activitiesHistory.forEach(activity => {
                yPos -= lineHeight;
                const activityInfo = `${activity.title}, ${activity.organization}, ${activity.startDate} - ${activity.endDate}`;
                page.drawText(activityInfo, {
                    x: 50,
                    y: yPos,
                    size: fontSize,
                    font: font,
                });
            });
            yPos -= lineHeight * 2; // Space before the next section

            // Employment
            page.drawText('Employment:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: font,
            });
            formData.employmentHistory.forEach(employment => {
                yPos -= lineHeight;
                const employmentInfo = `${employment.title}, ${employment.employer}, ${employment.startDate} - ${employment.endDate}`;
                page.drawText(employmentInfo, {
                    x: 50,
                    y: yPos,
                    size: fontSize,
                    font: font,
                });
            });
            yPos -= lineHeight * 2;

            // Previous Rental Experience
            const rentalInfo = `${formData.rentalHistory[0].address}, ${formData.college.name}, ${formData.startDate} - ${formData.endDate}`;
            page.drawText('Previous Rental Experience:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: font,
            });
            yPos -= lineHeight;
            page.drawText(rentalInfo, {
                x: 50,
                y: yPos,
                size: fontSize,
                font: font,
            });
            yPos -= lineHeight * 2;

            // Monthly Income
            page.drawText('Monthly Income:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: font,
            });
            formData.monthlyIncome2.forEach(income => {
                yPos -= lineHeight;
                page.drawText(`${income.source}: ${income.amount}`, {
                    x: 50,
                    y: yPos,
                    size: fontSize,
                    font: font,
                });
            });
            yPos -= lineHeight * 2;

            // Bank Accounts
            page.drawText('Bank Accounts:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: font,
            });
            formData.bankAccounts.checkingAccounts.forEach(account => {
                yPos -= lineHeight;
                page.drawText(`Checking Account: ${account.name}`, {
                    x: 50,
                    y: yPos,
                    size: fontSize,
                    font: font,
                });
            });
            formData.bankAccounts.savingsAccounts.forEach(account => {
                yPos -= lineHeight;
                page.drawText(`Savings Account: ${account.name}`, {
                    x: 50,
                    y: yPos,
                    size: fontSize,
                    font: font,
                });
            });
            yPos -= lineHeight * 2;

            // Credit Cards
            page.drawText('Credit Cards:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: font,
            });
            formData.creditCards.forEach(card => {
                yPos -= lineHeight;
                page.drawText(`Credit Card: ${card.name}`, {
                    x: 50,
                    y: yPos,
                    size: fontSize,
                    font: font,
                });
            });
            yPos -= lineHeight * 2;

            // References
            page.drawText('References:', {
                x: 50,
                y: yPos,
                size: fontSize,
                font: font,
            });
            formData.references.forEach(reference => {
                yPos -= lineHeight;
                const referenceInfo = `Name: ${reference.name}, Phone: ${reference.phoneNumber}, Email: ${reference.email}, Relation: ${reference.relation}`;
                page.drawText(referenceInfo, {
                    x: 50,
                    y: yPos,
                    size: fontSize,
                    font: font,
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
        await createAndUploadPDF('./rentora_watermark.pdf', `${userId}_filled.pdf`, userId, formData);
        await createAndUploadPDF('./rentora_nowatermark.pdf', `${userId}_official_filled.pdf`, userId, formData);

        res.status(200).json({ success: 'PDFs generated and saved' });
    } catch (error) {
        console.error('Error generating and saving PDFs:', error);
        res.status(500).json({ error: 'Error generating and saving PDFs' });
    }
});

app.listen(port, () => {
    console.log(`PDF filler server is running on port ${port}`);
});