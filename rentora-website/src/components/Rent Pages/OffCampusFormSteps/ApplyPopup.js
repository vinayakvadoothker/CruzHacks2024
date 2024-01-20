import React, { useState, useEffect } from 'react';
import { db } from "../../config";
import "./ApplyPopup.css"


const ApplyPopup = ({ user, listing, closePopup }) => {

    const [applicationData, setApplicationData] = useState({
        preferredMoveInDate: '',
        selectedRoommates: []
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = async () => {
        // Ensure necessary data is available
        if (!searchQuery || !user || !user.schoolName) {
            console.log("Search query or user data is not available");
            return;
        }
    
        try {
            const querySnapshot = await db.collection('users')
                .where('schoolName', '==', user.schoolName)
                .where('firstName', '==', searchQuery) // or any other relevant field
                .get();
    
            const results = querySnapshot.docs.map(doc => doc.data());
            setSearchResults(results);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    const handleSelectRoommate = (roommateId) => {
        setApplicationData(prevData => ({
            ...prevData,
            selectedRoommates: prevData.selectedRoommates.includes(roommateId)
                ? prevData.selectedRoommates.filter(id => id !== roommateId)
                : [...prevData.selectedRoommates, roommateId]
        }));
    };
    
    useEffect(() => {
        const fetchApplicationData = async () => {
            if (listing && user) {
                const formattedAddress = listing.address.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, "_");
                const documentId = user.id;

                try {
                    const docRef = db.collection('offcampus_listing_applications')
                                    .doc(formattedAddress)
                                    .collection('applications')
                                    .doc(documentId);

                    const doc = await docRef.get();

                    if (doc.exists) {
                        setApplicationData(doc.data());
                    } else {
                        // Reset form if there's no existing data
                        setApplicationData({
                            roommatePreference: '',
                            moveInDate: '',
                            additionalComments: ''
                        });
                    }
                } catch (error) {
                    console.error('Error fetching application data:', error);
                }
            }
        };

        fetchApplicationData();
    }, [user, listing]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!listing || !listing.address) {
            console.error('Listing data is not available or address is undefined');
            return;
        }

        const formattedAddress = listing.address.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, "_");

        // Use the user's ID as the document ID
        const documentId = user.id;

        const dataToSave = { 
            ...applicationData,
            selectedRoommates: applicationData.selectedRoommates.map(roommate => roommate.id) // Assuming each roommate has an id
        };

        try {
            // Update the document with the new data
            await db.collection('offcampus_listing_applications')
                .doc(formattedAddress)
                .collection('applications')
                .doc(documentId)
                .set(dataToSave, { merge: true });

            closePopup();
        } catch (error) {
            console.error('Error submitting application:', error);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            if (user && user.schoolName) {
                try {
                    const querySnapshot = await db.collection('users')
                        .where('schoolName', '==', user.schoolName)
                        .get();
                    
                    const usersList = querySnapshot.docs.map(doc => {
                        const userData = doc.data();
                        return { firstName: userData.firstName, lastName: userData.lastName };
                    });

                    console.log('Users with the same schoolName:', usersList);
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            }
        };

        fetchUsers();
    }, [user]);
    return (
        <div className="apply-popup-overlay">
            <div className="apply-popup-content">
                <button className="apply-popup-close" onClick={closePopup}>X</button>
                
                <h2>Apply for {listing.address}</h2>

                {/* Roommate Search Feature */}
                <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Search for roommates"
                />
                <button onClick={handleSearch}>Search</button>

                <div>
                    {searchResults.map((roommate) => (
                        <div key={roommate.id}>
                            <label>
                                <input 
                                    type="checkbox"
                                    checked={applicationData.selectedRoommates.includes(roommate.id)}
                                    onChange={() => handleSelectRoommate(roommate.id)}
                                />
                                {roommate.firstName} {roommate.lastName}
                            </label>
                        </div>
                    ))}
                </div>

                {/* Preferred Move-In Date */}
                <label>
                    Preferred Move-In Date:
                    <input 
                        type="date" 
                        name="preferredMoveInDate" 
                        value={applicationData.preferredMoveInDate} 
                        onChange={(e) => setApplicationData({ ...applicationData, preferredMoveInDate: e.target.value })}
                    />
                </label>
                
                <button onClick={handleSubmit}>Submit Application</button>
            </div>
        </div>
    );
};

export default ApplyPopup;