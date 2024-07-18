const axios = require('axios');
require('dotenv').config();

// Debug: Print the subscription key to verify it's being loaded
//console.log('Azure Maps Subscription Key:', process.env.AZURE_MAPS_SUBSCRIPTION_KEY);

const subscriptionKey = process.env.AZURE_MAPS_SUBSCRIPTION_KEY;

async function getPostalCode(address) {
    const url = `https://atlas.microsoft.com/search/address/json`;
    try {
        const response = await axios.get(url, {
            params: {
                'api-version': '1.0',
                'subscription-key': subscriptionKey,
                query: address
            }
        });

        if (response.data && response.data.results && response.data.results.length > 0) {
            //console.log('Full response:', JSON.stringify(response.data, null, 2)); 
            const postalCode = response.data.results[0].address.extendedPostalCode;
            return postalCode;
        } else {
            throw new Error('No results found');
        }
    } catch (error) {
        console.error('Error fetching postal code:', error.message);
        console.error('Error response:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Example usage:
(async () => {
    try {
        const address = '5450 Bellaggio Cres, Mississauga';
        const postalCode = await getPostalCode(address);
        console.log('Postal Code:', postalCode);
    } catch (error) {
        console.error(error);
    }
})();