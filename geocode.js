const axios = require('axios');
require('dotenv').config();

// Debug: Print the subscription key to verify it's being loaded
//console.log('Azure Maps Subscription Key:', process.env.AZURE_MAPS_SUBSCRIPTION_KEY);

const getAddressPostalCode = async (address) => {
    const subscriptionKey = process.env.AZURE_MAPS_SUBSCRIPTION_KEY;
    const apiUrl = `https://atlas.microsoft.com/search/address/json?api-version=1.0&subscription-key=${subscriptionKey}&query=${encodeURIComponent(address)}`;

    try {
        const response = await axios.get(apiUrl, { timeout: 5000 });

        if (response.status !== 200) {
            throw new Error(`Error: Received status code ${response.status}`);
        }

        const results = response.data.results;

        if (results && results.length > 0) {
            const postalCodeComponent = results[0].address.postalCode;
            if (postalCodeComponent) {
                return postalCodeComponent;
            } else {
                throw new Error('No postal code found for the given address.');
            }
        } else {
            throw new Error('No results found for the given address.');
        }
    } catch (error) {
        console.error('Error fetching postal code:', error.message);
        return null;
    }
};

(async () => {
    const address = '1600 Amphitheatre Parkway, Mountain View, CA';
    const postalCode = await getAddressPostalCode(address);
    console.log(`Postal code for "${address}" is:`, postalCode);
})();
