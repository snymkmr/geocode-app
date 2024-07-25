const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');
require('dotenv').config();

// Debug: Print the subscription key to verify it's being loaded
//console.log('Azure Maps Subscription Key:', process.env.AZURE_MAPS_SUBSCRIPTION_KEY);

const subscriptionKey = process.env.AZURE_MAPS_SUBSCRIPTION_KEY;

let postalCode;

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
            for (const result of response.data.results) {
                if (result.address) {
                    //console.log('Full response:', JSON.stringify(response.data, null, 2));

                    if (response.data.results[0].address.extendedPostalCode && (response.data.results[0].address.countryCode == 'CA' || response.data.results[0].address.countryCode == 'GB')) {
                        postalCode = response.data.results[0].address.extendedPostalCode;
                    } else if (result.address.postalCode) {
                        postalCode = response.data.results[0].address.postalCode
                    }
                    if (postalCode) break;
                }
            }

            if (postalCode == undefined) {
                console.log('Full response:', JSON.stringify(response.data, null, 2));
                postalCode = 'Not Found'
            }
            return postalCode;
        } else {
            throw new Error('No results found');
        }
    } catch (error) {
        console.error(`Error fetching postal code for address "${address}":`, error.message);
        return null;
    }
}

async function processCsv() {
    const addresses = [];

    fs.createReadStream(path.join(__dirname, 'addresses.csv'))
        .pipe(csv())
        .on('data', (row) => {
            const address = `${row['Street Address']}, ${row.City}, ${row.State}, ${row['Country Code']}`;
            addresses.push(address);
        })
        .on('end', async () => {
            console.log('CSV file successfully processed.');
            for (const address of addresses) {
                const postalCode = await getPostalCode(address);
                console.log(`Address: ${address} \nPostal Code: ${postalCode}`);
            }
        });
}
processCsv();