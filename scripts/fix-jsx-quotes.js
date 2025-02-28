#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

/**
 * Fixes JSX quotes in a file
 *
 * @param {string} filePath - Path to the file to process
 * @returns {boolean} - Whether the file was modified
 */
function fixJsxQuotesInFile(filePath) {
  try {
    // Read the file content
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let content = originalContent;

    // Check for HTML entities in JSX attributes and expressions
    content = content.replace(
      /(\w+)=("|')(.*?)("|')/g,
      (match, attrName, openQuote, attrValue, closeQuote) => {
        const fixedOpenQuote = openQuote === '"' ? '"' : "'";
        const fixedCloseQuote = closeQuote === '"' ? '"' : "'";
        return `${attrName}=${fixedOpenQuote}${attrValue}${fixedCloseQuote}`;
      }
    );

    // Replace HTML entity quotes directly in the content
    content = content.replace(/"/g, '"');
    content = content.replace(/'/g, "'");

    // Fix TypeScript generic type parameters with quotes
    content = content.replace(
      /useState<(['"])([^'"]+)(['"])\s+\|\s+(['"])([^'"]+)(['"])/g,
      (match, q1, type1, q3, q4, type2, q6) => `useState<'${type1}' | '${type2}'>>`
    );

    // Fix typescript type parameters with quotes that span more than two options
    content = content.replace(
      /useState<(['"])([^'"]+)(['"])\s+\|\s+(['"])([^'"]+)(['"])\s+\|\s+(['"])([^'"]+)(['"])/g,
      (match, q1, type1, q3, q4, type2, q6, q7, type3, q9) =>
        `useState<'${type1}' | '${type2}'> | '${type3}'>`
    );

    // Check if we made any changes
    if (content !== originalContent) {
      // Write the fixed content back to the file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`${colors.green}Fixed:${colors.reset} ${filePath}`);
      return true;
    } else {
      console.log(`${colors.yellow}No issues found:${colors.reset} ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}Error processing ${filePath}:${colors.reset}`, error);
    return false;
  }
}

/**
 * Main function to run the script
 */
function main() {
  const args = process.argv.slice(2);
  let files = [];

  if (args.length > 0) {
    // Process specific files
    files = args;
  } else {
    // Find all TypeScript and JavaScript files in the project
    const sourceFiles = glob.sync('**/*.{ts,tsx,js,jsx}', {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**'],
      cwd: path.resolve(__dirname, '..'),
    });
    files = sourceFiles.map(file => path.resolve(__dirname, '..', file));
  }

  console.log(`Processing ${files.length} files...`);
  let fixedFiles = 0;

  for (const file of files) {
    if (fixJsxQuotesInFile(file)) {
      fixedFiles++;
    }
  }

  console.log(`\nSummary: Fixed quotes in ${fixedFiles} out of ${files.length} files.`);
  console.log(`${colors.blue}Now run 'npm run format' to apply Prettier formatting${colors.reset}`);
}

main();
