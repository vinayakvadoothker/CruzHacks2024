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
    const [activeListing, setActiveListing] = useState(null);
    const [currentImageIndexes, setCurrentImageIndexes] = useState([]);
    const [expandedImages, setExpandedImages] = useState([]); // Add state for expanded images

    useEffect(() => {
        const fetchFormStatusAndListings = async () => {
            try {
                const formResponseDoc = await db.collection('SurveyResponses').doc(user.id).get();
                const formResponseData = formResponseDoc.data();

                if (!formResponseData || formResponseData.offcampusformdone !== true) {
                    navigate('/rent/off-campus/step1');
                    return;
                }

                const querySnapshot = await db.collection('OffCampusListings').get();
                const listings = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setListingsData(listings);
                setCurrentImageIndexes(listings.map(() => 0));
                setExpandedImages(listings.map(() => false)); // Initialize expanded state for each listing
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (user) {
            fetchFormStatusAndListings();
        }
    }, [user, navigate]);

    const handleAddOffCampusClick = () => {
        navigate('/addoffcampuslisting');
    };

    const isClerkAuthorized = user && allowedClerkIDs.includes(user.id);

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

    const openApplyPopup = async (listing) => {
        const formattedAddress = listing.address.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, "_");
        
        try {
            const snapshot = await db.collection('offcampus_listing_applications').doc(user.id)
                                    .collection(formattedAddress).limit(1).get();
    
            const existingApplication = snapshot.docs.length > 0 ? snapshot.docs[0].data() : null;
            setActiveListing({...listing, existingApplication});
        } catch (error) {
            console.error('Error fetching application data:', error);
        }
    };

    const closeApplyPopup = () => {
        setActiveListing(null);
    };

    // Function to toggle image expansion for a specific listing
    const toggleImageExpansion = (index) => {
        const newExpandedImages = [...expandedImages];
        newExpandedImages[index] = !newExpandedImages[index];
        setExpandedImages(newExpandedImages);
    };

    // Function to close expanded image for a specific listing
    const closeExpandedImage = (index) => {
        const newExpandedImages = [...expandedImages];
        newExpandedImages[index] = false;
        setExpandedImages(newExpandedImages);
    };

    return (
        <>
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
                            <div key={listing.id} className="listing-item" >
                                <h3>{listing.title}</h3>
                                <div className="thumbnail-container">
                                    <img
                                        src={listing.images[currentImageIndex]}
                                        alt={listing.title}
                                        className={expandedImages[index] ? 'expanded' : ''}
                                        onClick={() => toggleImageExpansion(index)} // Pass index to toggleImageExpansion
                                    />
                                    <button className="expand-button" onClick={() => toggleImageExpansion(index)}>Expand</button>
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
                                <button className="apply-button" onClick={() => openApplyPopup(listing)}>
                                    Apply
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {activeListing && (
                <ApplyPopup
                    user={user}
                    listing={activeListing}
                    closePopup={closeApplyPopup}
                />
            )}

            {expandedImages.map((expanded, index) => expanded && (
                <div className="expanded-image" key={`expanded-${index}`}>
                    <button className="close-button" onClick={() => closeExpandedImage(index)}>X</button>
                    <img
                        src={listingsData[index].images[currentImageIndexes[index]]}
                        alt={listingsData[index].title}
                    />
                </div>
            ))}
        </>
    );
};

export default OffCampusHousingDashboard;
