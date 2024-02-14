const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PDFDocument, PDFTextField, rgb, StandardFonts } = require('pdf-lib');

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
    const { userIds, address, names } = req.body;

    if (!userIds || userIds.length === 0 || !address || !names) {
        return res.status(400).json({ error: 'User IDs, names, and address are required.' });
    }

    try {
        const combinedPdfDoc = await PDFDocument.create();

        // Load a standard font
        const font = await combinedPdfDoc.embedFont(StandardFonts.TimesRoman);

        // Define title and address for the cover page
        const title = "Application For Renting at:";
        const fullAddress = `${address['Street']}, ${address['City']}, ${address['State']}`;
        const titleFontSize = 24;
        const addressFontSize = 18;

        // Create a title page with a light blue background
        const titlePage = combinedPdfDoc.addPage();
        titlePage.drawRectangle({
            x: 0,
            y: 0,
            width: titlePage.getWidth(),
            height: titlePage.getHeight(),
            color: rgb(0.68, 0.85, 0.9), // Light blue background
        });

        // Calculate the title width for centering
        const titleWidth = font.widthOfTextAtSize(title, titleFontSize);
        const addressWidth = font.widthOfTextAtSize(fullAddress, addressFontSize);

        // Draw the title and address on the title page
        titlePage.drawText(title, {
            x: (titlePage.getWidth() - titleWidth) / 2,
            y: titlePage.getHeight() - 150,
            size: titleFontSize,
            font: font,
            color: rgb(0, 0, 0),
        });

        titlePage.drawText(fullAddress, {
            x: (titlePage.getWidth() - addressWidth) / 2,
            y: titlePage.getHeight() - 190,
            size: addressFontSize,
            font: font,
            color: rgb(0, 0, 0),
        });

        // ... [previous code to draw the title and address] ...

        // Function to load and embed images
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

        // Load images and then add them to the PDF
        const images = await loadImages(userIds, names);

        // Calculate positions and draw images
        const pictureSize = 100;
        const startYPos = titlePage.getHeight() / 2 - pictureSize / 2;
        const imageXPosition = titlePage.getWidth() / 2 - pictureSize / 2;

        images.forEach((image, index) => {
            if (image) {
                // Adjust the y position for each image
                const yPos = startYPos - index * (pictureSize + 20);
                titlePage.drawImage(image, {
                    x: imageXPosition,
                    y: yPos,
                    width: pictureSize,
                    height: pictureSize,
                });
            }
        });

// Add a new page for the letter of request
const requestPage = combinedPdfDoc.addPage();
const letterTitle = "Letter of Request";

// Extracting address details
const street = address['Street'];
const state = address['State'];
const city = address['City'];

// Extracting roommate details
const namesString = names.map(name => name.firstName).join(', ');
const roommatesCount = names.length;

// Constructing the letter content
const letterContent = `
${letterTitle}
Dear Landlord/Property Manager,

I hope this email finds you well. My name is ${names[0].firstName} ${names[0].lastName}, 
and I am currently a student along with my ${roommatesCount-1} roommate(s). 
We are in search of a comfortable and secure place to reside for the academic year, 
and we came across your listing for the home located at ${street}, ${city}, ${state}.

We are highly interested in renting your property due to its convenient location, amenities, 
and the features you've mentioned in the listing. As diligent students, we are committed 
to maintaining a quiet and respectful living environment, which aligns well with our academic 
and personal responsibilities.

Our collective aim is to find a home that not only meets our basic needs but also provides 
a conducive environment for our studies. We are responsible young adults who understand 
the importance of keeping a property in good condition and adhering to the terms of a lease agreement.

We would greatly appreciate the opportunity to discuss this further and to view the property 
at your earliest convenience. We are prepared to provide references or any additional information 
you may require for your screening process.

Thank you very much for considering our application. We look forward to the possibility 
of renting from you and promise to be exemplary tenants.

Sincerely,

${namesString}
`;

const letterFontSize = 14; // Increased font size
const leading = 18;

// Drawing letter title
requestPage.drawText(letterContent, {
    x: 50,
    y: requestPage.getHeight() - 50,
    size: letterFontSize,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: leading,
    maxWidth: 500, // Limiting the width to create a block-like structure
});



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
            'State',
            'City',
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
                        field.setText(address[fieldName] || '');
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
        // Extract the address to name the folder and file
        const formattedAddress = `${address['Street'].replace(/\s+/g, '_')}_${address['City'].replace(/\s+/g, '_')}_${address['State'].replace(/\s+/g, '_')}_USA`;
        const combinedPdfFileName = `combined_application-${userIds.join('-')}-${formattedAddress}.pdf`;
        const combinedPdfPath = `Combined_Applications/${formattedAddress}/${combinedPdfFileName}`;

        const combinedPdfBytes = await combinedPdfDoc.save({ useObjectStreams: false });
        const combinedPdfBuffer = Buffer.from(combinedPdfBytes.buffer); // Convert Uint8Array to Buffer

        const combinedPdfFile = bucket.file(combinedPdfPath);
        await combinedPdfFile.save(combinedPdfBuffer, {
            metadata: { contentType: 'application/pdf' },
        });

        const [url] = await combinedPdfFile.getSignedUrl({
            action: 'read',
            expires: '03-01-2500',
        });

        console.log('Combined PDF generated and saved');

        // Update each roommate's Firestore document with the combined PDF URL
        userIds.forEach(async (userId) => {
            const userRef = db.collection('SurveyResponses').doc(userId);
            const addressRef = userRef.collection('offcampusapplications').doc(formattedAddress);
            await addressRef.set({
                combinedPdfUrl: url,
            }, { merge: true });
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