import fetch from 'node-fetch';
import { config } from 'dotenv';
config({ path: 'env/token.env' }); 


let accessToken = null;
const AUTH_URL = 'http://20.244.56.144/evaluation-service/auth';
const STOCKS_URL = 'http://20.244.56.144/evaluation-service/stocks';


async function fetchAccessToken() {
  const authPayload = {
    email: process.env.EMAIL || '',
    name: process.env.NAME || '',
    rollNo: process.env.ROLL_NO || '',
    accessCode: process.env.ACCESS_CODE || '',
    clientID: process.env.CLIENT_ID || '',
    clientSecret: process.env.CLIENT_SECRET || '',
  };

  const requiredFields = ['email', 'name', 'rollNo', 'accessCode', 'clientID', 'clientSecret'];
  const missingFields = requiredFields.filter(field => !authPayload[field]);
  if (missingFields.length > 0) {
    console.error('Missing required environment variables:', missingFields);
    return null;
  }

  try {
    console.log('Auth request payload:', authPayload);
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authPayload),
    });

    const responseBody = await response.text();
    console.log('Auth response:', { status: response.status, body: responseBody });

    if (!response.ok) {
      throw new Error(`Auth failed: ${response.status} ${response.statusText} - ${responseBody}`);
    }

    const data = JSON.parse(responseBody);
    if (!data.access_token) {
      console.error('No access_token received from auth endpoint:', data);
      return null;
    }

    accessToken = data.access_token;
    return accessToken;
  } catch (error) {
    console.error('Error fetching access token:', error.message);
    return null;
  }
}

export async function getStockData(ticker, min) {
  if (!accessToken) {
    accessToken = await fetchAccessToken();
    if (!accessToken) {
      console.error(`Failed to authenticate for ${ticker}`);
      return null;
    }
  }

  const url = `${STOCKS_URL}/${ticker}?minutes=${min}`;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  };

  try {
    console.log(`Stock request for ${ticker}:`, { url, headers: options.headers });
    const response = await fetch(url, options);
    const responseBody = await response.text();
    console.log(`Stock response for ${ticker}:`, { status: response.status, body: responseBody });

    if (response.status === 401) {
      accessToken = await fetchAccessToken();
      if (!accessToken) {
        console.error(`Failed to refresh token for ${ticker}`);
        return null;
      }
      options.headers['Authorization'] = `Bearer ${accessToken}`;
      return getStockData(ticker, min);
    }

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText} - ${responseBody}`);
    }

    let data;
    try {
      data = JSON.parse(responseBody);
    } catch (error) {
      console.error(`Invalid JSON response for ${ticker}:`, responseBody);
      return null;
    }

    let prices = [];
    if (Array.isArray(data)) {
      prices = data.map(item => ({
        price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
      }));
    } else if (data.data && Array.isArray(data.data)) {
      prices = data.data.map(item => ({
        price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
      }));
    } else if (data.prices && Array.isArray(data.prices)) {
      prices = data.prices.map(item => ({
        price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
      }));
    } else {
      console.error(`Invalid data format for ${ticker}:`, data);
      return null;
    }

    if (prices.length === 0) {
      console.error(`No stock data available for ${ticker} with minutes=${min}`);
      return null;
    }

    return prices;
  } catch (error) {
    console.error(`Error fetching stock data for ${ticker}:`, error.message);
    return null;
  }
}