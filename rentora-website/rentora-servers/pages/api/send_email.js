// pages/api/send_email.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://www.rentora.net'); // Adjust as needed for your domain
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Adjust to match the methods your API is supporting
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    // Stop the middleware chain and end the request
    return res.status(200).end();
  }

  // Only allow POST requests for the main functionality
  if (req.method === 'POST') {
    const { to, subject, html } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: 'rentora.ai@gmail.com',
      to,
      subject,
      html,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
      res.status(200).send('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    // Handle any other HTTP methods not supported
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
