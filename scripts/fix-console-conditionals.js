#!/usr/bin/env node

/**
 * This script finds and fixes all instances of incorrectly nested console logging
 * conditionals that cause TypeScript type errors.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Directories to scan
const DIRS_TO_SCAN = ['app', 'components', 'lib', 'hooks', 'context'];

// Regular expressions for matching problematic console conditions
const PROBLEMATIC_PATTERNS = [
  // Match patterns like: process.env.NODE_ENV === 'production' ? () => {} : console.log
  /process\.env\.NODE_ENV\s*===\s*['"]production['"]\s*\?\s*\(\)\s*=>\s*\{\}\s*:\s*(?:process\.env\.NODE_ENV\s*===\s*['"]production['"]\s*\?\s*\(\)\s*=>\s*\{\}\s*:\s*)?console\.(log|error|warn|info|debug)/g,
  // Also handle multiple nested conditions
  /process\.env\.NODE_ENV\s*===\s*['"]production['"]\s*\?\s*\(\)\s*=>\s*\{\}\s*:\s*process\.env\.NODE_ENV\s*===\s*['"]production['"]/g,
];

// Pattern for replacement
const REPLACEMENT = (match, loggingMethod) => {
  const method = loggingMethod || 'log';
  return `console.${method}`;
};

// Scan for files
console.log(`🔎 Scanning for problematic console conditionals in: ${DIRS_TO_SCAN.join(', ')}`);

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
    const content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    let modified = false;

    PROBLEMATIC_PATTERNS.forEach(pattern => {
      const prevContent = newContent;
      newContent = newContent.replace(pattern, REPLACEMENT);

      if (prevContent !== newContent) {
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(file, newContent);
      filesModified++;
      const fixedCount =
        (content.match(PROBLEMATIC_PATTERNS[0]) || []).length +
        (content.match(PROBLEMATIC_PATTERNS[1]) || []).length;
      totalFixed += fixedCount;
      console.log(
        `✅ ${path.relative(process.cwd(), file)} - Fixed ${fixedCount} problematic conditional(s)`
      );
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error);
  }
});

console.log('\nSummary:');
console.log(`- Files scanned: ${filesToFix.length}`);
console.log(`- Files modified: ${filesModified}`);
console.log(`- Problematic conditionals fixed: ${totalFixed}`);
