import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from "../../config";
import { useUser } from "@clerk/clerk-react";

const SubleasingFormStep2 = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        schoolName: '',
        sublandlordName: '',
        subtenantName: '',
    });

    useEffect(() => {
        // Fetch user data if user exists
        if (user) {
            db.collection('SurveyResponses').doc(user.id).get()
                .then(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        setFormData({
                            schoolName: data.schoolName || '',
                            sublandlordName: data.sublandlordName || '',
                            subtenantName: data.subtenantName || '',
                        });
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [user]);

    const saveAnswer = (event) => {
        event.preventDefault(); // Prevent default form submission
        // Update form data
        const newFormData = {
            ...formData,
        };
        // Save form data to Firestore if user is authenticated
        if (user) {
            db.collection('SurveyResponses').doc(user.id).set(newFormData, { merge: true })
                .then(() => {
                    console.log("Document successfully updated or set!");
                    //navigate('/portals/subleasing/step2'); // Navigate to the next step
                })
                .catch((error) => {
                    console.error("Error updating or setting document: ", error);
                });
        } else {
            console.log("User not authenticated");
        }
    };

    const universities = [
        // List of universities...
    ];

    return (
        <div className="form-container">
            <h2 className="step-title">Step 1: Select Your School</h2>
            {/* Form Content */}
            <form onSubmit={saveAnswer}>
                <select
                    id="school-name"
                    className="input-field"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                >
                    <option value="">Select your school</option>
                    {universities.map((school, index) => (
                        <option key={index} value={school}>{school}</option>
                    ))}
                </select>
                <input
                    type="text"
                    id="sublandlord-name"
                    className="input-field"
                    placeholder="Sublandlord Name"
                    value={formData.sublandlordName}
                    onChange={(e) => setFormData({ ...formData, sublandlordName: e.target.value })}
                />
                <input
                    type="text"
                    id="subtenant-name"
                    className="input-field"
                    placeholder="Subtenant Name"
                    value={formData.subtenantName}
                    onChange={(e) => setFormData({ ...formData, subtenantName: e.target.value })}
                />
                <button className="next-button" type="submit">Start Here</button>
            </form>
        </div>
    );
};

export default SubleasingFormStep2;
