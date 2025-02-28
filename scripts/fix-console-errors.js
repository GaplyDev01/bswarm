#!/usr/bin/env node

/**
 * This script fixes console log syntax issues and complex conditional
 * expressions that cause TypeScript errors during build.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Directories to scan
const DIRS_TO_SCAN = ['app', 'components', 'lib', 'hooks', 'context'];

// Find files to process
console.log(`🔎 Scanning for problematic console logs in: ${DIRS_TO_SCAN.join(', ')}`);

let filesToFix = [];

// Get all TypeScript files
DIRS_TO_SCAN.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    const files = glob.sync(`${fullPath}/**/*.{ts,tsx}`);
    filesToFix = [...filesToFix, ...files];
  }
});

console.log(`Found ${filesToFix.length} files to scan`);

// Process each file
let totalFixed = 0;
let filesModified = 0;

filesToFix.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');

    // First fix: Find and fix broken expressions (like console.1234)
    const numericConsoleRegex = /console\.\d+/g;
    const numericFixes = content.match(numericConsoleRegex) || [];

    if (numericFixes.length > 0) {
      content = content.replace(numericConsoleRegex, 'console');
      console.log(
        `💾 ${path.relative(process.cwd(), file)} - Fixed ${numericFixes.length} broken console expressions`
      );
      totalFixed += numericFixes.length;
      filesModified++;
    }

    // Second fix: Fix nested conditionals
    // Match complex conditionals with process.env.NODE_ENV === 'production'
    const nestedConditionalRegex =
      /process\.env\.NODE_ENV\s*===\s*['"]production['"]\s*\?\s*\(\)\s*=>\s*\{\}\s*:\s*(process\.env\.NODE_ENV\s*===\s*['"]production['"]\s*\?\s*\(\)\s*=>\s*\{\}\s*:\s*)?/g;

    // If there are matches, replace with empty string as we'll just use console directly
    let match;
    let nestedFixes = 0;

    // Count the occurrences without modifying the string yet
    while ((match = nestedConditionalRegex.exec(content)) !== null) {
      nestedFixes++;
    }

    if (nestedFixes > 0) {
      // Now replace the occurrences
      content = content.replace(nestedConditionalRegex, '');
      console.log(
        `💾 ${path.relative(process.cwd(), file)} - Fixed ${nestedFixes} nested conditionals`
      );
      totalFixed += nestedFixes;

      if (filesModified === 0) {
        filesModified++;
      }
    }

    // If any fixes were made, write the file
    if (numericFixes.length > 0 || nestedFixes > 0) {
      fs.writeFileSync(file, content);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error);
  }
});

console.log('\nSummary:');
console.log(`- Files scanned: ${filesToFix.length}`);
console.log(`- Files modified: ${filesModified}`);
console.log(`- Issues fixed: ${totalFixed}`);
