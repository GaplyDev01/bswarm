// Script to test the complete token search + token info workflow
const fetch = require('node-fetch');

async function testTokenWorkflow() {
  try {
    console.log('1. Testing token search API...');
    const searchResponse = await fetch('http://localhost:3002/api/token/search?query=bitcoin');
    console.log('Search response status:', searchResponse.status);

    const searchResults = await searchResponse.json();
    console.log('Search results:', JSON.stringify(searchResults, null, 2));

    if (searchResults.length === 0) {
      console.error('No search results found for "bitcoin"');
      return;
    }

    const tokenId = searchResults[0].id;
    console.log(`\n2. Testing token info API for token ID: ${tokenId}`);

    const infoResponse = await fetch(`http://localhost:3002/api/token/info?id=${tokenId}`);
    console.log('Info response status:', infoResponse.status);

    const tokenInfo = await infoResponse.json();
    console.log('Token info result:', JSON.stringify(tokenInfo, null, 2));

    console.log('\nWorkflow test completed successfully!');
  } catch (error) {
    console.error('Workflow test failed:', error);
  }
}

testTokenWorkflow();
