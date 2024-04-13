// Import the necessary components and functions
import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, useClerk } from '@clerk/clerk-react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import ChatBot from './ChatBot'; // Import your ChatBot component
import { StepProvider } from './components/Rent Pages/OffCampusFormSteps/StepContext';
import Dashboard from './components/Dashboard'; // Import Dashboard component
import OnboardingPage from './components/OnboardingPage'; // Import OnboardingPage component
import BuyPage from './components/BuyPage'; // Import BuyPage component
import RentPage from './components/RentPage'; // Import RentPage component
import ForAllPage from './components/Rent Pages/ForAllPage';
import OffCampusPage from './components/Rent Pages/OffCampusPage';
import VenturePage from './components/VenturePage'; // Import VenturePage component
import ProfilePage from './components/ProfilePage'; // Import ProfilePage component
import GuarantorForm from './components/Rent Pages/OffCampusFormSteps/GuarantorForm'; // Import GuarantorForm component
import PublicProfilePage from './components/PublicProfilePage'; // Import GuarantorForm component

import AddOffCampusListing from './components/Rent Pages/OffCampusFormSteps/AddOffCampusListing'; // Import AddOffCampusListing component
import OffCampusApplications from './components/Rent Pages/OffCampusFormSteps/OffCampusApplications';
import logo from './components/images/Rentora_Logo.png'
import './App.css';

// Check for missing publishable key
if (!process.env.REACT_APP_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// Extract environment variables
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const openaikey = process.env.OPENAI_API_KEY;

// Define Header component
const Header = () => {
  const { user, signOut } = useClerk();
  const navigate = useNavigate(); // Access navigate function

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/onboarding'); // Redirect to '/onboarding' after successful sign-out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const showDropdown = () => {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
      dropdown.style.display = 'block';
    }
  };

  const hideDropdown = () => {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
      dropdown.style.display = 'none';
    }
  };

  return (
    <nav>
      <ul style={{ display: 'flex', alignItems: 'center' }}>
        {/* Logo at the far left */}
        <li>
          <a href="http://www.rentora.net" rel="noopener noreferrer">
            <img src={logo} alt="Rentora Logo" className="logo-circle" />
          </a>
        </li>
        <li style={{ marginRight: 'auto' }}>
          <Link to="/rent/off-campus" style={styles.navLink}>Listings</Link>
        </li>
        <li>
          <Link to="/rent/off-campus/myapplications" style={styles.navLink}>My Applications</Link>
        </li>

        <SignedIn>
          <li style={styles.profileContainer} onMouseEnter={showDropdown} onMouseLeave={hideDropdown}>
            <Link to="/profile">
              <img src={user?.imageUrl} alt="Profile" style={styles.profileImage} />
            </Link>
            <div id="profileDropdown" style={styles.dropdownContent}>
              <div style={styles.dropdownItem} onClick={() => window.location.href = '/profile'}>
                <span style={styles.cursorPointer}>Profile</span>
              </div>
              <div style={styles.dropdownItem} onClick={handleSignOut}>
                <span style={styles.cursorPointer}>Sign Out</span>
              </div>
            </div>
          </li>
        </SignedIn>
      </ul>
    </nav>
  );
};

// Define RentHeader component
const RentHeader = () => {
  return (
    <nav style={{ backgroundColor: 'transparent', padding: '0' }}>
      <ul style={{ ...styles.list, display: 'flex', justifyContent: 'center' }}> {/* Centering items */}
        {/* Listings Link */}
        <li style={styles.navItemContainer}>
          <Link to="/rent/off-campus" style={styles.navLink}></Link>
        </li>

        {/* My Applications Link */}
        <li style={styles.navItemContainer}>
          <Link to="/rent/off-campus/myapplications" style={styles.navLink}></Link>
        </li>
      </ul>
    </nav>
  );
};

// Define Home component
const Home = () => {
  const { session } = useClerk();

  // Redirect to the dashboard if the user is signed in
  if (session && session.user) {
    return <Navigate to="/rent/off-campus" />;
  }

  return <OnboardingPage />;
};

// Define App component
const App = () => {
  return (
    <div className="app-container">
      <div className="content-container"> {/* Content container */}
        <ClerkProvider publishableKey={clerkPubKey} googleMapsApiKey={googleMapsApiKey}>
          <StepProvider>
            <SignedIn>
              <Header />
            </SignedIn>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/buy" element={<BuyPage />} />
              <Route path="/guarantor/:userid" element={<GuarantorForm />} />
              <Route path="/profiles/:userid" element={<PublicProfilePage />} />
              <Route path="/addoffcampuslisting" element={<AddOffCampusListing />} />
              <Route
                path="/rent/*"
                element={
                  <div>
                    <RentHeader />
                    <Routes>
                      <Route index element={<RentPage />} />
                      <Route path="/off-campus/*" element={<OffCampusPage />} />
                      <Route path="/off-campus/myapplications" element={<OffCampusApplications />} />
                      <Route path="/for-all" element={<ForAllPage />} />
                    </Routes>
                  </div>
                }
              />
              <Route path="/venture" element={<VenturePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route
                path="*"
                element={<Navigate to="/onboarding" replace />} // Redirect to '/onboarding' for any unmatched routes
              />
            </Routes>
          </StepProvider>
        </ClerkProvider>
      </div>
    </div>
  );
};

export default App;

const styles = {
  cursorPointer: {
    cursor: 'pointer',
  },
  profileContainer: {
    position: 'relative',
    display: 'inline-block',
    zIndex: '10',
  },
  profileImage: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
  },

  dropdownContent: {
    display: 'none',
    position: 'absolute',
    backgroundColor: 'rgba(249, 249, 249, 0.9)',
    minWidth: '130px',
    boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
    right: 0,
    top: '100%',
    borderRadius: '8px',
    opacity: 0.9,
    zIndex: 5000, // Adjust the z-index value to bring it to the front
  },
  dropdownItem: {
    padding: '12px 16px',
    display: 'block',
    textAlign: 'center',
    fontSize: '20px',
    fontFamily: 'Verdana',
  },

  offCampusButtonContainer: {
    position: 'relative',
    display: 'inline-block',
    margin: '0 10px', // Optional: Add margin for spacing between elements
    zIndex: '10',
  },
  offCampusButton: {
    background: '#007bff', // Example: Bootstrap primary color
    color: 'white',
    padding: '10px 15px',
    borderRadius: '5px',
    textDecoration: 'none', // Remove underline from link
    transition: 'background-color 0.3s', // Smooth transition for hover effect
    fontFamily: 'Verdana',
    fontSize: '10px',
    zIndex: '10',
  },
  // Hover effect for the button
  ':hover': {
    background: '#0056b3', // Darken button color on hover
  },



  dropdown: {
    position: 'center',
  },



  myApplicationsLink: {
    fontSize: '18px', // Adjust the font size as needed
    padding: '5px 10px', // Adjust the padding as needed
    display: 'block',
    zIndex: '10',
  },

};

