import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './PublicProfilePage.css'

const PublicProfilePage = () => {
    const { userid } = useParams(); // Destructure the dynamic path segment
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch user data based on userid
                const response = await fetch(`http://localhost:3002/fetch_user_details`);
                const data = await response.json();

                // Find the user with matching userid
                const user = data.find(user => user.id === userid);

                if (user) {
                    setUserData(user);
                } else {
                    console.error('User not found');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [userid]);

    if (!userData) {
        return <div>Loading...</div>;
    }

    // Render user profile using userData
    return (
        <div className="profile-container">
            <div className="profile-header">
                <img src={userData.profilePicture} alt="Profile" className="profile-picture" />
                <h1>{`${userData.firstName} ${userData.lastName}`}</h1>
            </div>

            <div className="data-section">
                <p>Email: {userData.email}</p>
            </div>
            <div className="data-section">
                <p>School Name: {userData.schoolName}</p>
            </div>
            <div className="data-section">
                <p>Add to Roommate Search: {userData.addToRoommateSearch ? "Yes" : "No"}</p>
            </div>
            <div className="data-section">
                <p>Major: {userData.major}</p>
            </div>
            <div className="data-section">
                <p>Residence: {userData.residence}</p>
            </div>
            <div className="data-section">
                <p>Start Date: {userData.startDate}</p>
            </div>
            {userData.activitiesHistory.length > 0 && (
                <div className="data-section">
                    <h3>Activities History:</h3>
                    <ul className="activities-list">
                        {userData.activitiesHistory.map((activity, index) => (
                            <li key={index}>
                                {activity.title} at {activity.organization} from {activity.startDate} to {activity.endDate || 'Present'}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="data-section">
                <p>Lifestyle: {userData.lifestyle || 'No lifestyle specified'}</p>
            </div>
            <div className="data-section">
                <p>Study Habits: {userData.studyHabits || 'No study habits specified'}</p>
            </div>
            <div className="data-section">
                <p>Socializing Frequency: {userData.socializingFrequency || 'No socializing frequency specified'}</p>
            </div>
            <div className="data-section">
                <p>Chores Preference: {userData.choresPreference || 'No chores preference specified'}</p>
            </div>
            <div className="data-section">
                <p>Privacy Comfort: {userData.privacyComfort || 'No privacy comfort specified'}</p>
            </div>
            <div className="data-section">
                <p>Communication Comfort: {userData.communicationComfort || 'No communication comfort specified'}</p>
            </div>
            <div className="data-section">
                <p>Expense Handling: {userData.expenseHandling || 'No expense handling specified'}</p>
            </div>
            <div className="data-section">
                <p>Schedule Coordination: {userData.scheduleCoordination || 'No schedule coordination specified'}</p>
            </div>
            <div className="data-section">
                <p>Goals Support: {userData.goalsSupport || 'No goals support specified'}</p>
            </div>
            <div className="data-section">
                <p>Overnight Guests: {userData.overnightGuests || 'No overnight guests specified'}</p>
            </div>
        </div>
    );
};
export default PublicProfilePage;

