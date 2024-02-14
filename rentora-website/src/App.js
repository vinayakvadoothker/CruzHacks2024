// App.js
import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, useClerk } from '@clerk/clerk-react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import ChatBot from './ChatBot'; // Import your ChatBot component
import Dashboard from './components/Dashboard'; // Import Dashboard component
import OnboardingPage from './components/OnboardingPage'; // Import OnboardingPage component
import BuyPage from './components/BuyPage'; // Import BuyPage component
import RentPage from './components/RentPage'; // Import RentPage component
import ForAllPage from './components/Rent Pages/ForAllPage';
import OffCampusPage from './components/Rent Pages/OffCampusPage';
import VenturePage from './components/VenturePage'; // Import VenturePage component
import ProfilePage from './components/ProfilePage'; // Import ProfilePage component
import GuarantorForm from './components/Rent Pages/OffCampusFormSteps/GuarantorForm'; // Import GuarantorForm component
import AddOffCampusListing from './components/Rent Pages/OffCampusFormSteps/AddOffCampusListing'; // Import AddOffCampusListing component
import OffCampusApplications from './components/Rent Pages/OffCampusFormSteps/OffCampusApplications';

import './App.css';

if (!process.env.REACT_APP_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const openaikey = process.env.OPENAI_API_KEY;

const Header = () => {
  const { user, signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
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
      <ul>
        <li>
          <Link to="/buy">Buy</Link>
        </li>
        <li>
          <Link to="/rent/off-campus">Rent</Link>
        </li>
        <li>
          <Link to="/venture">Venture</Link>
        </li>
        <SignedIn>
          <li
            style={styles.profileContainer}
            onMouseEnter={showDropdown}
            onMouseLeave={hideDropdown}
          >
            {/* Profile tab */}
            <Link to="/profile">
              <img src={user?.imageUrl} alt="Profile" style={styles.profileImage} />
              <span style={styles.profileText}></span>
            </Link>
            {/* Profile picture dropdown */}
            <div id="profileDropdown" style={styles.dropdownContent}>
              {/* Profile tab */}
              <div style={styles.dropdownItem} onClick={() => { window.location.href = '/profile'; }}>
                <span style={styles.cursorPointer}>Profile</span>
              </div>
              {/* Sign Out option */}
              <div style={styles.dropdownItem} onClick={() => { handleSignOut(); window.location.href = '/onboarding'; }}>
                <span style={styles.cursorPointer}>Sign Out</span>
              </div>
            </div>
          </li>
        </SignedIn>
      </ul>
    </nav>
  );
};



const RentHeader = () => {
  const showOffCampusDropdown = () => {
    const offCampusDropdown = document.getElementById('offCampusDropdown');
    if (offCampusDropdown) {
      offCampusDropdown.style.display = 'block';
    }
  };

  const hideOffCampusDropdown = () => {
    const offCampusDropdown = document.getElementById('offCampusDropdown');
    if (offCampusDropdown) {
      offCampusDropdown.style.display = 'none';
    }
  };

  return (
    <nav style={{ backgroundColor: 'transparent', padding: '0' }}>
      <ul style={styles.list}>
        <li style={styles.offCampusContainer} onMouseEnter={showOffCampusDropdown} onMouseLeave={hideOffCampusDropdown}>
          <div className="dropdown">
            <Link to="/rent/off-campus">Off-Campus</Link>
            <div id="offCampusDropdown" style={styles.dropdownContent}>
              <span style={styles.icon}>🏠</span>
              <Link to="/rent/off-campus" style={styles.myApplicationsLink}>
                Listings
              </Link>
              <div>
              </div>
              <span style={styles.icon}>📄</span>
              <Link to="/rent/off-campus/myapplications" style={styles.myApplicationsLink}>
                My Applications
              </Link>
            </div>
          </div>
        </li>
        <li>
          <Link to="/rent/for-all">For-All</Link>
        </li>
      </ul>
    </nav>

  );
};

const Home = () => {
  const { session } = useClerk();

  // Redirect to the dashboard if the user is signed in
  if (session && session.user) {
    return <Navigate to="/dashboard" />;
  }

  return <OnboardingPage />;
};

const App = () => {

  return (
    <div className="app-container">
      <ClerkProvider publishableKey={clerkPubKey} googleMapsApiKey={googleMapsApiKey}>
        <SignedIn>
          <Header />
          <ChatBot openaikey={openaikey} />
        </SignedIn>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/buy" element={<BuyPage />} />
          <Route path="/guarantor/:userid" element={<GuarantorForm />} />
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
            element={<SignedIn><Navigate to="/dashboard" replace /></SignedIn>}
          />
        </Routes>
        <Routes>
          <Route
            path="*"
            element={
              <SignedOut>
                {({ location }) =>
                  location.pathname.startsWith("/guarantor/") || location.pathname.startsWith("/onboarding") ? null : (
                    <Navigate to="/onboarding" replace />
                  )
                }
              </SignedOut>
            }
          />
        </Routes>
        <Routes>
          <Route
            path="/onboarding"
            element={<SignedIn><Navigate to="/dashboard" replace /></SignedIn>}
          />
        </Routes>
      </ClerkProvider>
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
  },
  profileImage: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
  },
  dropdownContent: {
    display: 'none',
    position: 'absolute',
    backgroundColor: 'rgba(249, 249, 249, 0.9)',
    minWidth: '130px',
    boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
    zIndex: 1,
    right: 0,
    top: '30px',
    borderRadius: '8px',
    opacity: 0.9,
  },
  dropdownItem: {
    padding: '12px 16px',
    display: 'block',
    textAlign: 'center',
    fontSize: '20px',
    fontFamily: 'monospace',
  },

  offCampusContainer: {
    position: 'relative',
    display: 'inline-block',
    width: '200px', // Adjust the width as needed
  },
  dropdown: {
    position: 'relative',
  },

  myApplicationsLink: {
    fontSize: '18px', // Adjust the font size as needed
    padding: '5px 10px', // Adjust the padding as needed
    display: 'block',
  },

};

