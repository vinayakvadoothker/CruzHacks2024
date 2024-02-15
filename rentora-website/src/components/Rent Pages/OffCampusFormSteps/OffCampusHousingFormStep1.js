import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from "../../config";
import { useUser } from "@clerk/clerk-react";
import Stepper from './Stepper';
import './styles.css';

const OffCampusHousingFormStep1 = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        schoolName: '',
        addToRoommateSearch: true,  // Initialize as true
    });

    useEffect(() => {
        if (user) {
            db.collection('SurveyResponses').doc(user.id).get()
                .then(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        setFormData({
                            schoolName: data.schoolName || '',
                            addToRoommateSearch: data.addToRoommateSearch !== undefined ? data.addToRoommateSearch : true,
                            dateSaved: data.dateSaved || ''
                        });
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [user]);


    const formatDate = (date) => {
        const d = new Date(date),
              month = '' + (d.getMonth() + 1),
              day = '' + d.getDate(),
              year = d.getFullYear();

        return [month.padStart(2, '0'), day.padStart(2, '0'), year].join('/');
    };

    const saveAnswer = (event) => {
        event.preventDefault();
    
        const newFormData = {
            ...formData,
            schoolName: event.target['school-name'].value,
            dateSaved: formatDate(new Date()), // Format the date as MM/DD/YYYY
        };
    
        if (user) {
            // Update or set the document in Firestore
            db.collection('SurveyResponses').doc(user.id).set(newFormData, { merge: true })
                .then(() => {
                    console.log("Document successfully updated or set!");
                    navigate('/rent/off-campus/step2'); // Navigate only after successful update
                })
                .catch((error) => {
                    console.error("Error updating or setting document: ", error);
                });
        } else {
            console.log("User not authenticated");
        }
    };

    const handleCheckboxChange = (e) => {
        setFormData({ ...formData, addToRoommateSearch: e.target.checked });
    };

    const totalSteps = 23;
    return (
        <div className="form-container" style={{ width: '50%', margin: '60px auto', maxHeight: '80vh', overflowY: 'auto', overflowX: 'auto', padding: '20px' }}>
            <Stepper currentStep={0}/> {/* For Step 1, the currentStep is 0 */}
            <h2 className="step-title">Start By Getting Pre-Qualified (~20 Minutes)</h2>
            <p className="step-description">Select Your School</p>
            <form onSubmit={saveAnswer}>
                <select
                    id="school-name"
                    className="input-field"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                >
                    <option value="UC Santa Cruz">UC Santa Cruz</option>
                    {/* Add more options as needed */}
                </select>

                <div className="checkbox-container">
                    <label>
                        <input
                            type="checkbox"
                            checked={formData.addToRoommateSearch}
                            onChange={handleCheckboxChange}
                        />
                        Add me to the Roommate Search Database
                    </label>
                </div>

                <button className="next-button" type="submit">Start Here</button>
            </form>
        </div>
    );
};

export default OffCampusHousingFormStep1;
