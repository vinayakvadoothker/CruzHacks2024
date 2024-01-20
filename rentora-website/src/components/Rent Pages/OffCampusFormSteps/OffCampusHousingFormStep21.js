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
        navigate('/rent/off-campus/step22');
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
                        <option value="Friend">Friend</option>
                        <option value="Mother">Mother</option>
                        <option value="Father">Father</option>
                        {/* ... other options ... */}
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
