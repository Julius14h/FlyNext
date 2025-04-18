import fetch from 'node-fetch';

const URL = 'https://advanced-flights-system.replit.app/api';
const API_KEY = process.env.AFS_API_KEY;

export const build_query = (args: object): string => {
    const params = new URLSearchParams();
    Object.entries(args).forEach( e => {
        const [key, val] = e;
        if (val) params.append(key, val)
    })   
    return "?" + params.toString()
}

export const send_request = async (endpoint: string, init = {}): Promise<any> => {
    try {
        // Ensure API key is available
        if (!API_KEY) {
            console.error('AFS_API_KEY is not set in environment variables');
            throw new Error('API key is missing');
        }

        // Construct the full URL
        const fullUrl = URL + endpoint;
        console.log(`Sending request to: ${fullUrl}`);

        // Make the request with proper headers
        const response = await fetch(
            fullUrl, 
            {
                ...init, 
                headers: { 
                    'x-api-key': API_KEY,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        // Check if response is OK
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API request failed with status ${response.status}: ${errorText}`);
            throw new Error(`API request failed with status ${response.status}`);
        }

        // Parse and return the JSON response
        return await response.json();
    } catch (error) {
        console.error('Error in send_request:', error);
        throw error;
    }
}



