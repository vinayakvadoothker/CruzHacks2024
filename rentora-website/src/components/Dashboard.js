import React from 'react';
import { SignedIn } from '@clerk/clerk-react';
import './Dashboard.css'; // Import the CSS file

const Dashboard = ({ onClose }) => {
  return (
    <SignedIn>
      <div className="dashboard-container">
        <div className="analytics-section">
          <h2>Please Choose a Tab To Be Directed To</h2>
          {/* Place your AnalyticsComponent here */}
        </div>
        </div>
    </SignedIn>
  );
};

export default Dashboard;
