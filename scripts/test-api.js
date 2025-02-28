// Simple script to test the token search API
const fetch = require('node-fetch');

async function testTokenSearchAPI() {
  try {
    console.log('Testing token search API...');
    const response = await fetch('http://localhost:3002/api/token/search?query=bitcoin');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    const text = await response.text();
    console.log('Response text:', text);

    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', json);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testTokenSearchAPI();
