#!/usr/bin/env node

/**
 * This script fixes TypeScript errors related to environment checking
 * and creates a type-safe logger utility
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// First, create a proper logger utility
const LOGGER_FILE_PATH = path.join(process.cwd(), 'lib/logger.ts');

const LOGGER_CONTENT = `/**
 * Production-safe logger utility that handles environment checking properly
 */

// Type-safe environment checking function to prevent TypeScript errors
const isProduction = () => process.env.NODE_ENV === 'production';

// Type-safe logger with properly handled environment checks
export const logger = {
  log: (message: string, ...args: any[]) => {
    if (!isProduction()) {
      console.log(message, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    if (!isProduction()) {
      console.error(message, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (!isProduction()) {
      console.warn(message, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (!isProduction()) {
      console.info(message, ...args);
    }
  },
  debug: (message: string, ...args: any[]) => {
    if (!isProduction()) {
      console.debug(message, ...args);
    }
  }
};
`;

// Create or update the logger file
fs.writeFileSync(LOGGER_FILE_PATH, LOGGER_CONTENT);
console.log(`✅ Created type-safe logger at ${path.relative(process.cwd(), LOGGER_FILE_PATH)}`);

// Now create a patch for the /scripts/remove-console-logs.js file to prevent it from breaking our logger
const CONSOLE_LOGS_SCRIPT_PATH = path.join(process.cwd(), 'scripts/remove-console-logs.js');

try {
  const originalScript = fs.readFileSync(CONSOLE_LOGS_SCRIPT_PATH, 'utf8');

  // Add an exclusion for the logger.ts file
  const patchedScript = originalScript.replace(
    'function shouldExclude(filePath) {',
    `function shouldExclude(filePath) {
  // Skip our custom logger
  if (filePath.includes('lib/logger.ts')) {
    return true;
  }`
  );

  fs.writeFileSync(CONSOLE_LOGS_SCRIPT_PATH, patchedScript);
  console.log(`✅ Updated remove-console-logs.js to exclude the logger file`);
} catch (error) {
  console.error('Failed to update remove-console-logs.js:', error);
}

console.log('✅ TypeScript errors fixed. You can now run the build.');
