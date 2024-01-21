import React, { useState, useEffect, useCallback } from 'react';
import { db } from "../../config";
import { useUser } from "@clerk/clerk-react";
import "./OffCampusApplications.css";
import ApplyPopup from './ApplyPopup';

const OffCampusApplications = () => {
    const { user } = useUser();
    const [applications, setApplications] = useState([]);
    const [editApplication, setEditApplication] = useState(null);

    // Memoizing the fetchUserApplications function
    const fetchUserApplications = useCallback(async () => {
        if (user) {
            try {
                const applicationsResponse = await db.collection('SurveyResponses')
                    .doc(user.id)
                    .collection('offcampusapplications')
                    .get();
                
                const userApplications = applicationsResponse.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setApplications(userApplications);
            } catch (error) {
                console.error('Error fetching applications:', error);
            }
        } else {
            console.log('No user found');
        }
    }, [user]); // Dependency array

    useEffect(() => {
        fetchUserApplications();
    }, [fetchUserApplications]); // Dependency array includes 'fetchUserApplications'

    const handleEdit = (applicationId) => {
        const selectedApplication = applications.find(app => app.id === applicationId);
        setEditApplication(selectedApplication);
    };

    const handleApplicationUpdate = async () => {
        setEditApplication(null);
        await fetchUserApplications();
    };

    function formatAddress(address) {
        // Check if address is defined
        if (!address) {
            return 'Address not available'; // or some default text
        }
        return address.replace(/_/g, ' ');
    }

    return (
        <div className="scrollable-container">
            <div className="offcampus-applications-container">
                <div className='off-campus-title'>Your Off-Campus Applications</div>
                {applications.map(application => (
                    <div key={application.id} className="application-container">
                        <h3>{formatAddress(application.address)}</h3>
                        <p>Preferred Move-In Date: {application.preferredMoveInDate}</p>
                        <p>Number of Pets: {application.numberOfPets}</p>
                        <p>Any Smokers? {application.anySmokers ? 'Yes' : 'No'}</p>
                        <h4>Roommates</h4>
                        {application.selectedRoommatesData.map(roommate => (
                            <div key={roommate.id}>
                                <p>{roommate.name}</p>
                            </div>
                        ))}
                        <button onClick={() => handleEdit(application.id)}>Edit</button>
                    </div>
                ))}

                {editApplication && (
                    <ApplyPopup
                        user={user}
                        listing={{ address: editApplication.address }}
                        closePopup={handleApplicationUpdate}
                        editApplicationData={editApplication}
                    />
                )}
            </div>
        </div>
    );
};

export default OffCampusApplications;
