import React, { useState, useEffect } from 'react';
import { db } from "../../config";
import "./OffCampusApplications.css";
import ApplyPopup from './ApplyPopup';

const OffCampusApplications = () => {
    const [applications, setApplications] = useState([]);
    const [editApplication, setEditApplication] = useState(null);

    useEffect(() => {
        const fetchAllApplications = async () => {
            try {
                const response = await db.collectionGroup('applications').get();

                const data = response.docs.map(doc => {
                    const applicationData = doc.data();
                    const address = doc.ref.parent.parent.id;
                    return {
                        id: doc.id,
                        address,
                        ...applicationData,
                    };
                });
                setApplications(data);
            } catch (error) {
                console.error('Error fetching applications:', error);
            }
        };

        fetchAllApplications();
    }, []);

    const handleEdit = (applicationId) => {
        const selectedApplication = applications.find(application => application.id === applicationId);
        setEditApplication(selectedApplication);
    };

    return (
        <div className="scrollable-container">
            <div className="offcampus-applications-container">
                <h2>Your Off-Campus Applications</h2>
                {applications.map(application => (
                    <div key={application.address} className="application-container">
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
                        user={{/* pass the user data here */}}
                        listing={{/* pass the listing data here */}}
                        closePopup={() => setEditApplication(null)}
                        editApplicationData={editApplication}
                    />
                )}
            </div>
        </div>
    );

    function formatAddress(address) {
        const formattedAddress = address.replace(/_/g, ' ');
        return formattedAddress;
    }
};

export default OffCampusApplications;
