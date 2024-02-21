import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './PublicProfilePage.css'


const PublicProfilePage = () => {
    const { userid } = useParams(); // Destructure the dynamic path segment
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState(null);



    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:3002/fetch_user_details`);
                const data = await response.json();
                const user = data.find(user => user.id === userid);

                if (user) {
                    // Sort activities by start date
                    const sortedActivities = user.activitiesHistory.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
                    user.activitiesHistory = sortedActivities;

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


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Present' : date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });
    };

    const shareProfile = async () => {
        if (document.hasFocus()) {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: `${userData.firstName} ${userData.lastName}'s Profile`,
                        url: `https://rentora.net/profiles/${userData.id}`
                    });
                    // Provide feedback to the user
                    alert('Profile shared successfully!');
                } catch (error) {
                    console.error('Error sharing the profile:', error);
                    // Provide error feedback to the user
                    alert('Error sharing the profile.');
                }
            } else if (navigator.clipboard) {
                try {
                    await navigator.clipboard.writeText(`https://rentora.net/profiles/${userData.id}`);
                    // Provide feedback to the user
                    alert('Profile Link copied to clipboard!');
                } catch (error) {
                    console.error('Error copying link:', error);
                    // Provide error feedback to the user
                    alert('Failed to copy link.');
                }
            } else {
                // Fallback for browsers that do not support the Web Share API or clipboard API
                alert('Sharing not supported. Please copy the URL from the address bar.');
            }
        } else {
            // Document is not focused
            alert('Please focus on the document to share the profile.');
        }
    };

    // Function to toggle the active tab
    const toggleTab = (tabId) => {
        setActiveTab(prevTabId => prevTabId === tabId ? null : tabId);
    };
    const userDataTabs = [
        { id: 'lifestyle', label: 'Lifestyle', content: userData.lifestyle || 'No lifestyle specified' },
        { id: 'studyHabits', label: 'Study Habits', content: userData.studyHabits || 'No study habits specified' },
        { id: 'socializingFrequency', label: 'Socializing Frequency', content: userData.socializingFrequency || 'No socializing frequency specified' },
        { id: 'choresPreference', label: 'Chores Preference', content: userData.choresPreference || 'No chores preference specified' },
        { id: 'privacyComfort', label: 'Privacy Comfort', content: userData.privacyComfort || 'No privacy comfort specified' },
        { id: 'communicationComfort', label: 'Communication Comfort', content: userData.communicationComfort || 'No communication comfort specified' },
        { id: 'expenseHandling', label: 'Expense Handling', content: userData.expenseHandling || 'No expense handling specified' },
        { id: 'scheduleCoordination', label: 'Schedule Coordination', content: userData.scheduleCoordination || 'No schedule coordination specified' },
        { id: 'goalsSupport', label: 'Goals Support', content: userData.goalsSupport || 'No goals support specified' },
        { id: 'overnightGuests', label: 'Overnight Guests', content: userData.overnightGuests || 'No overnight guests specified' },
    ];



    // Render user profile using userData
    return (
        <div className="profile-container">
            <div className="profile-header">
                <img src={userData.profilePicture} alt="Profile" className="profile-picture" />
                <h1>{`${userData.firstName} ${userData.lastName}`}</h1>
            </div>

            <a href={`mailto:${userData.email}`} title={`Email ${userData.firstName} ${userData.lastName}`} className="email-icon">
                ✉️
            </a>
            <a href={`tel:${userData.phone}`} title={`Call ${userData.firstName} ${userData.lastName}`} className="phone-icon">
                📞
            </a>
            <a href={`sms:${userData.phone}`} title={`Message ${userData.firstName} ${userData.lastName}`} className="message-icon">
                💬
            </a>

            <button onClick={shareProfile} title="Share Profile" className="share-icon">
                🔗
            </button>

            <div className="school-name-container">
                <p className="school-name">{userData.schoolName} - {userData.major}</p>
            </div>
            <div className="start-date-container">
                <div className="start-date">
                    <p>Since {new Date(userData.startDate).toLocaleDateString('en-US')}</p>
                </div>
            </div>

            <div className="roommate-search-container">
                <span className={`roommate-status-indicator ${userData.lookingForRoommates ? 'yes' : 'no'}`}></span>
                <p>Looking For Roommates</p>
            </div>

            {userData.activitiesHistory.length > 0 && (
                <div className="data-section activities-section">
                    <h3>Activities:</h3>
                    <div className="activities-tabs">
                        {userData.activitiesHistory.map((activity, index) => (
                            <div key={index} className={`tab ${activeTab === index ? 'active' : ''}`} onClick={() => toggleTab(index)}>
                                <div className="tab-title">
                                    {activity.organization}
                                    <span className={`arrow ${activeTab === index ? 'open' : 'closed'}`}>▼</span>
                                </div>
                                {activeTab === index && (
                                    <div className="tab-content">
                                        <p className="tab-info-title">Title:<span className="tab-info-content"> &nbsp;{activity.title}</span></p>
                                        <p className="tab-info-title">From:<span className="tab-info-content"> &nbsp;{formatDate(activity.startDate)}</span></p>
                                        <p className="tab-info-title">To:<span className="tab-info-content"> &nbsp;{formatDate(activity.endDate)}</span></p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <h2>Roommate Profile</h2>
            {userDataTabs.map(tab => (
                <div key={tab.id} className="data-section">
                    <div className="tab-info-title" onClick={() => toggleTab(tab.id)}>
                        <p>{tab.label}</p>
                        <span className={`arrow ${activeTab === tab.id ? 'open' : 'closed'}`}>▼</span>
                    </div>
                    {activeTab === tab.id && (
                        <div className="tab-content">
                            <p>{tab.content}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
export default PublicProfilePage;

