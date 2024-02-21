import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from "../../config";
import { useUser } from "@clerk/clerk-react";
import Stepper from './Stepper';
import './styles.css'; // Import the CSS file

import { useSteps } from './StepContext';
import ProgressBar from './ProgressBar';


const OffCampusHousingFormStep6 = () => {
  const { user } = useUser();
  const navigate = useNavigate();


  const { steps, completeStep } = useSteps(); // Use the useSteps hook
  const currentStep = 5; // Step index starts from 0, so step 3 is index 2
  const onStepChange = (stepIndex) => {
    navigate(`/rent/off-campus/step${stepIndex + 1}`);
  };

  const [formData, setFormData] = useState({
    addToRoommateSearch: true,
    lookingForRoommates: true,
    lifestyle: '',
    studyHabits: '',
    socializingFrequency: '',
    choresPreference: '',
    privacyComfort: '',
    communicationComfort: '',
    expenseHandling: '',
    scheduleCoordination: '',
    goalsSupport: '',
    overnightGuests: '' // New field for overnight guests preference
});

useEffect(() => {
    if (user) {
        db.collection('SurveyResponses').doc(user.id).get()
            .then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    setFormData({
                        addToRoommateSearch: data.addToRoommateSearch !== undefined ? data.addToRoommateSearch : true,
                        lookingForRoommates: data.lookingForRoommates !== undefined ? data.lookingForRoommates : true,
                        lifestyle: data.lifestyle || '',
                        studyHabits: data.studyHabits || '',
                        socializingFrequency: data.socializingFrequency || '',
                        choresPreference: data.choresPreference || '',
                        privacyComfort: data.privacyComfort || '',
                        sharedHobbies: data.sharedHobbies || '',
                        communicationComfort: data.communicationComfort || '',
                        expenseHandling: data.expenseHandling || '',
                        scheduleCoordination: data.scheduleCoordination || '',
                        goalsSupport: data.goalsSupport || '',
                        overnightGuests: data.overnightGuests || '' // Include overnightGuests
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

    const newFormData = {
        ...formData,
    };

    if (user) {
        db.collection('SurveyResponses').doc(user.id).set(newFormData, { merge: true })
            .then(() => {
                console.log("Document successfully updated or set!");
                completeStep(currentStep); // Mark the current step as completed
                navigate('/rent/off-campus/step7'); // Navigate to the next step
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
const handleCheckboxChange2 = (e) => {
    setFormData({ ...formData, lookingForRoommates: e.target.checked });
};




return (
    <>
        <ProgressBar steps={steps} currentStep={currentStep} onStepChange={onStepChange} />
        <div className="form-container">
            <Stepper currentStep={currentStep} />
            <h2 className="step-title">{steps[currentStep].title}</h2> {/* Display the step title */}

            {/* Welcome Description */}
            <div className="welcome-description">
                <h3>Let's Build You A Profile!</h3>
                <p>
                    These questions are designed to build you a comprehensive profile page that you can
                    can share with potential roommates or landlords.
                </p>
                
                <p>
                    <strong>All Questions are Required</strong>. Please answer to the best of your ability!
                </p>
                <p>
                    <strong>Your Answers Are Auto-Saved</strong>
                </p>

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
                </div>

            <form onSubmit={saveAnswer}>

                <div className="welcome-description">


                    {/* Lifestyle Preferences */}
                    <label htmlFor="lifestyle">Do you prefer a quiet and studious lifestyle or a more social and outgoing one?</label>
                    <select
                        id="lifestyle"
                        className="input-field"
                        value={formData.lifestyle}
                        onChange={(e) => setFormData({ ...formData, lifestyle: e.target.value })}
                        required
                    >
                        <option value="">Select an option</option>
                        <option value="Quiet and studious">Quiet and studious</option>
                        <option value="Social and outgoing">Social and outgoing</option>
                    </select>

                    {/* Study Habits */}
                    <label htmlFor="study-habits">How do you typically manage your study time?</label>
                    <select
                        id="study-habits"
                        className="input-field"
                        value={formData.studyHabits}
                        onChange={(e) => setFormData({ ...formData, studyHabits: e.target.value })}
                        required
                    >
                        <option value="">Select an option</option>
                        <option value="I have organized study schedules">I have organized study schedules</option>
                        <option value="I study as needed, no strict schedule">I study as needed, no strict schedule</option>
                    </select>

                    {/* Socializing Frequency */}
                    <label htmlFor="socializing-frequency">How often do you enjoy socializing with roommates?</label>
                    <select
                        id="socializing-frequency"
                        className="input-field"
                        value={formData.socializingFrequency}
                        onChange={(e) => setFormData({ ...formData, socializingFrequency: e.target.value })}
                        required
                    >
                        <option value="">Select an option</option>
                        <option value="Frequently, I enjoy spending time with roommates">Frequently, I enjoy spending time with roommates</option>
                        <option value="Occasionally, I like some social interaction">Occasionally, I like some social interaction</option>
                        <option value="Rarely, I prefer privacy most of the time">Rarely, I prefer privacy most of the time</option>
                    </select>

                    {/* Chores Preference */}
                    <label htmlFor="chores-preference">How do you prefer to handle household chores?</label>
                    <select
                        id="chores-preference"
                        className="input-field"
                        value={formData.choresPreference}
                        onChange={(e) => setFormData({ ...formData, choresPreference: e.target.value })}
                        required
                    >
                        <option value="">Select an option</option>
                        <option value="Shared responsibility with roommates">Shared responsibility with roommates</option>
                        <option value="I prefer to handle my own chores">I prefer to handle my own chores</option>
                    </select>

                    {/* Privacy Comfort */}
                    <label htmlFor="privacy-comfort">How comfortable are you with sharing personal space and privacy?</label>
                    <select
                        id="privacy-comfort"
                        className="input-field"
                        value={formData.privacyComfort}
                        onChange={(e) => setFormData({ ...formData, privacyComfort: e.target.value })}
                        required
                    >
                        <option value="">Select an option</option>
                        <option value="Very comfortable, I'm open to sharing almost everything">Very comfortable, I'm open to sharing almost everything</option>
                        <option value="Comfortable, but I value some personal space">Comfortable, but I value some personal space</option>
                        <option value="Not comfortable, I prefer my privacy most of the time">Not comfortable, I prefer my privacy most of the time</option>
                    </select>

                    {/* Communication Comfort */}
                    <label htmlFor="communication-comfort">How comfortable are you with communication and conflict resolution?</label>
                    <select
                        id="communication-comfort"
                        className="input-field"
                        value={formData.communicationComfort}
                        onChange={(e) => setFormData({ ...formData, communicationComfort: e.target.value })}
                        required
                    >
                        <option value="">Select an option</option>
                        <option value="Very comfortable, I'm open to discussing anything">Very comfortable, I'm open to discussing anything</option>
                        <option value="Comfortable, but prefer open and respectful communication">Comfortable, but prefer open and respectful communication</option>
                        <option value="Not comfortable, I avoid conflicts and communication">Not comfortable, I avoid conflicts and communication</option>
                    </select>

                    {/* Expense Handling */}
                    <label htmlFor="expense-handling">How do you typically handle shared expenses like bills and groceries?</label>
                    <select
                        id="expense-handling"
                        className="input-field"
                        value={formData.expenseHandling}
                        onChange={(e) => setFormData({ ...formData, expenseHandling: e.target.value })}
                        required
                    >
                        <option value="">Select an option</option>
                        <option value="I prefer to organize and split expenses equally">I prefer to organize and split expenses equally</option>
                        <option value="Informal, we handle expenses as they come up">Informal, we handle expenses as they come up</option>
                    </select>

                    {/* Schedule Coordination */}
                    <label htmlFor="schedule-coordination">How do you coordinate schedules and shared living spaces?</label>
                    <select
                        id="schedule-coordination"
                        className="input-field"
                        value={formData.scheduleCoordination}
                        onChange={(e) => setFormData({ ...formData, scheduleCoordination: e.target.value })}
                        required
                    >
                        <option value="">Select an option</option>
                        <option value="Regular house meetings to discuss schedules and chores">Regular house meetings to discuss schedules and chores</option>
                        <option value="Informal coordination, we handle things as they come up">Informal coordination, we handle things as they come up</option>
                    </select>
                    {/* Overnight Guests Preference */}
                    <label htmlFor="overnight-guests">How do you feel about having overnight guests?</label>
                    <select
                        id="overnight-guests"
                        className="input-field"
                        value={formData.overnightGuests}
                        onChange={(e) => setFormData({ ...formData, overnightGuests: e.target.value })}
                        required
                    >
                        <option value="">Select an option</option>
                        <option value="Comfortable with occasional guests">Comfortable with occasional guests</option>
                        <option value="Prefer discussing each situation">Prefer discussing each situation</option>
                        <option value="Prefer no overnight guests">Prefer no overnight guests</option>
                    </select>

                    {/* Goals Support */}
                    <label htmlFor="goals-support">Are you looking for roommates who can provide support for your personal or academic goals?</label>
                    <select
                        id="goals-support"
                        className="input-field"
                        value={formData.goalsSupport}
                        onChange={(e) => setFormData({ ...formData, goalsSupport: e.target.value })}
                        required
                    >
                        <option value="">Select an option</option>
                        <option value="Yes, I value roommates who can provide support">Yes, I value roommates who can provide support</option>
                        <option value="No, I prefer to focus on my goals independently">No, I prefer to focus on my goals independently</option>
                    </select>
                    <div className="checkbox-container">
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.lookingForRoommates}
                                onChange={handleCheckboxChange2}
                            />
                            Looking For Roommates
                        </label>
                    </div>
                </div>

                <button className="next-button" type="submit">Next</button>
            </form>
        </div>
    </>
);
};

export default OffCampusHousingFormStep6;
