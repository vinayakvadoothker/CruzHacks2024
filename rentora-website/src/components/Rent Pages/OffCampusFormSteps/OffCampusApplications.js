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

    const handleApplicationUpdate = async () => {
        setEditApplication(null);
        await fetchUserApplications();
    };

    function formatAddress(address) {
        console.log("Original address:", address);
        // Check if address is defined
        if (!address) {
            console.log("Address is not available");
            return 'Address not available'; // or some default text
        }
        const formattedAddress = address.replace(/_USA$/, '').replace(/_/g, ' ');
        console.log("Formatted address:", formattedAddress);
        return formattedAddress;
    }


    const handleViewApplication = (combinedPdfUrl) => {
        if (combinedPdfUrl) {
            window.open(combinedPdfUrl, '_blank');
        } else {
            alert('Combined application PDF is not available.');
        }
    };

    return (
        <div className="scrollable-container" style={{ width: '50%', margin: '60px auto', maxHeight: '60vh', overflowY: 'auto', overflowX: 'auto', padding: '20px' }}>
            <div className="offcampus-applications-container">
                <div className='off-campus-title'>Your Off-Campus Applications</div>
                {applications.map(application => (
                    <div key={application.id} className="application-container">
                        <h3>{formatAddress(application.id)}</h3>
                        {application.selectedRoommatesData?.map(roommate => (
                            <div key={roommate.id}>
                                <p>{roommate.name}</p>
                            </div>
                        )) ?? []}
                        <button className='view-application-button' onClick={() => handleViewApplication(application.combinedPdfUrl)}>View Application</button>
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
