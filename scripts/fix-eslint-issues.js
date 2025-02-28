#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script to fix common ESLint issues:
 * 1. Prefixes unused variables with underscore
 * 2. Fixes quotation mark escaping in JSX
 * 3. Formats files according to eslint rules
 */

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// File extensions to process
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];

// Get all files recursively
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);

    // Skip node_modules, .next, and other build/cache directories
    if (
      file.startsWith('.') ||
      file === 'node_modules' ||
      file === '.next' ||
      file === 'public' ||
      file === 'out'
    ) {
      return;
    }

    if (fs.statSync(filePath).isDirectory()) {
      fileList = getFiles(filePath, fileList);
    } else {
      const ext = path.extname(file);
      if (fileExtensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

// Fix unused variables by prefixing them with underscore
function fixUnusedVariables(content) {
  // Match patterns like: `something` is defined but never used, or `something` is assigned a value but never used
  const unusedVarPattern = /'([^']+)' is (?:defined|assigned a value) but never used/g;
  let matches = [...content.matchAll(unusedVarPattern)];

  let modifiedContent = content;

  if (matches.length > 0) {
    console.log(`${colors.yellow}Found ${matches.length} unused variables to fix${colors.reset}`);

    // Create a Set to avoid duplicates
    const uniqueVars = new Set(matches.map(match => match[1]));

    uniqueVars.forEach(varName => {
      if (!varName.startsWith('_')) {
        // Replace all occurrences with prefixed version
        const regex = new RegExp(`\\b${varName}\\b(?!\\s*:)`, 'g');
        modifiedContent = modifiedContent.replace(regex, `_${varName}`);
        console.log(
          `${colors.green}Prefixed ${colors.cyan}${varName}${colors.green} with underscore${colors.reset}`
        );
      }
    });
  }

  return modifiedContent;
}

// Fix JSX quotes by replacing " with " and ' with '
function fixJsxQuotes(content) {
  // This is a simple approach - a more robust solution would use an AST parser
  // Replace quotes inside JSX expressions (between < and >)
  let contentLines = content.split('\n');
  let inJsxExpression = false;

  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i];

    // Check if we're entering or exiting JSX expression
    const openTags = (line.match(/</g) || []).length;
    const closeTags = (line.match(/>/g) || []).length;

    if (openTags > closeTags) {
      inJsxExpression = true;
    } else if (closeTags > openTags) {
      inJsxExpression = false;
    }

    // If in JSX, replace quotes not used for attributes
    if (inJsxExpression) {
      // Replace standalone quotes within JSX (but not attribute quotes)
      // This is a simplification and may need adjustment for complex cases
      contentLines[i] = line
        .replace(/"([^"=]*)"(?![a-zA-Z])/g, '"$1"')
        .replace(/'([^'=]*)'/g, "'$1'");
    }
  }

  return contentLines.join('\n');
}

// Main function
function main() {
  const rootDir = process.cwd();
  console.log(`${colors.blue}Scanning for files in ${rootDir}${colors.reset}`);

  const files = getFiles(rootDir);
  console.log(`${colors.blue}Found ${files.length} files to process${colors.reset}`);

  let fixedFiles = 0;

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');

      // Apply fixes
      let modifiedContent = fixUnusedVariables(content);
      modifiedContent = fixJsxQuotes(modifiedContent);

      // Write back if changes were made
      if (modifiedContent !== content) {
        fs.writeFileSync(file, modifiedContent, 'utf8');
        console.log(`${colors.green}✓ Fixed issues in ${colors.magenta}${file}${colors.reset}`);
        fixedFiles++;
      }
    } catch (error) {
      console.error(`${colors.red}Error processing ${file}: ${error.message}${colors.reset}`);
    }
  });

  console.log(`${colors.blue}Fixed issues in ${fixedFiles} files${colors.reset}`);

  // Run ESLint with --fix to apply additional automatic fixes
  console.log(`${colors.blue}Running ESLint to apply additional fixes...${colors.reset}`);
  try {
    execSync('npm run lint -- --fix', { stdio: 'inherit' });
    console.log(`${colors.green}ESLint automatic fixes applied${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}ESLint fix failed: ${error.message}${colors.reset}`);
  }
}

main();
