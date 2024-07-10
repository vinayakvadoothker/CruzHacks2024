import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ResidencyPaymentTransfer = () => {
  const navigate = useNavigate();
  const [clientToken, setClientToken] = useState('');
  const [loading, setLoading] = useState(true);  // To handle loading state

  useEffect(() => {
    console.log('Component mounted, fetching client token...');
    fetchClientToken();
  }, []);

  const fetchClientToken = async () => {
    setLoading(true);  // Start loading
    try {
      const res = await fetch('http://localhost:3000/api/payment-transfers?action=generateToken');
      const data = await res.json();
      if (data.token) {
        console.log('Client token received:', data.token);
        setClientToken(data.token);
        setLoading(false);  // Stop loading after token is received
      } else {
        throw new Error('No token received from the response');
      }
    } catch (error) {
      console.error('Error fetching client token:', error);
      setLoading(false);  // Ensure loading is false on error
    }
  };

  const handlePaymentTransfer = async () => {
    console.log('Initiating payment transfer...');
    const nonce = 'fake-valid-nonce';  // Example nonce, replace with actual nonce from your payment UI
    const amount = '10.00';  // Example amount, adjust as necessary

    try {
      const response = await fetch('http://localhost:3000/api/payment-transfers?action=checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nonce, amount }),
      });
      const result = await response.json();
      if (result.data) {
        console.log('Payment successful:', result.data);
        // Uncomment the next line to navigate on success
        // navigate('/success-page');
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment transfer failed:', error);
    }
  };

  return (
    <div>
      <h1>Payment Transfer</h1>
      {loading ? (
        <p>Loading payment details...</p>
      ) : (
        <button onClick={handlePaymentTransfer} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Transfer Payment
        </button>
      )}
    </div>
  );
};

export default ResidencyPaymentTransfer;
