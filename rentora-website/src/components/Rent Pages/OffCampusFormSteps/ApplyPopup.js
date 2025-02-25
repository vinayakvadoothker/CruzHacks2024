import React, { useState, useEffect } from 'react';
import { db } from "../../config";
import Spinner from './Spinner';
import "./ApplyPopup.css";

const ApplyPopup = ({ user, listing, closePopup, editApplicationData }) => {
    const [userDetails, setUserDetails] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRoommates, setSelectedRoommates] = useState([]);
    const [applicationData, setApplicationData] = useState({
        preferredMoveInDate: '',
        selectedRoommatesData: [],
        numberOfPets: 0,
        anySmokers: false,
        todaysDate: getTodaysDate(),
        signature: ''
    });
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const handleInitialSubmit = (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        const userConfirmed = window.confirm('Are you sure you want to submit your application?');
        if (userConfirmed) {
            handleSubmit(e); // Pass the event object to handleSubmit
        }
    };


    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch('https://cruz-hacks2024.vercel.app/api/fetch_user_details');
                const data = await response.json();

                const filteredData = data.filter(user => {
                    const addToRoommateSearch = user.addToRoommateSearch;
                    const isSameSchool = user.schoolName === listing.schoolName; // Check if the user is from the same school as the listing

                    // Include user if addToRoommateSearch is true, not undefined, not 'Not specified', and from the same school
                    return (addToRoommateSearch || addToRoommateSearch === undefined || addToRoommateSearch === 'Not specified') && isSameSchool;
                });

                if (Array.isArray(filteredData)) {
                    setUserDetails(filteredData);
                } else {
                    console.error('Fetched data is not an array:', filteredData);
                }

                // Check for an existing application
                const existingApplication = filteredData.find(userData => userData.id === user.id && userData.listingTitle === listing.title);
                if (existingApplication) {
                    setApplicationData({
                        ...existingApplication,
                        selectedRoommatesData: existingApplication?.selectedRoommatesData ?? []
                    });

                    if (existingApplication && Array.isArray(existingApplication.selectedRoommatesData)) {
                        setSelectedRoommates(existingApplication.selectedRoommatesData.map(roommate => roommate.id));
                    } else {
                        setSelectedRoommates([]);
                    }
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserDetails();
    }, [user.id, listing.title, user.schoolName, listing.schoolName]);


    useEffect(() => {
        const filteredResults = userDetails.filter(user =>
        (user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        setSearchResults(filteredResults);
    }, [userDetails, searchTerm]);


    useEffect(() => {
        if (editApplicationData) {
            setApplicationData({
                ...editApplicationData,
                selectedRoommatesData: editApplicationData.selectedRoommatesData ?? [] // Ensure this is always an array
            });
            setSelectedRoommates(editApplicationData.selectedRoommatesData?.map(roommate => roommate.id) ?? []);
        }
    }, [editApplicationData]);



    const handleChange = (e) => {
        const newSearchTerm = e.target.value.toLowerCase();
        setSearchTerm(e.target.value);
        setDropdownVisible(!!newSearchTerm);
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

    const handlePetsChange = (e) => {
        setApplicationData({ ...applicationData, numberOfPets: parseInt(e.target.value) || 0 });
    };

    const handleSmokersChange = (e) => {
        setApplicationData({ ...applicationData, anySmokers: e.target.checked });
    };

    const handleSignatureChange = (e) => {
        setApplicationData({ ...applicationData, signature: e.target.value });
    };

    const selectedRoommatesData = selectedRoommates.map(roommateId => {
        return userDetails.find(userDetail => userDetail.id === roommateId);
    });

    const sendEmailToRoommate = async (emailData) => {
        try {
            // Make a request to your server-side endpoint to send the email
            const response = await fetch('https://cruz-hacks2024.vercel.app/api/send_email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });

            if (response.ok) {
                console.log('Email sent successfully');
            } else {
                console.error('Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setShowConfirmationModal(false);
        setIsLoading(true);

        // Validation for required fields
        if (!applicationData.preferredMoveInDate || applicationData.numberOfPets < 0 || applicationData.signature.trim() === '') {
            alert('Please fill out all required fields before submitting the application.');
            setIsLoading(false); // Update loading state on validation failure
            return;
        }

        if (!listing || !listing.address) {
            console.error('Listing data is not available or address is undefined');
            setIsLoading(false); // Update loading state on listing validation failure
            return;
        }

        const depositAmount = listing.depositAmount || 'Not specified';

        // Prepare the userIds array with the current user and selected roommates
        const totalOccupants = 1 + selectedRoommatesData.length; // Including the user and selected roommates
        const monthlyPrice = listing.monthlyPrice || '1500'; // Defaulting to '1500' if not specified
        const rentPerPerson = parseInt(monthlyPrice) / totalOccupants;

        // Construct the proposedOccupants string with the user and selected roommates' names
        const proposedOccupantsNames = [
            `${user.firstName} ${user.lastName}`,
            ...selectedRoommatesData.map(roommate => `${roommate.firstName} ${roommate.lastName}`)
        ].join(', ');

        // Prepare the address object according to the updated requirements
        const address = {
            "Street": listing.address.split(',')[0].trim(),
            "City": listing.address.split(',')[1].trim(),
            "State": listing.address.split(',')[2].trim(),
            "Deposit": (depositAmount || '500').toString(), // Assuming depositAmount is available, defaulting to '500'
            "rentalAddress": listing.address,
            "RentAmount": rentPerPerson.toFixed(2), // Rent amount per person
            "TodaysDate": applicationData.todaysDate,
            "rental_address": listing.address,
            "Pets": applicationData.numberOfPets > 0 ? "Yes" : "No",
            "proposedOccupants": proposedOccupantsNames, // Names of all proposed occupants including the user
            "moveInDate": applicationData.preferredMoveInDate
        };

        // Prepare the names array with the user and selected roommates
        const names = [
            { "firstName": user.firstName, "lastName": user.lastName },
            ...selectedRoommatesData.map(roommate => ({
                "firstName": roommate.firstName,
                "lastName": roommate.lastName
            }))
        ];

        // Construct the payload
        const payload = {
            userIds: [user.id, ...selectedRoommates.map(id => id)], // Assuming selectedRoommates contains IDs of selected roommates
            address,
            names
        };


        // Construct the URL for GET request
        const url = `https://cruz-hacks2024.vercel.app/api/applyToListing?userIds=${[user.id, ...selectedRoommates].join(',')}&address=${listing.address}&names=${JSON.stringify([{firstName: user.firstName, lastName: user.lastName}, ...selectedRoommatesData.map(roommate => ({firstName: roommate.firstName, lastName: roommate.lastName}))])}&preferredMoveInDate=${applicationData.preferredMoveInDate}&numberOfPets=${applicationData.numberOfPets}&anySmokers=${applicationData.anySmokers}&todaysDate=${applicationData.todaysDate}&signature=${applicationData.signature}`;

        try {
            // Make the GET request
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to submit application');
            }
            
            // Notify roommates via email
            for (const roommate of selectedRoommatesData) {
                await sendEmailToRoommate({
                    to: roommate.email,
                    subject: 'You have been added as a roommate in an application',
                    html: `Dear ${roommate.firstName},<br><br>${user.firstName} ${user.lastName} has included you as a roommate in their rental application for ${listing.address}.<br><br>Best,<br>Rentora Team`
                });
            }

            const applicationResponse = await response.json(); // Extract JSON response
            const combinedApplicationUrl = applicationResponse.url; // Assuming the response has a 'url' field

            // Notify the agent via email including the link to the combined application
            await sendEmail({
                to: listing.agentEmail, // Assuming agentEmail is available in the listing data
                subject: 'New Rental Application Submitted',
                html: `Dear Agent,<br><br>A new rental application has been submitted for ${listing.address} by ${user.firstName} ${user.lastName} with roommates: ${selectedRoommatesData.map(rm => `${rm.firstName} ${rm.lastName}`).join(', ')}.<br><br>Please review the application at the following link: <a href="${combinedApplicationUrl}">View Application</a><br><br>Best,<br>Rentora Team`
            });

            console.log('Application submitted successfully');
            closePopup(); // Close the application popup

        } catch (error) {
            console.error('Error submitting application:', error);
        }
        setIsLoading(false);
    };

    const sendEmail = async (emailData) => {
        try {
            const response = await fetch('https://cruz-hacks2024.vercel.app/api/send_email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });

            if (!response.ok) {
                throw new Error('Failed to send email');
            }

            console.log('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };




    function getTodaysDate() {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
        const yyyy = today.getFullYear();

        return `${yyyy}-${mm}-${dd}`;
    }

    const closeSearchResult = (userId) => {
        setSearchResults((prevResults) => prevResults.filter((result) => result.id !== userId));
        setDropdownVisible(false);
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
                        className="apply-popup-input"
                        type="date"
                        name="preferredMoveInDate"
                        value={applicationData.preferredMoveInDate}
                        onChange={(e) => setApplicationData({ ...applicationData, preferredMoveInDate: e.target.value })}
                    />
                </label>

                {applicationData.selectedRoommatesData?.map(roommate => (
                    <div key={roommate.id}>
                        <p>{roommate.name}</p>
                    </div>
                )) ?? <p>No roommates selected</p>}


                {/* Search field with multi-select */}
                <div className="search-dropdown">
                    <label>
                        Search for Roommates:
                        <input
                            className="apply-popup-input"
                            type="text"
                            name="searchTerm"
                            value={searchTerm}
                            onChange={handleChange}
                        />
                    </label>

                    {isDropdownVisible && searchResults.length > 0 && (
                        <div className="dropdown-content narrower-dropdown" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <h3>Search Results</h3>
                            {searchResults.map(result => (
                                <div key={result.id} className="search-result">
                                    <button className="close-search-result" onClick={() => closeSearchResult(result.id)}>X</button>
                                    <input
                                        className="apply-popup-input"
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
                </div>

                {/* Additional form fields */}
                <label>
                    Number of Pets:
                    <input
                        className="apply-popup-input"
                        type="number"
                        name="numberOfPets"
                        value={applicationData.numberOfPets}
                        onChange={handlePetsChange}
                    />
                </label>

                <label>
                    Any Smokers?
                    <input
                        className="apply-popup-input"

                        type="checkbox"
                        name="anySmokers"
                        checked={applicationData.anySmokers}
                        onChange={handleSmokersChange}
                    />
                </label>

                <label>
                    Today's Date:
                    <input
                        className="apply-popup-input"
                        type="date"
                        name="todaysDate"

                        value={applicationData.todaysDate}
                        onChange={() => { }} // This field is read-only
                        disabled
                    />
                </label>

                <label>
                    Signature:
                    <input
                        className="apply-popup-input"
                        type="text"
                        name="signature"
                        value={applicationData.signature}
                        onChange={handleSignatureChange}
                    />
                </label>

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
                {isLoading && <Spinner />}
                {/* Submit Application button */}
                <button onClick={handleInitialSubmit}>Submit Application</button>
            </div>
        </div>
    );
};

export default ApplyPopup;
