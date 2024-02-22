// utils/firebaseAdmin.js

const admin = require('firebase-admin');
const serviceAccount = require('./rentora-dbfa3-firebase-adminsdk-4rpix-4bb6bae0fe.json'); // Update the path to your Firebase service account key

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

module.exports = { admin, db };
