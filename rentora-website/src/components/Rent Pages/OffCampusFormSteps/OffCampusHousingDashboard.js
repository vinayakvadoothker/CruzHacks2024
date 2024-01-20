import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { db } from "../../config";
import './styles.css';
import { allowedClerkIDs } from './AddListingPermissions';
import ApplyPopup from './ApplyPopup';

const OffCampusHousingDashboard = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [listingsData, setListingsData] = useState([]);

    const handleAddOffCampusClick = () => {
        navigate('/addoffcampuslisting');
    };
    const isClerkAuthorized = user && allowedClerkIDs.includes(user.id);

    // State to manage the visibility of the Apply popup
    const [showApplyPopup, setShowApplyPopup] = useState(false);

    // State to keep track of the current image index for each listing
    const [currentImageIndexes, setCurrentImageIndexes] = useState([]);

    useEffect(() => {
        const fetchFormStatusAndListings = async () => {
            try {
                // Check the offcampusformdone status
                const formResponseDoc = await db.collection('SurveyResponses').doc(user.id).get();
                const formResponseData = formResponseDoc.data();
    
                if (!formResponseData || formResponseData.offcampusformdone !== true) {
                    navigate('/rent/off-campus/step1');
                    return;
                }
    
                // Fetch listings only if form is done
                const querySnapshot = await db.collection('OffCampusListings').get();
                const listings = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setListingsData(listings);
                setCurrentImageIndexes(listings.map(() => 0));
    
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        if (user) {
            fetchFormStatusAndListings();
        }
    }, [user, navigate]);
    
    

    const handleNextImage = (index) => {
        const nextImageIndex = (currentImageIndexes[index] + 1) % listingsData[index].images.length;
        const newIndexes = [...currentImageIndexes];
        newIndexes[index] = nextImageIndex;
        setCurrentImageIndexes(newIndexes);
    };

    const handlePrevImage = (index) => {
        const prevImageIndex = (currentImageIndexes[index] - 1 + listingsData[index].images.length) % listingsData[index].images.length;
        const newIndexes = [...currentImageIndexes];
        newIndexes[index] = prevImageIndex;
        setCurrentImageIndexes(newIndexes);
    };

    const toggleApplyPopup = () => {
        setShowApplyPopup(!showApplyPopup);
    };

    return (
        <div className="form-container" style={{ width: '70%', margin: '75px auto', maxHeight: '63vh', overflowY: 'auto', padding: '20px' }}>
            <h2 className="step-title">Off-Campus Housing</h2>
            {isClerkAuthorized && (
                <button onClick={handleAddOffCampusClick} style={{ position: 'absolute', top: '20px', right: '20px' }}>
                    +Add
                </button>
            )}
            <p className="step-description">Your Off-Campus Housing Listings</p>

            <div className="listings-container">
                {listingsData.map((listing, index) => {
                    const currentImageIndex = currentImageIndexes[index];
                    return (
                        <div key={listing.id} className="listing-item">
                            <h3>{listing.title}</h3>
                            <div className="thumbnail-container">
                                <img src={listing.images[currentImageIndex]} alt={listing.title} />
                                <div className="slideshow-arrows">
                                    <button onClick={() => handlePrevImage(index)}>&#8249;</button>
                                    <button onClick={() => handleNextImage(index)}>&#8250;</button>
                                </div>
                            </div>
                            <p className="address"><strong>{listing.address}</strong></p>
                            <p><em>{listing.description}</em></p>
                            <div className="info">
                                <p>{`${listing.bedrooms} Bedroom(s) | ${listing.bathrooms} Bathroom(s) | ${listing.squareFootage} sqft`}</p>
                                <p><strong>Monthly Price:</strong> ${listing.monthlyPrice}</p>
                                <p><strong>Location To Campus:</strong> {listing.location}</p>
                            </div>
                            <button className="apply-button" onClick={toggleApplyPopup}>
                                {showApplyPopup ? 'Close' : 'Apply'}
                            </button>
                        </div>
                    );
                })}
            </div>
            {showApplyPopup && <ApplyPopup closePopup={toggleApplyPopup} />}
        </div>
    );
};

export default OffCampusHousingDashboard;
