#!/usr/bin/env node

/**
 * This script scans the codebase for potential function name mismatches
 * by looking for patterns where a function is defined with a prefix (like _functionName)
 * but called without the prefix (like functionName) or vice versa.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to scan
const dirsToScan = ['app', 'components', 'lib', 'hooks', 'context'];

// Function to recursively get all TypeScript/JavaScript files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Get all TypeScript/JavaScript files
const allFiles = [];
dirsToScan.forEach(dir => {
  if (fs.existsSync(dir)) {
    getAllFiles(dir, allFiles);
  }
});

console.log(`🔍 Scanning ${allFiles.length} files for potential function reference issues...`);

// Track potential issues
const potentialIssues = [];

// Process each file
allFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Find function declarations with underscore prefix
  const underscoreFunctions = [];
  const regularFunctions = [];
  
  // Simple regex to find function declarations
  const functionDeclRegex = /(?:const|let|var)\s+(_?)(\w+)\s*=\s*(?:\(.*\)|async\s*\(.*\))\s*=>/g;
  const functionDeclRegex2 = /function\s+(_?)(\w+)\s*\(/g;
  
  let match;
  let fileContent = content;
  
  // Find underscore-prefixed functions
  while ((match = functionDeclRegex.exec(fileContent)) !== null) {
    const hasUnderscore = match[1] === '_';
    const functionName = match[2];
    
    if (hasUnderscore) {
      underscoreFunctions.push(functionName);
    } else {
      regularFunctions.push(functionName);
    }
  }
  
  // Reset regex and check for function declarations
  functionDeclRegex.lastIndex = 0;
  while ((match = functionDeclRegex2.exec(fileContent)) !== null) {
    const hasUnderscore = match[1] === '_';
    const functionName = match[2];
    
    if (hasUnderscore) {
      underscoreFunctions.push(functionName);
    } else {
      regularFunctions.push(functionName);
    }
  }
  
  // Check for potential mismatches
  underscoreFunctions.forEach(funcName => {
    const nonUnderscoreVersion = funcName;
    const regex = new RegExp(`\\b${nonUnderscoreVersion}\\(`, 'g');
    
    if (fileContent.match(regex)) {
      // Check if it's not just calling itself
      const selfCallRegex = new RegExp(`_${nonUnderscoreVersion}\\s*=.*${nonUnderscoreVersion}\\(`, 'g');
      if (!selfCallRegex.test(fileContent)) {
        potentialIssues.push({
          file: filePath,
          issue: `Function defined as _${nonUnderscoreVersion} but called as ${nonUnderscoreVersion}()`
        });
      }
    }
  });
  
  regularFunctions.forEach(funcName => {
    const underscoreVersion = `_${funcName}`;
    const regex = new RegExp(`\\b${underscoreVersion}\\(`, 'g');
    
    if (fileContent.match(regex) && !underscoreFunctions.includes(funcName)) {
      potentialIssues.push({
        file: filePath,
        issue: `Function defined as ${funcName} but called as _${funcName}()`
      });
    }
  });
});

// Output results
if (potentialIssues.length > 0) {
  console.log('\n⚠️ Potential function reference issues found:');
  
  const groupedIssues = {};
  potentialIssues.forEach(({ file, issue }) => {
    if (!groupedIssues[file]) {
      groupedIssues[file] = [];
    }
    groupedIssues[file].push(issue);
  });
  
  Object.entries(groupedIssues).forEach(([file, issues]) => {
    console.log(`\n📄 ${file}:`);
    issues.forEach(issue => {
      console.log(`  - ${issue}`);
    });
  });
  
  console.log('\nThese might be false positives. Please review each case manually.');
} else {
  console.log('\n✅ No potential function reference issues found!');
}

console.log('\nDone!');
