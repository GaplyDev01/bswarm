#!/usr/bin/env node

/**
 * This script removes console.log statements from production code
 * It can be run as part of the build process
 *
 * Usage:
 *   node scripts/remove-console-logs.js
 *
 * Options:
 *   --check       Only check for console logs without removing them
 *   --verbose     Show more detailed output
 *   --help        Show help message
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DIRECTORIES_TO_SCAN = ['app', 'components', 'lib', 'hooks', 'context'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'public', 'tests', '__tests__'];

// Command line arguments
const args = process.argv.slice(2);
const CHECK_ONLY = args.includes('--check');
const VERBOSE = args.includes('--verbose');
const HELP = args.includes('--help');

// Regex patterns
const CONSOLE_LOG_PATTERN = /console\.(log|debug|info|warn|error)\s*\(/g;
const LOGGER_PATTERN = /logger\.(debug|info|warn|error)\s*\(/g;

// Stats
let filesScanned = 0;
let filesModified = 0;
let consoleLogsFound = 0;
let consoleLogsRemoved = 0;

// Show help message
if (HELP) {
  console.log(`
Remove Console Logs Script
==========================

This script removes console.log statements from production code.
It can be run as part of the build process.

Usage: 
  node scripts/remove-console-logs.js [options]

Options:
  --check       Only check for console logs without removing them
  --verbose     Show more detailed output
  --help        Show this help message
  `);
  process.exit(0);
}

// Helper function to check if a path should be excluded
function shouldExclude(filePath) {
  // Skip our custom logger
  if (filePath.includes('lib/logger.ts')) {
    return true;
  }
  return EXCLUDE_DIRS.some(dir => filePath.includes(`/${dir}/`));
}

// Get all TypeScript and JavaScript files in specified directories
function getFiles() {
  const files = [];

  for (const dir of DIRECTORIES_TO_SCAN) {
    try {
      // Use find command to get all .ts, .tsx, .js, .jsx files
      const result = execSync(
        `find ${dir} -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"`,
        { encoding: 'utf8' }
      );

      // Split result into lines and filter out excluded directories
      const dirFiles = result
        .split('\n')
        .filter(Boolean)
        .filter(file => !shouldExclude(file));

      files.push(...dirFiles);
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error.message);
    }
  }

  return files;
}

// Process a single file
function processFile(filePath) {
  try {
    filesScanned++;

    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');

    // Skip files with no console logs
    if (!CONSOLE_LOG_PATTERN.test(content)) {
      if (VERBOSE) {
        console.log(`✓ ${filePath} - No console logs found`);
      }
      return;
    }

    // Count console logs
    const matches = content.match(CONSOLE_LOG_PATTERN) || [];
    consoleLogsFound += matches.length;

    if (CHECK_ONLY) {
      console.log(`🔍 ${filePath} - Found ${matches.length} console log(s)`);
      matches.forEach(match => {
        if (VERBOSE) {
          // Find the line containing the match
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(match)) {
              console.log(`   Line ${i + 1}: ${lines[i].trim()}`);
              break;
            }
          }
        }
      });
      return;
    }

    // Replace console logs with empty function in production
    // This preserves line numbers while removing the actual logging
    const newContent = content.replace(CONSOLE_LOG_PATTERN, match => {
      // Keep console.error by default
      if (match.includes('console.error') && !match.includes('process.env.NODE_ENV')) {
        return `process.env.NODE_ENV === 'production' ? () => {} : ${match}`;
      }

      // Replace other console methods
      return "process.env.NODE_ENV === 'production' ? () => {} : " + match;
    });

    // Only write if changes were made
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      filesModified++;
      consoleLogsRemoved += matches.length;
      console.log(`✅ ${filePath} - Removed ${matches.length} console log(s)`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
}

// Main function
function main() {
  console.log(`🔎 Scanning for console logs in: ${DIRECTORIES_TO_SCAN.join(', ')}`);
  console.log(`Mode: ${CHECK_ONLY ? 'Check only' : 'Remove in production'}`);

  const files = getFiles();
  console.log(`Found ${files.length} files to scan`);

  // Process each file
  for (const file of files) {
    processFile(file);
  }

  // Print summary
  console.log('\nSummary:');
  console.log(`- Files scanned: ${filesScanned}`);
  console.log(`- Console logs found: ${consoleLogsFound}`);

  if (!CHECK_ONLY) {
    console.log(`- Files modified: ${filesModified}`);
    console.log(`- Console logs replaced with no-op in production: ${consoleLogsRemoved}`);
  } else {
    console.log('\nRun without --check to replace console logs with no-ops in production.');
  }
}

// Run the script
main();
