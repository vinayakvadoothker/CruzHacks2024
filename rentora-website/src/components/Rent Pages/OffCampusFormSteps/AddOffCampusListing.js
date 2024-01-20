import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from "../../config"; // Import your Firebase configuration
import { useUser } from "@clerk/clerk-react";
import { allowedClerkIDs } from './AddListingPermissions'; // Adjust the import path as necessary
import PlacesAutocomplete, {
    geocodeByAddress,
    getLatLng,
} from 'react-places-autocomplete';
import './styles.css';

const AddOffCampusListing = () => {
    const { user } = useUser();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        bedrooms: '',
        bathrooms: '',
        squareFootage: '',
        monthlyPrice: '',
        location: '',
        images: [] // Array to hold image URLs
    });
    const [address, setAddress] = useState('');
    const [imageFiles, setImageFiles] = useState([]); // Array to hold image files
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the user is allowed to access this page
        if (user && !allowedClerkIDs.includes(user.id)) {
            navigate(-1); // Send user back to the previous page
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        if (e.target.name === 'images') {
            const selectedFiles = Array.from(e.target.files);
            const validFiles = selectedFiles.filter(file => 
                file.type === "image/png" || file.type === "image/jpeg");
    
            if (selectedFiles.length !== validFiles.length) {
                alert('Only PNG and JPG images are allowed.');
            }
    
            setImageFiles(validFiles);
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSelectAddress = async (value) => {
        const results = await geocodeByAddress(value);
        const latLng = await getLatLng(results[0]);
        setAddress(value);
        // Additional processing if needed
    };

    const uploadImages = async () => {
        const imageUrls = [];
        for (const file of imageFiles) {
            const imageRef = storage.ref(`images/${file.name}`);
            await imageRef.put(file);
            const imageUrl = await imageRef.getDownloadURL();
            imageUrls.push(imageUrl);
        }
        return imageUrls;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Check if all fields in the form are filled
        const isFormComplete = Object.values(formData).every(value => value) && address && imageFiles.length > 0;
    
        if (!isFormComplete) {
            alert('Please make sure the entire form is complete.');
            return;
        }
    
        try {
            const imageUrls = await uploadImages();
            const newListing = { ...formData, address, images: imageUrls };
            
            // Use the address as the document name, replacing any characters that are not allowed in Firestore document names
            const formattedAddress = address.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, "_");
            
            await db.collection('OffCampusListings').doc(formattedAddress).set(newListing);
            navigate('/rent/off-campus');
        } catch (error) {
            console.error('Error adding listing:', error);
        }
    };
    



    // Function to handle the back button click
    const handleBack = () => {
        navigate(-1); // This will take the user back to the previous page
    };
    return (
        <div className="form-container" style={{ width: '50%', margin: '55px auto', maxHeight: '80vh', overflowY: 'auto', padding: '20px' }}>
            <h2 className="step-title">Add Off-Campus Housing Listing</h2>
            <button onClick={handleBack} className="back-button">Back</button>
            <form onSubmit={handleSubmit}>
                <h3>Upload Listing Images (First one will be the Thumbnail)</h3>
                <input type="file" name="images" onChange={handleChange} multiple />
                <div style={{ marginTop: '20px' }}> {/* Add this div for spacing */}
                    <input className="input-field" type="text" name="title" placeholder="Title" onChange={handleChange} value={formData.title} required />
                    <PlacesAutocomplete value={address} onChange={setAddress} onSelect={handleSelectAddress}>
                        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                            <div>
                                <input
                                    {...getInputProps({
                                        placeholder: 'Address',
                                        className: 'input-field'
                                    })}
                                />
                                <div className="autocomplete-dropdown-container">
                                    {loading && <div>Loading...</div>}
                                    {suggestions.map(suggestion => {
                                        const className = suggestion.active
                                            ? 'suggestion-item--active'
                                            : 'suggestion-item';
                                        const style = suggestion.active
                                            ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                            : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                        return (
                                            <div
                                                {...getSuggestionItemProps(suggestion, {
                                                    className,
                                                    style,
                                                })}
                                            >
                                                <span>{suggestion.description}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </PlacesAutocomplete>
                    <textarea className="input-field" name="description" placeholder="Description" onChange={handleChange} value={formData.description} required />
                    <input className="input-field" type="number" name="bedrooms" placeholder="Bedrooms" onChange={handleChange} value={formData.bedrooms} required />
                    <input className="input-field" type="number" name="bathrooms" placeholder="Bathrooms" onChange={handleChange} value={formData.bathrooms} required />
                    <input className="input-field" type="number" name="squareFootage" placeholder="Square Footage" onChange={handleChange} value={formData.squareFootage} required />
                    <input className="input-field" type="number" name="monthlyPrice" placeholder="Monthly Price" onChange={handleChange} value={formData.monthlyPrice} required />
                    <select className="input-field" name="location" onChange={handleChange} value={formData.location} required>
                        <option value="">Select Proximity to Campus</option>
                        <option value="Close">Close</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Far">Far</option>
                    </select>                </div>
                <button className="submit-button" type="submit">Add Listing</button>
            </form>
        </div>
    );
};

export default AddOffCampusListing;
