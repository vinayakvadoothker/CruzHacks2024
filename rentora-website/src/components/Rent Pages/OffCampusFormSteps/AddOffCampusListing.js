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


const universities = [
    "UC Santa Cruz",
    "University of California Berkeley (UCB)",
    "University of California, San Diego (UCSD)",
    "Massachusetts Institute of Technology (MIT)",
    "University of California, Los Angeles (UCLA)",
    "University of California, Davis (UCD)",
    "University of California, Santa Barbara (UCSB)",
    "University of California, Irvine (UCI)",
    "University of California, Riverside (UCR)",
    "University of California, Merced (UCM)",
    "University of California, San Francisco (UCSF)",
    "Harvard University",
    "Stanford University",
    "University of Chicago",
    "University of Pennsylvania",
    "Cornell University",
    "California Institute of Technology (Caltech)",
    "Yale University",
    "Princeton University",
    "Columbia University",
    "Johns Hopkins University",
    "University of California, Los Angeles (UCLA)",
    "University of Michigan-Ann Arbor",
    "New York University (NYU)",
    "Northwestern University",
    "Carnegie Mellon University",
    "Duke University",
    "University of Texas at Austin",
    "University of Washington",
    "University of Illinois at Urbana-Champaign",
    "Brown University",
    "Pennsylvania State University",
    "Boston University",
    "Georgia Institute of Technology (Georgia Tech)",
    "Purdue University",
    "University of Wisconsin-Madison",
    "University of Southern California",
    "University of North Carolina, Chapel Hill",
    "Texas A&M University",
    "Michigan State University",
    "Rice University",
    "Ohio State University",
    "Washington University in St. Louis",
    "University of Florida",
    "University of Maryland, College Park",
    "Arizona State University",
    "University of Minnesota, Twin Cities",
    "Emory University",
    "University of Pittsburgh",
    "University of Rochester",
    "Dartmouth College",
    "University of Massachusetts, Amherst",
    "Case Western Reserve University",
    "University of Virginia",
    "Vanderbilt University",
    "University of Colorado at Boulder",
    "North Carolina State University",
    "University of Miami",
    "University of Arizona",
    "Georgetown University",
    "Rutgers - The State University of New Jersey, New Brunswick",
    "Virginia Polytechnic Institute (Virginia Tech)",
    "University of Notre Dame",
    "Indiana University Bloomington",
    "University of Illinois, Chicago (UIC)",
    "George Washington University",
    "Yeshiva University",
    "Northeastern University",
    "Tufts University",
    "University of Hawai'i at Manoa",
    "Stony Brook University",
    "Iowa State University",
    "Colorado State University",
    "University of Kansas",
    "Washington State University",
    "University of Utah",
    "University of Connecticut",
    "University of Tennessee, Knoxville",
    "Florida State University",
    "Colorado School of Mines",
    "Illinois Institute of Technology",
    "Missouri University of Science and Technology",
    "University at Buffalo SUNY",
    "University of Iowa",
    "Rensselaer Polytechnic Institute",
    "University of Delaware",
    "Oregon State University",
    "University of Georgia",
    "University of Texas Dallas",
    "City University of New York",
    "Lehigh University",
    "University of Nebraska - Lincoln",
    "Florida International University",
    "University of South Florida",
    "University of South Carolina",
    "University of Missouri, Columbia",
    "University of Central Florida",
    "Tulane University",
    "Drexel University",
    "Stevens Institute of Technology",
    "Boston College",
    "University of New Mexico",
    "New Jersey Institute of Technology (NJIT)",
    "The New School",
    "University of Houston",
    "University of Oklahoma"
];


const AddOffCampusListing = () => {
    const { user } = useUser();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        bedrooms: '',
        bathrooms: '',
        squareFootage: '',
        monthlyPrice: '',
        depositAmount: '',
        location: '',
        agentEmail: '', // New field for listing agent email
        agentPhone: '', // New field for listing agent phone number
        schoolName: '', // New field for campus listing school name
        housingType: '', // New field for type of housing
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
    
            // Use the selected school name as the name of the subcollection
            const schoolNameFormatted = formData.schoolName.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, "_");
    
            // Create a document within a subcollection named after the selected school
            await db.collection('OffCampusListings').doc(schoolNameFormatted)
                .collection('Listings').doc(formattedAddress).set(newListing);
    
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
        <div className="form-container">
            <h2 className="step-title">Add Off-Campus Housing Listing</h2>
            <button onClick={handleBack} className="back-button">Back</button>
            <form onSubmit={handleSubmit}>
                <h3>Upload Listing Images (First one will be the Thumbnail)</h3>
                <input
                    type="file"
                    name="images"
                    onChange={handleChange}
                    multiple
                    accept="image/jpeg, image/png" // This restricts file selection to JPG and PNG images only
                />
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
                    <input className="input-field" type="number" name="depositAmount" placeholder="Deposit Amount" onChange={handleChange} value={formData.depositAmount} required />
                    <select className="input-field" name="location" onChange={handleChange} value={formData.location} required>
                        <option value="">Select Proximity to Campus</option>
                        <option value="Close">Close</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Far">Far</option>
                    </select>
                    <select className="input-field" name="housingType" onChange={handleChange} value={formData.housingType} required>
                        <option value="">Select Type of Housing</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Townhome">Townhome</option>
                        <option value="Single-Family Home">Single-Family Home</option>
                        <option value="Large Home">Large Home</option>
                    </select>
                </div>
                <div style={{ marginTop: '20px' }}> {/* Add this div for spacing */}
                    <input className="input-field" type="email" name="agentEmail" placeholder="Listing Agent Email" onChange={handleChange} value={formData.agentEmail} required />
                    <input className="input-field" type="tel" name="agentPhone" placeholder="Listing Agent Phone Number" onChange={handleChange} value={formData.agentPhone} required />
                    <select className="input-field" name="schoolName" onChange={handleChange} value={formData.schoolName} required>
                        <option value="">Select School</option>
                        {universities.map((university, index) => (
                            <option key={index} value={university}>{university}</option>
                        ))}
                    </select>
                </div>
                <button className="submit-button" type="submit">Add Listing</button>
            </form>
        </div>
    );
};

export default AddOffCampusListing;