import React, { useState, useEffect } from 'react';
import { db } from "../../config";
import "./ApplyPopup.css";

const ApplyPopup = ({ user, listing, closePopup }) => {
    const [userDetails, setUserDetails] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');
    const [selectedRoommates, setSelectedRoommates] = useState([]);
    const [applicationData, setApplicationData] = useState({
        preferredMoveInDate: '',
        selectedRoommatesData: [] // Added field for selected roommates' data
        // add other form fields as needed
    });
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch('http://localhost:3000/fetch_user_details');
                const data = await response.json();
                setUserDetails(data);

                // Check if the user has already applied for the current listing
                const existingApplication = data.find(user => user.id === user.id && user.listingTitle === listing.title);
                if (existingApplication) {
                    setApplicationData({
                        ...existingApplication,
                        selectedRoommatesData: existingApplication.selectedRoommatesData || []
                    });
                    setSelectedRoommates(existingApplication.selectedRoommatesData.map(roommate => roommate.id) || []);
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserDetails();
    }, [user.id, listing.title]);

    useEffect(() => {
        // Filter users based on the search term and condition
        const filteredResults = userDetails.filter(user =>
        (user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        setSearchResults(filteredResults);
    }, [userDetails, searchTerm]);

    const handleChange = (e) => {
        const newSearchTerm = e.target.value.toLowerCase();
        setSearchTerm(e.target.value);
        setDropdownVisible(!!newSearchTerm); // Show the dropdown only when there's input

        setSelectedTerm(newSearchTerm);
    };

    const handleCheckboxChange = (userId) => {
        const selectedUser = userDetails.find(user => user.id === userId);

        if (selectedUser) {
            setSelectedRoommates((prevRoommates) => {
                const updatedSelection = prevRoommates.includes(userId)
                    ? prevRoommates.filter(id => id !== userId)
                    : [...prevRoommates, userId];

                return updatedSelection;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!listing || !listing.address) {
            console.error('Listing data is not available or address is undefined');
            return;
        }

        const formattedAddress = listing.address.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, "_");

        // Use the user's ID as the document ID
        const documentId = user.id;

        // Extract selected roommates' information
        const selectedRoommatesData = selectedRoommates.map(userId => {
            const roommate = userDetails.find(user => user.id === userId);
            return {
                id: roommate.id,
                name: `${roommate.firstName} ${roommate.lastName}`,
                email: roommate.email
            };
        });

        const dataToSave = {
            ...applicationData,
            selectedRoommatesData: selectedRoommatesData
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

    return (
        <div className="apply-popup-overlay">
            <div className="apply-popup-content">
                <button className="apply-popup-close" onClick={closePopup}>X</button>
                <h2>Apply for {listing.address}</h2>
                {/* Form fields */}
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

                {/* Search field with multi-select */}
                <div className="search-dropdown">
                    <label>
                        Search for Roommates:
                        <input
                            type="text"
                            name="searchTerm"
                            value={searchTerm}
                            onChange={handleChange}
                        />
                    </label>
                    {isDropdownVisible && searchResults.length > 0 && (
                        <div className="dropdown-content narrower-dropdown">
                            <h3>Search Results</h3>
                            {searchResults.map(result => (
                                <div key={result.id}>
                                    <input
                                        type="checkbox"
                                        id={result.id}
                                        checked={selectedRoommates.includes(result.id)}
                                        onChange={() => handleCheckboxChange(result.id)}
                                    />
                                    <label htmlFor={result.id}>
                                        {result.firstName} {result.lastName}
                                    </label>
                                    <p>Email: {result.email}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Display selected roommates */}
                    {selectedRoommates.length > 0 && (
                        <div className="selected-roommates">
                            <h3>Selected Roommates</h3>
                            {selectedRoommates.map(userId => {
                                const roommate = userDetails.find(user => user.id === userId);
                                return (
                                    <div key={userId}>
                                        <p>{roommate ? `${roommate.firstName} ${roommate.lastName}` : 'N/A'}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplyPopup;
