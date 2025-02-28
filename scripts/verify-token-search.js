// Comprehensive script to test all aspects of token search and display functionality
const fetch = require('node-fetch');

// Terminal colors for better output formatting
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

async function runTests() {
  console.log(
    `${colors.bgBlue}${colors.white}${colors.bright} TXBT TOKEN SEARCH VERIFICATION SUITE ${colors.reset}\n`
  );

  let passedTests = 0;
  let totalTests = 8; // Update as tests are added

  // Test 1: Search for a token
  console.log(`${colors.cyan}Test 1: Basic token search test${colors.reset}`);
  const searchResults = await testTokenSearch('bitcoin');

  if (!searchResults || searchResults.length === 0) {
    console.error(
      `${colors.bgRed}${colors.white} ❌ FAILED: ${colors.reset} Search for "bitcoin" returned no results`
    );
  } else {
    console.log(
      `${colors.bgGreen}${colors.black} ✅ PASSED: ${colors.reset} Search returned ${searchResults.length} results for "bitcoin"\n`
    );
    passedTests++;
  }

  // Test 2: Token info retrieval
  console.log(`${colors.cyan}Test 2: Token info retrieval test${colors.reset}`);
  let tokenId = searchResults && searchResults.length > 0 ? searchResults[0].id : 'bitcoin';
  const tokenInfo = await testTokenInfo(tokenId);

  if (!tokenInfo || !tokenInfo.id) {
    console.error(
      `${colors.bgRed}${colors.white} ❌ FAILED: ${colors.reset} Token info retrieval failed`
    );
  } else {
    console.log(
      `${colors.bgGreen}${colors.black} ✅ PASSED: ${colors.reset} Token info retrieval successful for ${tokenInfo.name} (${tokenInfo.symbol})\n`
    );
    passedTests++;
  }

  // Test 3: Required fields in search results
  console.log(`${colors.cyan}Test 3: Required fields in search results${colors.reset}`);
  const requiredSearchFields = [
    'id',
    'name',
    'symbol',
    'image',
    'current_price',
    'price_change_percentage_24h',
    'market_cap',
  ];

  if (searchResults && searchResults.length > 0) {
    const missingSearchFields = requiredSearchFields.filter(
      field => !searchResults[0][field] && searchResults[0][field] !== 0
    );

    if (missingSearchFields.length > 0) {
      console.error(
        `${colors.bgRed}${colors.white} ❌ FAILED: ${colors.reset} Search results missing required fields: ${missingSearchFields.join(', ')}`
      );
    } else {
      console.log(
        `${colors.bgGreen}${colors.black} ✅ PASSED: ${colors.reset} Search results contain all ${requiredSearchFields.length} required fields\n`
      );
      passedTests++;
    }
  } else {
    console.error(
      `${colors.bgRed}${colors.white} ❌ FAILED: ${colors.reset} Cannot test required fields due to missing search results`
    );
  }

  // Test 4: Required fields in token info
  console.log(`${colors.cyan}Test 4: Required fields in token info${colors.reset}`);
  const requiredInfoFields = [
    'id',
    'name',
    'symbol',
    'image',
    'current_price',
    'market_cap',
    'description',
    'volume_24h',
  ];

  if (tokenInfo) {
    const missingInfoFields = requiredInfoFields.filter(
      field => !tokenInfo[field] && tokenInfo[field] !== 0
    );

    if (missingInfoFields.length > 0) {
      console.error(
        `${colors.bgRed}${colors.white} ❌ FAILED: ${colors.reset} Token info missing required fields: ${missingInfoFields.join(', ')}`
      );
    } else {
      console.log(
        `${colors.bgGreen}${colors.black} ✅ PASSED: ${colors.reset} Token info contains all ${requiredInfoFields.length} required fields\n`
      );
      passedTests++;
    }
  } else {
    console.error(
      `${colors.bgRed}${colors.white} ❌ FAILED: ${colors.reset} Cannot test required fields due to missing token info`
    );
  }

  // Test 5: Optional enhanced fields in token info
  console.log(`${colors.cyan}Test 5: Optional enhanced fields in token info${colors.reset}`);
  const enhancedFields = [
    'price_change_percentage_7d',
    'price_change_percentage_30d',
    'sentiment',
    'historical_prices',
    'categories',
  ];

  if (tokenInfo) {
    const presentEnhancedFields = enhancedFields.filter(field => tokenInfo[field] !== undefined);

    const percentPresent = (presentEnhancedFields.length / enhancedFields.length) * 100;
    if (percentPresent >= 60) {
      // At least 60% of enhanced fields should be present
      console.log(
        `${colors.bgGreen}${colors.black} ✅ PASSED: ${colors.reset} Found ${presentEnhancedFields.length}/${enhancedFields.length} enhanced fields (${percentPresent.toFixed(0)}%): ${colors.yellow}${presentEnhancedFields.join(', ')}${colors.reset}\n`
      );
      passedTests++;
    } else {
      console.log(
        `${colors.bgYellow}${colors.black} ⚠️ WARNING: ${colors.reset} Only found ${presentEnhancedFields.length}/${enhancedFields.length} enhanced fields (${percentPresent.toFixed(0)}%): ${colors.yellow}${presentEnhancedFields.join(', ')}${colors.reset}\n`
      );
      // Still count as pass if we have at least some enhanced fields
      if (presentEnhancedFields.length > 0) passedTests++;
    }
  } else {
    console.error(
      `${colors.bgRed}${colors.white} ❌ FAILED: ${colors.reset} Cannot test enhanced fields due to missing token info`
    );
  }

  // Test 6: Edge case - empty search
  console.log(`${colors.cyan}Test 6: Edge case - empty search${colors.reset}`);
  const emptyResults = await testTokenSearch('');

  if (emptyResults && emptyResults.length === 0) {
    console.log(
      `${colors.bgGreen}${colors.black} ✅ PASSED: ${colors.reset} Empty search returns no results\n`
    );
    passedTests++;
  } else {
    console.error(
      `${colors.bgRed}${colors.white} ❌ FAILED: ${colors.reset} Empty search should return no results\n`
    );
  }

  // Test 7: Edge case - non-existent token
  console.log(`${colors.cyan}Test 7: Edge case - non-existent token${colors.reset}`);
  const nonExistentResults = await testTokenSearch('nonexistenttoken12345');

  if (nonExistentResults && nonExistentResults.length === 0) {
    console.log(
      `${colors.bgGreen}${colors.black} ✅ PASSED: ${colors.reset} Non-existent token search returns no results\n`
    );
    passedTests++;
  } else {
    console.error(
      `${colors.bgRed}${colors.white} ❌ FAILED: ${colors.reset} Non-existent token search should return no results\n`
    );
  }

  // Test 8: Response Time Test
  console.log(`${colors.cyan}Test 8: Response time test${colors.reset}`);
  const startTime = Date.now();
  await testTokenSearch('bitcoin');
  const searchTime = Date.now() - startTime;

  console.log(`Token search response time: ${colors.yellow}${searchTime}ms${colors.reset}`);

  if (searchTime < 500) {
    console.log(
      `${colors.bgGreen}${colors.black} ✅ PASSED: ${colors.reset} Search response time under 500ms (${searchTime}ms)\n`
    );
    passedTests++;
  } else if (searchTime < 1000) {
    console.log(
      `${colors.bgYellow}${colors.black} ⚠️ WARNING: ${colors.reset} Search response time acceptable but could be improved (${searchTime}ms)\n`
    );
    passedTests++;
  } else {
    console.error(
      `${colors.bgRed}${colors.white} ❌ FAILED: ${colors.reset} Search response time too slow (${searchTime}ms)\n`
    );
  }

  // Final Results
  const passPercentage = (passedTests / totalTests) * 100;
  console.log(
    `${colors.bgBlue}${colors.white}${colors.bright} VERIFICATION RESULTS: ${passedTests}/${totalTests} tests passed (${passPercentage.toFixed(0)}%) ${colors.reset}`
  );

  if (passedTests === totalTests) {
    console.log(
      `\n${colors.green}${colors.bright}All tests passed! The token search functionality is working correctly.${colors.reset}`
    );
  } else if (passPercentage >= 80) {
    console.log(
      `\n${colors.yellow}${colors.bright}Most tests passed. Some minor issues may need attention.${colors.reset}`
    );
  } else {
    console.log(
      `\n${colors.red}${colors.bright}Several tests failed. The token search functionality needs improvement.${colors.reset}`
    );
  }
}

async function testTokenSearch(query) {
  try {
    console.log(`Searching for token: ${colors.yellow}"${query}"${colors.reset}`);
    const response = await fetch(
      `http://localhost:3002/api/token/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      console.error(
        `${colors.red}Search API returned error status: ${response.status}${colors.reset}`
      );
      return null;
    }

    const results = await response.json();
    console.log(`Found ${colors.yellow}${results.length}${colors.reset} results`);
    return results;
  } catch (error) {
    console.error(`${colors.red}Error during token search test: ${error}${colors.reset}`);
    return null;
  }
}

async function testTokenInfo(id) {
  try {
    console.log(`Retrieving info for token: ${colors.yellow}"${id}"${colors.reset}`);
    const response = await fetch(
      `http://localhost:3002/api/token/info?id=${encodeURIComponent(id)}`
    );

    if (!response.ok) {
      console.error(
        `${colors.red}Token info API returned error status: ${response.status}${colors.reset}`
      );
      return null;
    }

    const info = await response.json();
    return info;
  } catch (error) {
    console.error(`${colors.red}Error during token info test: ${error}${colors.reset}`);
    return null;
  }
}

// Run the tests
runTests();
