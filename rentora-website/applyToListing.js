const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PDFDocument, StandardFonts, PDFTextField, rgb } = require('pdf-lib');
const fs = require('fs');
const QRCode = require('qrcode');

// Initialize Firebase Admin SDK with your credentials and settings
const serviceAccount = require('./rentora1.json');
const databaseURL = "https://rentora-dbfa3.firebaseio.com";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL,
    storageBucket: 'gs://rentora-dbfa3.appspot.com',
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();
const port = 3200;

app.use(cors());
app.use(bodyParser.json());

app.post('/combine-roommate-applications', async (req, res) => {

    const { userIds, address, names } = req.body; // Extract 'names' from the request body

    if (!userIds || userIds.length === 0 || !address) {
        return res.status(400).json({ error: 'User IDs and address are required.' });
    }

    try {
        const combinedPdfDoc = await PDFDocument.create();



        // Function to generate a QR code image; returns a Promise that resolves to the image bytes
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




        const loadImages = async (userIds, names) => {
            const images = [];

            for (let i = 0; i < userIds.length; i++) {
                const userId = userIds[i];
                const firstName = names[i].firstName;
                const lastName = names[i].lastName;

                const imageFileName = `${firstName}_${lastName}_Profile_Picture.jpg`;
                const imagePath = `userProfilePictures/${userId}/${imageFileName}`;
                console.log(`Attempting to access image: ${imageFileName}`);
                console.log(`Full path: ${imagePath}`);

                const imageFile = bucket.file(imagePath);

                try {
                    const [imageExists] = await imageFile.exists();
                    if (imageExists) {
                        console.log(`Image found: ${imageFileName}`);
                        const [imageBuffer] = await imageFile.download();

                        // Check if the buffer has the JPEG SOI marker
                        if (imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8) {
                            console.log(`Embedding JPEG image: ${imageFileName}`);
                            images.push(await combinedPdfDoc.embedJpg(imageBuffer));
                        } else if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) {
                            console.log(`Embedding PNG image: ${imageFileName}`);
                            images.push(await combinedPdfDoc.embedPng(imageBuffer));
                        } else {
                            throw new Error('Unsupported image format.');
                        }
                    } else {
                        console.log(`Image not found in Firebase Storage: ${imageFileName}`);
                        images.push(null);
                    }
                } catch (error) {
                    console.error(`Error downloading image ${imageFileName}:`, error);
                    images.push(null);
                }
            }

            return images;
        };



        // Load the cover page PDF and fill in the form fields
        let coverPageBytes = fs.readFileSync('./rentora-cover.pdf');
        let coverPdfDoc = await PDFDocument.load(coverPageBytes);
        const coverForm = coverPdfDoc.getForm();

        const images = await loadImages(userIds, names);

        // Fetch primary user's data for 'Name' field
        const primaryUserData = await db.collection('SurveyResponses').doc(userIds[0]).get();
        const primaryUserName = `${primaryUserData.data().firstName} ${primaryUserData.data().lastName}`;
        coverForm.getTextField('Name').setText(primaryUserName);

        // Set 'address' and 'address1' fields
        const fullAddress = `${address['Street']}, ${address['City']}, ${address['State']}`;
        coverForm.getTextField('address').setText(fullAddress);
        coverForm.getTextField('address1').setText(fullAddress); // 'address1' is the same as 'address'

        // Set '#ofRoommates' field
        coverForm.getTextField('#ofRoommates').setText(String(userIds.length - 1));

        // Set 'NamesOfRoommates'
        const namesOfRoommates = names.map(name => `${name.firstName} ${name.lastName}`).join('\n');

        console.log('NamesOfRoommates:', namesOfRoommates); // Log the value being sent for NamesOfRoommates

        coverForm.getTextField('NamesOfRoommates').setText(namesOfRoommates);

        // Save the modified cover PDF and reload it to preserve the filled form fields
        coverPageBytes = await coverPdfDoc.save();
        coverPdfDoc = await PDFDocument.load(coverPageBytes);

        // Copy the cover pages to the combined PDF
        const coverPages = await combinedPdfDoc.copyPages(coverPdfDoc, coverPdfDoc.getPageIndices());

        let isFirstPage = true; // Flag to track the first page




        coverPages.forEach(async (page) => {
            combinedPdfDoc.addPage(page);
        
            // Check if it's the first page where we want to add the profile pictures
            if (isFirstPage) {
                // Get the width and height of the page to calculate positioning
                const { width, height } = page.getSize();
        
                let x = 250; // Initialize x with a value
                const y = 350; // Adjust this value as needed
        
                // Iterate over each image and place it next to the previous one
                for (const image of images) {
                    if (image) {
                        const profilePicDims = image.scale(0.1); // Scale the image, adjust as needed
        
                        // Draw the image on the page
                        page.drawImage(image, {
                            x: x,
                            y: y,
                            width: profilePicDims.width,
                            height: profilePicDims.height,
                        });
        
                        // Move the X position for the next image. Adjust spacing as needed
                        x += profilePicDims.width + 10; // Adjust the spacing between images
                    }
                }
        
                isFirstPage = false; // Ensure profile pictures are added only on the first page
            }
        });

        console.log('Number of pages in combinedPdfDoc:', combinedPdfDoc.getPageCount());

        // Generate QR code image for the URL
        const qrCodeDataURL = await generateQRCodeImage('https://www.rentora.net');

        // Extract the raw image data from the Data URL
        const qrImageBytes = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');

        // Embed the QR code image into the PDF
        const qrImage = await combinedPdfDoc.embedPng(qrImageBytes);

        // Get the first page of the document
        const page1 = combinedPdfDoc.getPages()[0];

        // Calculate position for the QR code (top-right corner)
        const pageWidth1 = page1.getSize().width;
        const pageHeight = page1.getSize().height;
        const qrSize = 65; // Set the size of the QR code
        const qrX = pageWidth1 - qrSize - 42; // 30 is the margin from the right edge
        const qrY = pageHeight - qrSize - 48; // 30 is the margin from the top edge

        // Draw the QR code image
        page1.drawImage(qrImage, {
            x: qrX,
            y: qrY,
            width: qrSize,
            height: qrSize
        });

        const fieldNames = [
            'Deposit',
            'rentalAddress',
            'RentAmount',
            'TodaysDate',
            'rental_address',
            'Pets',
            'proposedOccupants',
            'moveInDate',
        ];

        for (const userId of userIds) {
            const userData = await db.collection('SurveyResponses').doc(userId).get();
            if (!userData.exists) {
                console.log(`User data for ${userId} not found.`);
                continue; // Skip this user and continue with the next one
            }

            const userPdfPath = `Rental Applications/${userData.data().firstName} ${userData.data().lastName}/${userId}_official_filled.pdf`;
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

                    if (field instanceof PDFTextField) {
                        field.setText(address[fieldName] || '');
                    } else {
                        console.log(`Unhandled field type ${field.constructor.name} for field "${fieldName}"`);
                    }
                }

                const modifiedPdfBytes = await userPdfDoc.save({ useObjectStreams: false });

                const modifiedPdfDoc = await PDFDocument.load(modifiedPdfBytes);
                const modifiedPages = await combinedPdfDoc.copyPages(modifiedPdfDoc, modifiedPdfDoc.getPageIndices());
                modifiedPages.forEach((page) => combinedPdfDoc.addPage(page));
            } else {
                console.log(`PDF for user ${userId} not found.`);
            }
        }





        // Extract the address to name the folder and file
        const formattedAddress = `${address['Street'].replace(/\s+/g, '_')}_${address['City'].replace(/\s+/g, '_')}_${address['State'].replace(/\s+/g, '_')}_USA`;
        const combinedPdfFileName = `combined_application-${userIds.join('-')}-${formattedAddress}.pdf`;
        const combinedPdfPath = `Combined_Applications/${formattedAddress}/${combinedPdfFileName}`;

        // Save the combined PDF and get the URL
        const combinedPdfBytes = await combinedPdfDoc.save({ useObjectStreams: false });
        const combinedPdfBuffer = Buffer.from(combinedPdfBytes.buffer);
        const combinedPdfFile = bucket.file(combinedPdfPath);
        const [url] = await combinedPdfFile.getSignedUrl({ action: 'read', expires: '03-01-2500' });




        await combinedPdfFile.save(combinedPdfBuffer, { metadata: { contentType: 'application/pdf' } });





        console.log('Combined PDF generated and saved');

        // Update each roommate's Firestore document with the combined PDF URL
        userIds.forEach(async (userId) => {
            const userRef = db.collection('SurveyResponses').doc(userId);
            const addressRef = userRef.collection('offcampusapplications').doc(formattedAddress);
            await addressRef.set({ combinedPdfUrl: url }, { merge: true });
        });

        res.status(200).json({ success: 'Combined PDF generated and saved', url });
    } catch (error) {
        console.error('Error combining PDFs:', error);
        res.status(500).json({ error: 'Error combining PDFs' });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});