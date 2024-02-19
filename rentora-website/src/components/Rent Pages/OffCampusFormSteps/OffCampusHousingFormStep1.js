import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from "../../config";
import { useUser } from "@clerk/clerk-react";
import Stepper from './Stepper';
import { useSteps } from './StepContext';
import ProgressBar from './ProgressBar';
import './styles.css';

const OffCampusHousingFormStep1 = () => {
    const { steps, completeStep } = useSteps();
    const currentStep = 0; // For step 1, index starts from 0
    const { user } = useUser();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        schoolName: '',
        addToRoommateSearch: true,
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

    const onStepChange = (stepIndex) => {
        navigate(`/rent/off-campus/step${stepIndex + 1}`);
    };

    useEffect(() => {
        if (user) {
            db.collection('SurveyResponses').doc(user.id).get()
                .then(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        setFormData({
                            schoolName: data.schoolName || '',
                            addToRoommateSearch: data.addToRoommateSearch !== undefined ? data.addToRoommateSearch : true,
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
                    navigate('/rent/off-campus/step2'); // Navigate to the next step
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

    const universities = [
        "UC Santa Cruz",
        "University of California Berkeley (UCB)",
        "University of California, San Diego (UCSD)",
        "Massachusetts Institute of Technology (MIT)",
        "University of California, Los Angeles (UCLA)",
        "University of California, Davis (UCD)",
        "University of California, Santa Barbara (UCSB)",
        "University of California, Irvine (UCI)",
        "University of California, Riverside (UCR)",
        "University of California, Merced (UCM)",
        "University of California, San Francisco (UCSF)",
        "Harvard University",
        "Stanford University",
        "University of Chicago",
        "University of Pennsylvania",
        "Cornell University",
        "California Institute of Technology (Caltech)",
        "Yale University",
        "Princeton University",
        "Columbia University",
        "Johns Hopkins University",
        "University of California, Los Angeles (UCLA)",
        "University of Michigan-Ann Arbor",
        "New York University (NYU)",
        "Northwestern University",
        "Carnegie Mellon University",
        "Duke University",
        "University of Texas at Austin",
        "University of Washington",
        "University of Illinois at Urbana-Champaign",
        "Brown University",
        "Pennsylvania State University",
        "Boston University",
        "Georgia Institute of Technology (Georgia Tech)",
        "Purdue University",
        "University of Wisconsin-Madison",
        "University of Southern California",
        "University of North Carolina, Chapel Hill",
        "Texas A&M University",
        "Michigan State University",
        "Rice University",
        "Ohio State University",
        "Washington University in St. Louis",
        "University of Florida",
        "University of Maryland, College Park",
        "Arizona State University",
        "University of Minnesota, Twin Cities",
        "Emory University",
        "University of Pittsburgh",
        "University of Rochester",
        "Dartmouth College",
        "University of Massachusetts, Amherst",
        "Case Western Reserve University",
        "University of Virginia",
        "Vanderbilt University",
        "University of Colorado at Boulder",
        "North Carolina State University",
        "University of Miami",
        "University of Arizona",
        "Georgetown University",
        "Rutgers - The State University of New Jersey, New Brunswick",
        "Virginia Polytechnic Institute (Virginia Tech)",
        "University of Notre Dame",
        "Indiana University Bloomington",
        "University of Illinois, Chicago (UIC)",
        "George Washington University",
        "Yeshiva University",
        "Northeastern University",
        "Tufts University",
        "University of Hawai'i at Manoa",
        "Stony Brook University",
        "Iowa State University",
        "Colorado State University",
        "University of Kansas",
        "Washington State University",
        "University of Utah",
        "University of Connecticut",
        "University of Tennessee, Knoxville",
        "Florida State University",
        "Colorado School of Mines",
        "Illinois Institute of Technology",
        "Missouri University of Science and Technology",
        "University at Buffalo SUNY",
        "University of Iowa",
        "Rensselaer Polytechnic Institute",
        "University of Delaware",
        "Oregon State University",
        "University of Georgia",
        "University of Texas Dallas",
        "City University of New York",
        "Lehigh University",
        "University of Nebraska - Lincoln",
        "Florida International University",
        "University of South Florida",
        "University of South Carolina",
        "University of Missouri, Columbia",
        "University of Central Florida",
        "Tulane University",
        "Drexel University",
        "Stevens Institute of Technology",
        "Boston College",
        "University of New Mexico",
        "New Jersey Institute of Technology (NJIT)",
        "The New School",
        "University of Houston",
        "University of Oklahoma"
    ];



    return (
        <>
            <ProgressBar steps={steps} currentStep={currentStep} onStepChange={onStepChange} />
            <div className="form-container">
                <Stepper currentStep={currentStep} />
                <h2 className="step-title">{steps[currentStep].title}</h2> {/* Display the step title */}

                {/* Welcome Description */}
                <div className="welcome-description">
                    <h3>Welcome to the Rental Application Builder</h3>
                    <p>
                        This form is designed to build you the perfect rental resume and help you find off-campus housing
                        with ease.
                    </p>
                    <p>
                        Completing this form should take about <strong>20 minutes</strong>. Please be ready to share some personal
                        information, like a Photo ID and Banking Information. Rest assured, your privacy is our top
                        priority, and all shared information is securely processed and stored.
                    </p>
                    <p>
                        <strong>Your Answers Are Auto-Saved</strong>
                    </p>

                    <p>
                        Let's get started on finding your ideal home!
                    </p>
                </div>

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

                    <div className="welcome-description">

                        <h3>Let's get started by getting to know you a little better:</h3>

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

                    </div>
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
        </>
    );
};

export default OffCampusHousingFormStep1;