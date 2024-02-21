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
                    <h3>Welcome to the Rental Profile Builder</h3>
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
                    <button className="next-button" type="submit">Start Here</button>
                </form>
            </div>
        </>
    );
};

export default OffCampusHousingFormStep1;