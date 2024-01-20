import React, { useState, useEffect } from 'react';
import { db } from "../../config";
import "./ApplyPopup.css";

const ApplyPopup = ({ user, listing, closePopup }) => {
    const [userDetails, setUserDetails] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch('http://localhost:3000/fetch_user_details');
                const data = await response.json();
                setUserDetails(data);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserDetails();
    }, []);

    useEffect(() => {
        // Filter users based on the search term and condition
        const filteredResults = userDetails.filter(user =>
            user.addToRoommateSearch === true &&
            (user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    
        setSearchResults(filteredResults);
    }, [userDetails, searchTerm]);
    

    const handleChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const [applicationData, setApplicationData] = useState({
        preferredMoveInDate: ''
        // add other form fields as needed
    });

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
            listingTitle: listing.title
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

    const [isDropdownVisible, setDropdownVisible] = useState(false);

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        setDropdownVisible(!!e.target.value); // Show the dropdown only when there's input
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
                {/* Add other form fields as needed */}
                <button onClick={handleSubmit}>Submit Application</button>

                {/* Search field with dropdown */}
                <div className={`search-dropdown ${isDropdownVisible ? 'visible' : ''}`}>
                    <label>
                        Search for Roommates:
                        <input
                            type="text"
                            name="searchTerm"
                            value={searchTerm}
                            onChange={handleInputChange}
                        />
                    </label>
                    {isDropdownVisible && (
                        <div className="dropdown-content">
                            <h3>Search Results</h3>
                            {searchResults.map(result => (
                                <div key={result.id}>
                                    <p>{result.firstName} {result.lastName}</p>
                                    <p>Email: {result.email}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplyPopup;