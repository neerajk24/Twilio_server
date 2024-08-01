// // xeroController.js

// import axios from "axios";
// import querystring from 'querystring';
// import dotenv from 'dotenv';
// import open from 'open';
// import { v4 as uuidv4 } from 'uuid';
// import { ListofUsers } from "../../Socket/socketHandlers.js";

// dotenv.config();

// const CLIENT_ID = process.env.XERO_CLIENT_ID;
// const CLIENT_SECRET = process.env.XERO_CLIENT_SECRET;
// const REDIRECT_URI = process.env.XERO_REDIRECT_URI;

// const AUTHORIZATION_URL = 'https://login.xero.com/identity/connect/authorize';
// const TOKEN_URL = 'https://identity.xero.com/connect/token';
// const CONNECTIONS_URL = 'https://api.xero.com/connections';
// const CONTACTS_URL = 'https://api.xero.com/api.xro/2.0/Contacts';

// let accessToken = null;
// let refreshToken = null;
// let tenantId = null;

// export const initiateAuth = () => {
//     const authUrl = `${AUTHORIZATION_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid profile email accounting.contacts offline_access&state=123`;
//     open(authUrl);
// };

// export const handleCallback = async (req, res) => {
//     const { code } = req.query;

//     try {
//         const tokenResponse = await axios.post(TOKEN_URL,
//             querystring.stringify({
//                 grant_type: 'authorization_code',
//                 code,
//                 redirect_uri: REDIRECT_URI
//             }),
//             {
//                 headers: {
//                     'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
//                     'Content-Type': 'application/x-www-form-urlencoded'
//                 }
//             }
//         );

//         accessToken = tokenResponse.data.access_token;
//         refreshToken = tokenResponse.data.refresh_token;
//         console.log("Refresh Token : " , refreshToken);

//         const connectionsResponse = await axios.get(CONNECTIONS_URL, {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         tenantId = connectionsResponse.data[0].tenantId;

//         res.send('Authorization successful. You can close this window.');
//     } catch (error) {
//         console.error('Error:', error.response ? error.response.data : error.message);
//         res.status(500).json({ error: 'An error occurred while processing your request.' });
//     }
// };

// export const getContacts = async (req, res) => {
//     if (!accessToken || !tenantId) {
//         return res.status(401).json({ error: 'Not authorized. Please restart the server to initiate authorization.' });
//     }

//     try {
//         const contactsResponse = await axios.get(CONTACTS_URL, {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Accept': 'application/json',
//                 'Xero-tenant-id': tenantId
//             }
//         });

//         const transformedContacts = contactsResponse.data.Contacts.map(contact => {
//             const mobilePhone = contact.Phones.find(phone => phone.PhoneType === 'MOBILE');
//             const phoneNumber = mobilePhone
//                 ? `${mobilePhone.PhoneCountryCode}${mobilePhone.PhoneNumber}`
//                 : '';

//             const addresses = contact.Addresses
//                 .filter(addr => ['STREET', 'POBOX'].includes(addr.AddressType))
//                 .map(addr => ({
//                     AddressType: addr.AddressType,
//                     AddressLine1: addr.AddressLine1,
//                     AddressLine2: addr.AddressLine2,
//                     City: addr.City,
//                     Region: addr.Region,
//                     PostalCode: addr.PostalCode,
//                     Country: addr.Country
//                 }));

//             return {
//                 name: contact.Name,
//                 phoneNumber: phoneNumber,
//                 caseId: contact.AccountNumber || uuidv4(),
//                 Email: contact.EmailAddress,
//                 startChat: false,
//                 Addresses: addresses
//             };
//         });

//         res.json(transformedContacts);
//     } catch (error) {
//         console.error('Error:', error.response ? error.response.data : error.message);
//         res.status(500).json({ error: 'An error occurred while fetching contacts.' });
//     }
// };

// export const updateAddress = async (req, res) => {
//     try {
//         const { formData, currentUser } = req.body;
//         // Fetch all contacts
//         const contactsResponse = await axios.get(CONTACTS_URL, {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 "Xero-Tenant-Id": tenantId,
//                 "Content-Type": "application/json",
//                 'Accept': "application/json",
//             },
//         });

//         const contacts = contactsResponse.data.Contacts;
//         // Log the name and account number for debugging
//         console.log("CurrentUser : ", currentUser);
//         console.log("formData : ", formData);

//         // Find the contact
//         const contact = contacts.find(
//             (c) =>
//                 c.Name.trim().toLowerCase() === currentUser.name.trim().toLowerCase() &&
//                 (c.accountNumber === "" || c.AccountNumber === currentUser.caseId)
//         );

//         if (!contact) {
//             return res.status(404).json({ message: "Contact not found", currentUser });
//         }

//         // Update the contact's address
//         const updatedContact = {
//             ...contact,
//             Addresses: [
//                 {
//                     AddressType: "STREET",
//                     AddressLine1: formData.AddressLine1,
//                     AddressLine2: formData.AddressLine2 || "",
//                     City: formData.City,
//                     Region: formData.Region,
//                     PostalCode: formData.PostalCode,
//                     Country: formData.Country,
//                 },
//                 {
//                     AddressType: "POBOX",
//                     AddressLine1: formData.AddressLine1,
//                     AddressLine2: formData.AddressLine2 || "",
//                     City: formData.City,
//                     Region: formData.Region,
//                     PostalCode: formData.PostalCode,
//                     Country: formData.Country,
//                 },
//             ],
//         };

//         // Send update request to Xero
//         await axios.post(
//             CONTACTS_URL,
//             { Contacts: [updatedContact] },
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     "Xero-Tenant-Id": tenantId,
//                     "Content-Type": "application/json",
//                     Accept: "application/json",
//                 },
//             }
//         );

//         res.status(200).json({ message: "Contact updated successfully" });
//     } catch (error) {
//         console.error(
//             "Error updating contact:",
//             error.response?.data || error.message
//         );
//         res.status(500).json({ message: "An error occurred. Check the console for details." });
//     }
// }

// xeroController.js

import axios from "axios";
import querystring from 'querystring';
import dotenv from 'dotenv';
import open from 'open';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const CLIENT_ID = process.env.XERO_CLIENT_ID;
const CLIENT_SECRET = process.env.XERO_CLIENT_SECRET;
const REDIRECT_URI = process.env.XERO_REDIRECT_URI;

const AUTHORIZATION_URL = 'https://login.xero.com/identity/connect/authorize';
const TOKEN_URL = 'https://identity.xero.com/connect/token';
const CONNECTIONS_URL = 'https://api.xero.com/connections';
const CONTACTS_URL = 'https://api.xero.com/api.xro/2.0/Contacts';

let accessToken = null;
let refreshToken = null;
let tenantId = null;
let tokenExpiresAt = null;

export const initiateAuth = () => {
    const authUrl = `${AUTHORIZATION_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid profile email accounting.contacts offline_access&state=123`;
    open(authUrl);
};

export const handleCallback = async (req, res) => {
    const { code } = req.query;

    try {
        const tokenResponse = await getTokenFromCode(code);
        setTokens(tokenResponse.data);

        const connectionsResponse = await axios.get(CONNECTIONS_URL, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        tenantId = connectionsResponse.data[0].tenantId;

        res.send('Authorization successful. You can close this window.');
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
};

const getTokenFromCode = async (code) => {
    return axios.post(TOKEN_URL,
        querystring.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI
        }),
        {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );
};

const refreshAccessToken = async () => {
    try {
        const response = await axios.post(TOKEN_URL,
            querystring.stringify({
                grant_type: 'refresh_token',
                client_id: CLIENT_ID,
                refresh_token: refreshToken
            }),
            {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        setTokens(response.data);
        console.log('Access token refreshed successfully');
    } catch (error) {
        console.error('Error refreshing token:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const setTokens = (tokenData) => {
    accessToken = tokenData.access_token;
    refreshToken = tokenData.refresh_token;
    tokenExpiresAt = Date.now() + tokenData.expires_in * 1000;
};

const isTokenValid = () => {
    return tokenExpiresAt && Date.now() < tokenExpiresAt;
};

const ensureValidToken = async () => {
    if (!isTokenValid()) {
        await refreshAccessToken();
    }
};

export const getContacts = async (req, res) => {
    try {
        await ensureValidToken();

        const contactsResponse = await axios.get(CONTACTS_URL, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Xero-tenant-id': tenantId
            }
        });

        const transformedContacts = contactsResponse.data.Contacts.map(contact => {
            const mobilePhone = contact.Phones.find(phone => phone.PhoneType === 'MOBILE');
            const phoneNumber = mobilePhone
                ? `${mobilePhone.PhoneCountryCode}${mobilePhone.PhoneNumber}`
                : '';

            const addresses = contact.Addresses
                .filter(addr => ['STREET', 'POBOX'].includes(addr.AddressType))
                .map(addr => ({
                    AddressType: addr.AddressType,
                    AddressLine1: addr.AddressLine1,
                    AddressLine2: addr.AddressLine2,
                    City: addr.City,
                    Region: addr.Region,
                    PostalCode: addr.PostalCode,
                    Country: addr.Country
                }));

            return {
                name: contact.Name,
                phoneNumber: phoneNumber,
                caseId: contact.AccountNumber || uuidv4(),
                Email: contact.EmailAddress,
                startChat: false,
                Addresses: addresses
            };
        });

        res.json(transformedContacts);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while fetching contacts.' });
    }
};

export const updateAddress = async (req, res) => {
    try {
        await ensureValidToken();

        const { formData, currentUser } = req.body;

        const contactsResponse = await axios.get(CONTACTS_URL, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                "Xero-Tenant-Id": tenantId,
                "Content-Type": "application/json",
                'Accept': "application/json",
            }
        });

        const contacts = contactsResponse.data.Contacts;
        console.log("CurrentUser : ", currentUser);
        console.log("formData : ", formData);

        const contact = contacts.find(
            (c) =>
                c.Name.trim().toLowerCase() === currentUser.name.trim().toLowerCase() &&
                (c.accountNumber === "" || c.AccountNumber === currentUser.caseId)
        );

        if (!contact) {
            return res.status(404).json({ message: "Contact not found", currentUser });
        }

        const updatedContact = {
            ...contact,
            Addresses: [
                {
                    AddressType: "STREET",
                    AddressLine1: formData.AddressLine1,
                    AddressLine2: formData.AddressLine2 || "",
                    City: formData.City,
                    Region: formData.Region,
                    PostalCode: formData.PostalCode,
                    Country: formData.Country,
                },
                {
                    AddressType: "POBOX",
                    AddressLine1: formData.AddressLine1,
                    AddressLine2: formData.AddressLine2 || "",
                    City: formData.City,
                    Region: formData.Region,
                    PostalCode: formData.PostalCode,
                    Country: formData.Country,
                },
            ],
        };

        await axios.post(
            CONTACTS_URL,
            { Contacts: [updatedContact] },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Xero-Tenant-Id": tenantId,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }
        );

        res.status(200).json({ message: "Contact updated successfully" });
    } catch (error) {
        console.error(
            "Error updating contact:",
            error.response?.data || error.message
        );
        res.status(500).json({ message: "An error occurred. Check the console for details." });
    }
};