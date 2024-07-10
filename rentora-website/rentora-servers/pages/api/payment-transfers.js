// pages/api/payment-transfers.js
import braintree from 'braintree';
import NextCors from 'nextjs-cors';

export default async function handler(req, res) {

    await NextCors(req, res, {
        // Options
        methods: ['GET', 'POST'],
        origin: '*', // Specify the requesting origins you want to allow, or use '*' to allow all
        optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
    });
    
  // Initialize Braintree gateway
  const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox, // Use Sandbox for testing
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
  });

  // Determine action based on query parameter
  switch (req.query.action) {
    case 'generateToken':
      try {
        const response = await gateway.clientToken.generate({});
        res.status(200).json({ token: response.clientToken });
      } catch (error) {
        res.status(500).json({ error: error.message, where: "Generating token" });
      }
      break;
    case 'checkout':
      try {
        const { nonce, amount } = req.body;
        const result = await gateway.transaction.sale({
          amount: amount,
          paymentMethodNonce: nonce,
          options: {
            submitForSettlement: true
          }
        });
        if (result.success) {
          res.status(200).json({ data: result.transaction });
        } else {
          res.status(500).json({ error: result.message });
        }
      } catch (error) {
        res.status(500).json({ error: error.message, where: "Processing checkout" });
      }
      break;
    default:
      res.status(400).json({ error: 'Invalid action' });
  }
}
