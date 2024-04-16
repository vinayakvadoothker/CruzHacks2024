// pages/api/combine-roommate-applications.js
import admin from 'firebase-admin';
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import QRCode from 'qrcode';

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

async function generateQRCodeImage(url) {
  const qrCode = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 1,
    color: {
      dark: '#426aa3ff',  // Deep blue
      light: '#0000'      // Transparent background
    }
  });
  return qrCode;
}

async function loadImages(userIds, names, combinedPdfDoc) {
  const images = [];
  for (let i = 0; i < userIds.length; i++) {
    const userId = userIds[i];
    const firstName = names[i].firstName;
    const lastName = names[i].lastName;
    const imageFileName = `${firstName}_${lastName}_Profile_Picture.jpg`;
    const imagePath = `userProfilePictures/${userId}/${imageFileName}`;

    const imageFile = bucket.file(imagePath);
    try {
      const [imageExists] = await imageFile.exists();
      if (imageExists) {
        const [imageBuffer] = await imageFile.download();
        if (imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8) {
          images.push(await combinedPdfDoc.embedJpg(imageBuffer));
        } else if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) {
          images.push(await combinedPdfDoc.embedPng(imageBuffer));
        } else {
          console.error('Unsupported image format.');
          images.push(null);
        }
      } else {
        console.error('Image not found in Firebase Storage:', imageFileName);
        images.push(null);
      }
    } catch (error) {
      console.error('Error downloading image:', imageFileName, error);
      images.push(null);
    }
  }
  return images;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method not allowed' });
  }

  const { userIds, address, names } = req.body;
  if (!userIds || userIds.length === 0 || !address) {
    return res.status(400).send({ error: 'User IDs and address are required.' });
  }

  try {
    const combinedPdfDoc = await PDFDocument.create();
    const coverPageBytes = fs.readFileSync('./public/rentora-cover.pdf'); // Make sure the path is correct
    const coverPdfDoc = await PDFDocument.load(coverPageBytes);
    const coverForm = coverPdfDoc.getForm();

    const images = await loadImages(userIds, names, combinedPdfDoc);

    const primaryUserData = await db.collection('SurveyResponses').doc(userIds[0]).get();
    const primaryUserName = `${primaryUserData.data().firstName} ${primaryUserData.data().lastName}`;
    coverForm.getTextField('Name').setText(primaryUserName);

    const fullAddress = `${address.Street}, ${address.City}, ${address.State}`;
    coverForm.getTextField('address').setText(fullAddress);
    coverForm.getTextField('address1').setText(fullAddress);
    coverForm.getTextField('#ofRoommates').setText(String(userIds.length - 1));
    const namesOfRoommates = names.map(name => `${name.firstName} ${name.lastName}`).join('\n');
    coverForm.getTextField('NamesOfRoommates').setText(namesOfRoommates);

    const qrCodeDataURL = await generateQRCodeImage('https://www.rentora.net');
    const qrImageBytes = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
    const qrImage = await combinedPdfDoc.embedPng(qrImageBytes);

    const savedCoverBytes = await coverPdfDoc.save();
    const reloadedCoverPdf = await PDFDocument.load(savedCoverBytes);
    const [coverPage] = await combinedPdfDoc.copyPages(reloadedCoverPdf, [0]);
    combinedPdfDoc.addPage(coverPage);
    coverPage.drawImage(qrImage, {
      x: coverPage.getWidth() - 70,
      y: coverPage.getHeight() - 70,
      width: 50,
      height: 50
    });

    const combinedPdfBytes = await combinedPdfDoc.save();
    const combinedPdfBuffer = Buffer.from(combinedPdfBytes);
    const formattedAddress = `${address.Street}_${address.City}_${address.State}`.replace(/\s+/g, '_');
    const combinedPdfFileName = `combined_application-${userIds.join('-')}-${formattedAddress}.pdf`;
    const combinedPdfPath = `Combined_Applications/${formattedAddress}/${combinedPdfFileName}`;
    const combinedPdfFile = bucket.file(combinedPdfPath);

    await combinedPdfFile.save(combinedPdfBuffer, {
      metadata: {
        contentType: 'application/pdf'
      }
    });

    const [url] = await combinedPdfFile.getSignedUrl({
      action: 'read',
      expires: '03-01-2500'
    });

    res.status(200).send({ success: 'Combined PDF generated and saved', url });
  } catch (error) {
    console.error('Error combining PDFs:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
}
