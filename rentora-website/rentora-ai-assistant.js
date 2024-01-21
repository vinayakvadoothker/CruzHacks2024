const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors'); // Import the cors middleware
const app = express();

app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: '*', // Allow requests from any origin (for development only)
  credentials: true, // Enable credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 200, // Set the response status for preflight requests to 200
};

app.use(cors(corsOptions)); // Use CORS middleware

console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY);
// Endpoint to handle chat messages
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        "role": "system",
                        "content": "User Interaction Style: Keep responses concise and straightforward. Ask Questions One-By-One. Information Gathering Process: Begin by greeting the user and briefly explaining how you can assist them with their housing needs. Use a step-by-step questioning approach to gather the necessary information before proceeding to the next question. Questions to Ask: Number of Roommates, 'How many roommates will you be living with?' For every 2 roommates, suggest 1 bedroom. For every 3 roommates, suggest 1 bathroom. Distance from Campus, 'How far would you like to be from campus? You can say Close, Moderate, or Dont Care. Style of Housing: Budget: 'What is your budget per person for rent? You can choose from $800-1200, $1200-1400, or $1400-2000.' Logic: Calculate the total monthly rent and divide by the number of people in the household (user + roommates). Response Formulation: Based on the user's answers, formulate a response that combines all the gathered information to suggest suitable housing options. Find the right rental for the user. Example: 'Based on your preferences for 2 roommates, wanting to be close to campus, an interest in townhomes, and a budget of $1200-1400 per person, here are a few housing options that might suit you...' Offer to answer any further questions related to renting, such as lease agreements, utilities, or area amenities. If the user's requirements are very specific or if no suitable options are available, advise them on how to adjust their preferences or offer to perform a more detailed search."
                      },
                      {
                        "role": "system",
                        "content": "Here are the property listings:"
                      },
                      {
                        "role": "system",
                        "content": "1) Address: 1230 Broadway, Santa Cruz, CA, USA. Bathrooms: 1, Bedrooms: 2, Description: Its the best, Price: $2000, Size: 788 sqft."
                      },
                      {
                        "role": "system",
                        "content": "2) Address: 435 Meder Street, Santa Cruz, CA, USA. Bathrooms: 4, Bedrooms: 4, Description: Beautiful Home By Campus, Price: $8000, Size: 2100 sqft."
                      },
                      {
                        "role": "system",
                        "content": "3) Address: 444 May Avenue, Santa Cruz, CA, USA. Bathrooms: 2, Bedrooms: 2, Description: This is the perfect fit, Price: $2600, Size: 1400 sqft."
                      },
                      {
                        "role": "system",
                        "content": "4) Address: 938 Waffle Street Southeast, Palm Bay, FL, USA. Bathrooms: 1.5, Bedrooms: 4, Description: Smells pretty nice, Price: $4500, Size: 1500 sqft."
                      },
                      {
                        "role": "user",
                        "content": userMessage
                      }
                      
                ]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to communicate with OpenAI API');
        }

        const aiResponse = await response.json();
        res.json(aiResponse);
    } catch (error) {
        console.error('Error fetching from OpenAI:', error);
        res.status(500).json({ message: "Failed to communicate with OpenAI API", errorDetails: error.toString() });
    }
});


const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));