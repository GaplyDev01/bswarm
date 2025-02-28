#!/usr/bin/env node

/**
 * BlockSwarms Deployment Verification Script
 * This script performs pre-deployment checks to ensure the application is ready for production.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🔍 BlockSwarms Deployment Verification\n');

// Track issues found
const issues = [];
let envMissing = false;

// Check for .env.local file
console.log('Checking environment variables...');
if (!fs.existsSync(path.join(process.cwd(), '.env.local'))) {
  console.log('❌ .env.local file is missing');
  console.log('   Create a .env.local file based on .env.example');
  envMissing = true;
  issues.push('Missing .env.local file');
} else {
  console.log('✅ .env.local file exists');
  
  // Check critical environment variables
  const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
  const criticalVars = [
    'GROQ_API_KEY',
    'NEXT_PUBLIC_SOLANA_RPC_URL'
  ];
  
  for (const variable of criticalVars) {
    if (!envFile.includes(`${variable}=`) || envFile.includes(`${variable}=\n`)) {
      console.log(`❌ Missing ${variable} in .env.local`);
      issues.push(`Missing ${variable} in .env.local`);
    }
  }
}

// Check package.json for dependency issues
console.log('\nChecking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  console.log('✅ package.json is valid JSON');
  
  // Check for scripts
  if (!packageJson.scripts || !packageJson.scripts.build || !packageJson.scripts.start) {
    console.log('❌ Missing required scripts in package.json');
    issues.push('Missing required scripts in package.json');
  } else {
    console.log('✅ Required scripts exist in package.json');
  }
  
  // Check for outdated dependencies (optional)
  try {
    console.log('\nChecking for outdated dependencies (this may take a moment)...');
    const outdated = execSync('npm outdated --json', { stdio: ['pipe', 'pipe', 'ignore'] });
    const outdatedDeps = JSON.parse(outdated.toString());
    
    if (Object.keys(outdatedDeps).length > 0) {
      console.log(`⚠️ Found ${Object.keys(outdatedDeps).length} outdated dependencies`);
      issues.push('Outdated dependencies found');
    } else {
      console.log('✅ All dependencies are up to date');
    }
  } catch (e) {
    // This will fail if there are outdated dependencies
    console.log('⚠️ Some dependencies may be outdated');
    issues.push('Outdated dependencies found');
  }
} catch (error) {
  console.log('❌ Error parsing package.json');
  issues.push('Invalid package.json');
}

// Verify the build works
if (!envMissing) {
  console.log('\nVerifying build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful');
  } catch (error) {
    console.log('❌ Build failed');
    issues.push('Build failed');
  }
}

// Report results
console.log('\n📊 Verification Summary:');
if (issues.length === 0) {
  console.log('\n✅ All checks passed! Your application is ready for deployment.');
} else {
  console.log(`\n❌ Found ${issues.length} issues that need to be addressed before deployment:`);
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
}

console.log('\n');
