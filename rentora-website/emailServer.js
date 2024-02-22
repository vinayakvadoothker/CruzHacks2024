// /api/send-email/index.js
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

// Define your /send-email endpoint
app.post('/api/send-email', async (req, res) => {
    const { to, subject, html } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Use environment variable for email user
            pass: process.env.EMAIL_PASS, // Use environment variable for email password
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM, // Use environment variable for the "from" email
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
});

module.exports = app;