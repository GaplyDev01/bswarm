#!/usr/bin/env node

/**
 * This script creates a better version of the console logging function
 * and updates all the problematic console logs in the codebase
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Directories to scan
const DIRS_TO_SCAN = ['app', 'components', 'lib', 'hooks', 'context'];

// Step 1: First create the logger utility function
const loggerUtil = `/**
 * Improved logger utility that safely handles production logging
 */

// Safe console logger that does proper type checking and works well with TypeScript
export const logger = {
  log: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(message, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(message, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(message, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(message, ...args);
    }
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(message, ...args);
    }
  }
};
`;

console.log('Creating logger utility file...');
fs.writeFileSync(path.join(process.cwd(), 'lib/logger.ts'), loggerUtil);

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

    // Skip the logger file itself
    if (file.endsWith('lib/logger.ts')) {
      return;
    }

    // First fix: Find weird console expressions with numbers
    const numericConsoleRegex = /console\.\d+/g;
    content = content.replace(numericConsoleRegex, 'console');

    // Fix the problematic conditional pattern
    const problematicPattern =
      /console\s*\?\s*\(\)\s*=>\s*\{\}\s*:\s*process\.env\.NODE_ENV\s*===\s*['"]production['"]\s*\?\s*\(\)\s*=>\s*\{\}\s*:\s*console\.(log|error|warn|info|debug)/g;

    let match;
    let replacements = 0;
    let newContent = content;

    // Count if file has any problematic expressions before proceeding with imports
    while ((match = problematicPattern.exec(content)) !== null) {
      replacements++;
    }

    if (replacements > 0) {
      // Add the import at the top of the file if it doesn't have it already
      if (!content.includes('import { logger }')) {
        // Check if there are any imports, and add after the last import
        const importMatch = content.match(/import\s+.*?from\s+['"].*?['"]/g);
        if (importMatch) {
          const lastImport = importMatch[importMatch.length - 1];
          const lastImportIndex = content.lastIndexOf(lastImport) + lastImport.length;
          newContent =
            content.substring(0, lastImportIndex) +
            "\nimport { logger } from '@/lib/logger';" +
            content.substring(lastImportIndex);
        } else {
          // No imports, add at the beginning
          newContent = "import { logger } from '@/lib/logger';\n" + content;
        }
      }

      // Replace all problematic console patterns
      newContent = newContent.replace(problematicPattern, (match, loggingMethod) => {
        return `logger.${loggingMethod}`;
      });

      // Replace any remaining direct console calls with logger
      const directConsolePattern = /console\.(log|error|warn|info|debug)/g;
      newContent = newContent.replace(directConsolePattern, (match, loggingMethod) => {
        return `logger.${loggingMethod}`;
      });

      if (newContent !== content) {
        fs.writeFileSync(file, newContent);
        console.log(
          `✅ ${path.relative(process.cwd(), file)} - Replaced console logs with logger utility`
        );
        filesModified++;
        totalFixed += replacements;
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error);
  }
});

console.log('\nSummary:');
console.log(`- Files scanned: ${filesToFix.length}`);
console.log(`- Files modified: ${filesModified}`);
console.log(`- Issues fixed: ${totalFixed}`);
console.log('\nCreated logger utility at lib/logger.ts');
console.log('All problematic console logs have been replaced with type-safe logger calls');
