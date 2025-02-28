#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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

// Directories to scan
const dirsToScan = ['app', 'components', 'lib', 'hooks', 'context', 'utils'];

// File extensions to process
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];

// Console methods to look for
const consoleMethods = ['log', 'info', 'debug', 'trace']; // Allowing warn and error

// Get all files recursively
function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);

    // Skip node_modules, .next, and other build/cache directories
    if (
      file.startsWith('.') ||
      file === 'node_modules' ||
      file === '.next' ||
      file === 'out' ||
      file === 'public'
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

// Find console logs
function findConsoleLogs(content, filePath) {
  const results = [];
  const lines = content.split('\n');

  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;

    // Check for console.method calls
    consoleMethods.forEach(method => {
      const regex = new RegExp(`console\\.${method}\\s*\\(`, 'g');
      let match;

      while ((match = regex.exec(line)) !== null) {
        results.push({
          filePath,
          lineNumber,
          consoleType: method,
          line: line.trim(),
          column: match.index,
        });
      }
    });
  });

  return results;
}

// Main function
function main() {
  console.log(
    `${colors.blue}🔎 Scanning for console logs in: ${dirsToScan.join(', ')}${colors.reset}`
  );

  let allFiles = [];

  // Get all files from directories to scan
  dirsToScan.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      allFiles = allFiles.concat(getFiles(dirPath));
    }
  });

  console.log(`${colors.blue}Found ${allFiles.length} files to scan${colors.reset}`);

  // Scan each file for console logs
  const allResults = [];

  allFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const results = findConsoleLogs(content, file);

      if (results.length > 0) {
        allResults.push(...results);
      }
    } catch (error) {
      console.error(`${colors.red}Error processing ${file}: ${error.message}${colors.reset}`);
    }
  });

  // Print summary
  console.log(`\n${colors.magenta}=== Console Log Summary ===${colors.reset}`);
  console.log(`${colors.blue}Total files scanned: ${allFiles.length}${colors.reset}`);
  console.log(`${colors.yellow}Total console logs found: ${allResults.length}${colors.reset}`);

  if (allResults.length > 0) {
    // Group by file
    const fileGroups = {};

    allResults.forEach(result => {
      if (!fileGroups[result.filePath]) {
        fileGroups[result.filePath] = [];
      }
      fileGroups[result.filePath].push(result);
    });

    // Print details
    console.log(`\n${colors.magenta}=== Console Log Details ===${colors.reset}`);

    Object.keys(fileGroups).forEach(filePath => {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(
        `\n${colors.green}${relativePath}${colors.reset} (${fileGroups[filePath].length} logs):`
      );

      fileGroups[filePath].forEach(result => {
        console.log(
          `  ${colors.cyan}Line ${result.lineNumber}:${colors.reset} ${result.consoleType} - ${result.line}`
        );
      });
    });

    // Count by console type
    const typeCounts = {};
    consoleMethods.forEach(method => {
      typeCounts[method] = allResults.filter(r => r.consoleType === method).length;
    });

    console.log(`\n${colors.magenta}=== Console Method Counts ===${colors.reset}`);
    Object.keys(typeCounts).forEach(type => {
      if (typeCounts[type] > 0) {
        console.log(`${colors.yellow}console.${type}: ${typeCounts[type]}${colors.reset}`);
      }
    });
  }

  // Provide recommendations
  console.log(`\n${colors.magenta}=== Recommendations ===${colors.reset}`);
  console.log(`1. ${colors.green}Replace console logs with the logger utility:${colors.reset}`);
  console.log(`   import { logger } from '@/lib/logger';`);
  console.log(`   logger.log('Your message');`);
  console.log(`   logger.error('Error message');`);
  console.log(`\n2. ${colors.green}Use the ESLint rule to prevent new console logs${colors.reset}`);
  console.log(
    `\n3. ${colors.green}Run the remove-console-logs script to automatically convert logs${colors.reset}`
  );
  console.log(`   npm run remove-console-logs`);
}

main();
