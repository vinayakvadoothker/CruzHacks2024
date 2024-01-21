const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const app = express();
const port = 3010; // You can change the port number as needed

// Replace with your Firebase service account key path and Firebase project URL
const serviceAccount = require('./rentora1.json'); // Update with the actual path
const databaseURL = "https://your-firebase-project.firebaseio.com"; // Update with your Firebase project URL

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

        if (docSnapshot.exists) {
            const formData = docSnapshot.data();

            // Replace with the actual path to your PDF form
            const pdfPath = './rentora_watermark.pdf';

            const pdfBuffer = await fs.promises.readFile(pdfPath);
            const pdfDoc = await PDFDocument.load(pdfBuffer);
            const form = pdfDoc.getForm();

            // Fill in the form fields with data from formData
            form.getTextField("Applicant's First Name").setText(formData.firstName);
            form.getTextField("Applicant's Last Name").setText(formData.lastName);
            form.getTextField('Middle initial').setText(formData.middleName);
            form.getTextField('Date of birth').setText(formData.dateOfBirth);
            form.getTextField('Email Address').setText(formData.email);
            form.getTextField('Contact number').setText(formData.phone);
            form.getTextField('ID number').setText(formData.studentId);
            form.getTextField('Issuing Govt').setText(formData.issuingGovernment);
            form.getTextField('Expires').setText(formData.idExpiryDate);
            form.getTextField('3 If applicable Current or Previous Campus Address').setText(formData.college.address);
            form.getTextField('FromTo_3').setText(`${formData.startDate} - Present`);
            form.getTextField('Rent Amount_3').setText(formData.rentalHistory[0].monthlyRent);
            form.getTextField('HousingResidentialLife Office Phone').setText(formData.college.phoneNumber);
            form.getTextField('Student ID').setText(formData.studentId);
            form.getTextField('10 Personal Reference').setText(formData.references[1].name);
            form.getTextField('Phone Number').setText(formData.references[1].phoneNumber);
            form.getTextField('11 In case of emergency please contact').setText(formData.references[0].name);
            form.getTextField('Phone_3').setText(formData.references[0].phoneNumber);
            form.getTextField('Relation').setText(formData.references[0].relation);
            form.getTextField('Email').setText(formData.references[0].email);
            form.getTextField('12 Vehicles MakeYearLicense  1').setText(`${formData.vehicleInfo[0].make} / ${formData.vehicleInfo[0].year} / ${formData.vehicleInfo[0].licenseNumber}`);


            formData.monthlyIncome2.forEach((income) => {
                if (income.source === "Employment") {
                    form.getTextField('8 Current Gross Income').setText(income.amount);
                    form.getTextField('Per').setText(`Month`);
                    form.getTextField('Savings').setText(`N/A`);
                } else if (income.source === "Scholarship") {
                    form.getTextField('9 Financial Aid Award').setText(income.amount);
                    form.getTextField('Per_2').setText(`Month`);

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
                form.getTextField('6 Present Occupation').setText(presentEmployment.title);
                form.getTextField('Employer').setText(presentEmployment.employer);
                form.getTextField('FromTo_4').setText(`${presentEmployment.startDate} - ${presentEmployment.endDate}`);
                form.getTextField('Name of Supervisor').setText(presentEmployment.nameOfSupervisor);
                form.getTextField('Phone').setText(presentEmployment.supervisorPhoneNumber);
                form.getTextField('City_3').setText(presentEmployment.cityOfEmployment);
            }

            // Fill in the form fields for the first previous occupation after present
            if (previousEmployment) {
                form.getTextField('7 Previous Occupation').setText(previousEmployment.title);
                form.getTextField('Employer_2').setText(previousEmployment.employer);
                form.getTextField('FromTo_5').setText(`${previousEmployment.startDate} - ${previousEmployment.endDate}`);
                form.getTextField('Name of Supervisor_2').setText(previousEmployment.nameOfSupervisor);
                form.getTextField('Phone_2').setText(previousEmployment.supervisorPhoneNumber);
                form.getTextField('City_4').setText(previousEmployment.cityOfEmployment);
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
                        phoneRequired: formData.phoneRequired,
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
                        phoneRequired: formData.phoneRequired,
                        rentAmount: rental.monthlyRent,
                        fromTo: `${rental.startDate} - ${rental.endDate}`,
                        reasonForLeaving: rental.reasonForLeaving,
                    });
                }
            });

            // Fill in the form fields for present address
            form.getTextField('1 Present Address').setText(presentAddresses[0].address);
            form.getTextField('City').setText(presentAddresses[0].city);
            form.getTextField('State').setText(presentAddresses[0].state);
            form.getTextField('Zip Code').setText(presentAddresses[0].zipCode);
            form.getTextField('OwnerManager').setText(presentAddresses[0].ownerManager);
            form.getTextField('Phone Required').setText(presentAddresses[0].ownerPhoneNumber);
            form.getTextField('Rent Amount').setText(presentAddresses[0].rentAmount);
            form.getTextField('FromTo').setText(presentAddresses[0].fromTo);
            form.getTextField('Reason for Leaving').setText(presentAddresses[0].reasonForLeaving);

            // Fill in the form fields for previous address
            form.getTextField('2 Previous Address').setText(previousAddresses[0].address);
            form.getTextField('City_2').setText(previousAddresses[0].city);
            form.getTextField('State_2').setText(previousAddresses[0].state);
            form.getTextField('Zip Code_2').setText(previousAddresses[0].zipCode);
            form.getTextField('OwnerManager_2').setText(previousAddresses[0].ownerManager);
            form.getTextField('Phone Required_2').setText(previousAddresses[0].ownerPhoneNumber);
            form.getTextField('Rent Amount_2').setText(previousAddresses[0].rentAmount);
            form.getTextField('FromTo_2').setText(previousAddresses[0].fromTo);
            form.getTextField('Reason for Leaving_2').setText(previousAddresses[0].reasonForLeaving);

            // ... Continue for other fields as necessary ...

            // // Employment History - Assuming your form has fields for each employment history entry
            // formData.employmentHistory.forEach((employment, index) => {
            //   form.getTextField(`Employer ${index + 1}`).setText(employment.employer);
            //   form.getTextField(`Job Title ${index + 1}`).setText(employment.title);
            //   form.getTextField(`City of Employment ${index + 1}`).setText(employment.cityOfEmployment);
            //   // ... additional fields for each employment history entry ...
            // });

            // // Rental History - Similar approach as employment history
            // formData.rentalHistory.forEach((rental, index) => {
            //   form.getTextField(`Address ${index + 1}`).setText(rental.address);
            //   form.getTextField(`Monthly Rent ${index + 1}`).setText(rental.monthlyRent);
            //   // ... additional fields for each rental history entry ...
            // });

            // Flatten the form to prevent editing after filling

            form.flatten();

            // Generate a response with the filled PDF as bytes
            const modifiedPdfBytes = await pdfDoc.save();

            // Create a unique filename for the PDF
            const filename = `${userId}_filled.pdf`;

            // Upload the PDF to Firebase Storage
            const file = bucket.file(filename);
            const stream = file.createWriteStream({
                metadata: {
                    contentType: 'application/pdf',
                },
            });

            stream.on('error', (error) => {
                console.error('Error uploading PDF to Firebase Storage:', error);
                res.status(500).json({ error: 'Error uploading PDF to Storage' });
            });

            stream.on('finish', async () => {
                // Get the URL of the uploaded PDF
                const [url] = await file.getSignedUrl({
                    action: 'read',
                    expires: '03-01-2500', // Set an expiration date as needed
                });

                // Save the PDF URL in Firestore for the user
                await db.collection('FilledPDFs').doc(userId).set({
                    pdfUrl: url,
                });

                res.status(200).json({ success: 'PDF generated and saved' });
            });

            stream.end(modifiedPdfBytes);
        } else {
            console.log(`No data found for user ID: ${userId}`);
            res.status(404).json({ error: 'User data not found' });
        }
    } catch (error) {
        console.error('Error generating and saving PDF:', error);
        res.status(500).json({ error: 'Error generating and saving PDF' });
    }
});

app.listen(port, () => {
    console.log(`PDF filler server is running on port ${port}`);
});