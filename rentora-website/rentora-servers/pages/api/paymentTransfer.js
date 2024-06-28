const axios = require('axios');

async function transferMoney(payload) {
  // Destructure necessary data from payload
  const { amount, currency, recipientAccount, recipientName, recipientType } = payload;

  // Set your Wise API credentials
  const apiToken = '92d285ac-a6e3-45e2-9010-0cc12d775bbc'; // replace w environmental variable later, need to use sandbox specific API key for dev
  const baseURL = 'https://api.sandbox.transferwise.tech'; // sandbox api for wise (testing purposes), production url is : https://api.transferwise.com

  // Set up Axios instance with Wise API base URL and headers
  const wiseAPI = axios.create({
    baseURL: baseURL,
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    }
  });

  try {
    // Step 1: Create a quote
    const quoteResponse = await wiseAPI.post('/v1/quotes', {
      sourceCurrency: currency,
      targetCurrency: currency,
      sourceAmount: amount
    });
    const quoteId = quoteResponse.data.id;

    // Step 2: Create a recipient
    const recipientResponse = await wiseAPI.post('/v1/accounts', {
      currency: currency,
      type: recipientType,  // 'sort_code' for UK, 'aba' for US, etc.
      profile: 'your-profile-id', // replace with your profile ID
      details: {
        legalType: 'PRIVATE',
        sortCode: recipientAccount.sortCode,  // Adjust field names based on recipient type
        accountNumber: recipientAccount.accountNumber,
        accountHolderName: recipientName
      }
    });
    const recipientId = recipientResponse.data.id;

    // Step 3: Create a transfer
    const transferResponse = await wiseAPI.post('/v1/transfers', {
      targetAccount: recipientId,
      quote: quoteId,
      customerTransactionId: 'unique-transaction-id',  // you can generate a unique ID
      details: {
        reference: 'Payment reference',
        transferPurpose: 'verification.transfers.purpose.other',
        sourceOfFunds: 'verification.source.of.funds.other'
      }
    });

    // Step 4: Fund the transfer
    const transferId = transferResponse.data.id;
    const fundResponse = await wiseAPI.post(`/v1/transfers/${transferId}/payments`, {
      type: 'BALANCE'
    });

    console.log('Transfer successful:', fundResponse.data);
    return fundResponse.data;
  } catch (error) {
    console.error('Error during transfer:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Example payload for a domestic transfer within the US
const payload = {
  amount: 1000,
  currency: 'USD',
  recipientAccount: {
    sortCode: '123456',  // Sort code for UK, ABA routing number for US
    accountNumber: '12345678'
  },
  recipientName: 'John Doe',
  recipientType: 'aba'  // Use 'sort_code' for UK, 'aba' for US, etc.
};

transferMoney(payload)
  .then(response => console.log(response))
  .catch(error => console.error(error));
