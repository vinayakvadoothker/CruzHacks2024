import React, { useState } from 'react';

const ApplyPopup = () => {
    // State for user selections and inputs within the popup
    const [selectedRoommates, setSelectedRoommates] = useState([]);
    const [selectedMoveInDate, setSelectedMoveInDate] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');

    // Function to handle user selections for roommates
    const handleRoommateSelection = (roomId) => {
        // Toggle the selection of roommates
        if (selectedRoommates.includes(roomId)) {
            setSelectedRoommates(selectedRoommates.filter(id => id !== roomId));
        } else {
            setSelectedRoommates([...selectedRoommates, roomId]);
        }
    };

    // Function to handle submitting the application
    const handleSubmit = () => {
        // Implement logic for submitting the application and making payment
        // You can use the selectedRoommates, selectedMoveInDate, and paymentAmount here
        // For simplicity, we'll just log the selected data for demonstration purposes
        console.log('Selected Roommates:', selectedRoommates);
        console.log('Selected Move-In Date:', selectedMoveInDate);
        console.log('Payment Amount:', paymentAmount);

        // Close the popup (you can implement this as needed)
    };

    return (
        <div className="apply-popup">
            <h2>Apply for Off-Campus Housing</h2>

            {/* Roommate selection */}
            <div>
                <h3>Choose Roommates:</h3>
                <label>
                    <input
                        type="checkbox"
                        value="roommate1"
                        checked={selectedRoommates.includes('roommate1')}
                        onChange={() => handleRoommateSelection('roommate1')}
                    />
                    Roommate 1
                </label>
                <label>
                    <input
                        type="checkbox"
                        value="roommate2"
                        checked={selectedRoommates.includes('roommate2')}
                        onChange={() => handleRoommateSelection('roommate2')}
                    />
                    Roommate 2
                </label>
                {/* Add more roommate options as needed */}
            </div>

            {/* Move-in date selection */}
            <div>
                <h3>Select Move-In Date:</h3>
                <input
                    type="date"
                    value={selectedMoveInDate}
                    onChange={(e) => setSelectedMoveInDate(e.target.value)}
                />
            </div>

            {/* Payment */}
            <div>
                <h3>Payment Amount:</h3>
                <input
                    type="text"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                />
            </div>

            {/* Submit button */}
            <button onClick={handleSubmit}>Submit Application</button>
        </div>
    );
};

export default ApplyPopup;
