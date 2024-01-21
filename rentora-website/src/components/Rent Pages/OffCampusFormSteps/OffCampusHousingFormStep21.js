import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { db } from "../../config";
import './styles.css';

const OffCampusHousingFormStep21 = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    const [guarantorName, setGuarantorName] = useState('');
    const [guarantorRelation, setGuarantorRelation] = useState('');
    const [guarantorPhone, setGuarantorPhone] = useState('');
    const [guarantorEmail, setGuarantorEmail] = useState('');

    const [isNameEditing, setIsNameEditing] = useState(false);
    const [isRelationEditing, setIsRelationEditing] = useState(false);
    const [isPhoneEditing, setIsPhoneEditing] = useState(false);
    const [isEmailEditing, setIsEmailEditing] = useState(false);

    const [loading, setLoading] = useState(true);

    const saveGuarantorInfo = async () => {
        if (user) {
            const formattedPhoneNumber = formatPhoneNumber(guarantorPhone);

            if (
                guarantorName.trim() !== '' &&
                guarantorRelation !== 'Select Relation' &&
                validatePhoneNumber(formattedPhoneNumber) &&
                validateEmail(guarantorEmail)
            ) {
                const guarantorData = {
                    guarantorName,
                    guarantorRelation,
                    guarantorPhone: formattedPhoneNumber,
                    guarantorEmail,
                };

                await db.collection('SurveyResponses').doc(user.id).update({
                    guarantor: guarantorData,
                });
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                try {
                    const doc = await db.collection('SurveyResponses').doc(user.id).get();

                    if (doc.exists) {
                        const guarantorData = doc.data().guarantor;

                        if (guarantorData) {
                            !isNameEditing && setGuarantorName(guarantorData.guarantorName || '');
                            !isRelationEditing && setGuarantorRelation(guarantorData.guarantorRelation || '');
                            !isPhoneEditing && setGuarantorPhone(formatPhoneNumber(guarantorData.guarantorPhone) || '');
                            !isEmailEditing && setGuarantorEmail(guarantorData.guarantorEmail || '');
                        }
                    }
                } catch (error) {
                    console.error('Error fetching guarantor data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [user, saveGuarantorInfo, isNameEditing, isRelationEditing, isPhoneEditing, isEmailEditing]);

    useEffect(() => {
        if (!loading) {
            saveGuarantorInfo();
        }
    }, [saveGuarantorInfo, loading]);

    const validatePhoneNumber = (phoneNumber) => {
        return /^\d{3}-\d{3}-\d{4}$/.test(phoneNumber);
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const formatPhoneNumber = (value) => {
        const cleanedValue = value.replace(/[^0-9]/g, '');
        const formattedValue = cleanedValue.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        return formattedValue;
    };

    const handleNext = () => {
        saveGuarantorInfo();
    
        if (user) {
            console.log('User:', user);
            if (user.id) {
                console.log('User ID:', user.id);
                sendEmailToGuarantor({
                    to: guarantorEmail,
                    subject: 'Guarantor Request',
                    html: `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Email Template</title>
                    </head>
                    <body>
                      <div style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); border-radius: 8px; background-color: #ffffff;">
                          <h1 style="color: #333;">Dear ${guarantorName},</h1>
                          <p style="color: #666;">${user.firstName} requests you to fill out the Guarantor Form for their Rental Application.</p>
                          <p style="color: #666;">Click the button below to access the form:</p>
                          <a href="localhost:3000/guarantor/${user.id}" style="display: inline-block; padding: 10px 20px; text-decoration: none; background-color: #3498db; color: #fff; border-radius: 5px;">Fill Out Form</a>
                          <p>Thank You,<br> Rentora</p>
                        </div>
                      </div>
                    </body>
                    </html>`,
                    
                    /*html: `
                    <p>Hey, ${guarantorName}, ${user.firstName} requests you to fill out the Guarantor Form for their Rental Application. Please fill it out: <a href="localhost:3000/guarantor/${user.id}">localhost:3000/guarantor/${user.id}</a></p>
                    <p>Thank You,<br> Rentora</p>
                  `,*/
                });
            } else {
                console.error('Error: user.id is undefined');
            }
        } else {
            console.error('Error: User is undefined');
        }
    
        // Navigate to the next step
        navigate('/rent/off-campus/step22');
    };
    
    

    const sendEmailToGuarantor = async (emailData) => {
        try {
            // Make a request to your server-side endpoint to send the email
            const response = await fetch('http://localhost:3001/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });

            if (response.ok) {
                console.log('Email sent successfully');
            } else {
                console.error('Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };

    return (
        <div className="form-container" style={{ width: '50%', margin: '60px auto', maxHeight: '80vh', overflowY: 'auto', padding: '20px' }}>
            <h2 className="step-title">Letter of Guarantor</h2>
            <p className="step-description">Please Add A Guarantor Who Will Fill Out the Guarantor Form</p>

            <div className="input-group">
                <div className="name-relation-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        value={guarantorName}
                        onChange={(e) => {
                            setGuarantorName(e.target.value);
                            setIsNameEditing(true);
                        }}
                        onBlur={() => setIsNameEditing(false)}
                    />

                    <label>Relation:</label>
                    <select
                        value={guarantorRelation}
                        onChange={(e) => {
                            setGuarantorRelation(e.target.value);
                            setIsRelationEditing(true);
                        }}
                        onBlur={() => setIsRelationEditing(false)}
                    >
                        <option value="Select Relation" disabled hidden>Select Relation</option>
                        <option value="Parent">Parent</option>
                        <option value="Legal Guardian">Legal Guardian</option>
                        <option value="Family Member">Family Member</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="input-group-phone-email">
                    <label>Phone Number:</label>
                    <input
                        type="tel"
                        value={formatPhoneNumber(guarantorPhone)}
                        onChange={(e) => {
                            const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
                            setGuarantorPhone(sanitizedValue);
                            setIsPhoneEditing(true);
                        }}
                        onBlur={() => setIsPhoneEditing(false)}
                        maxLength="12"
                    />

                    <label>Email:</label>
                    <input
                        type="email"
                        value={guarantorEmail}
                        onChange={(e) => {
                            setGuarantorEmail(e.target.value);
                            setIsEmailEditing(true);
                        }}
                        onBlur={() => setIsEmailEditing(false)}
                    />
                </div>
            </div>

            <Link to="/rent/off-campus/step20">
                <span className="back-button">{'<-'}</span>
            </Link>

            <button className="next-button" onClick={handleNext}>
                Next
            </button>
        </div>
    );
};

export default OffCampusHousingFormStep21;
