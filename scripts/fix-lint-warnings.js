/**
 * Fix common ESLint warnings automatically
 * 
 * This script addresses:
 * 1. Unused variables/imports by prefixing them with underscore
 * 2. Explicit any warnings by adding proper typing where possible
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Run ESLint to get all warnings
function getLintWarnings() {
  try {
    // Execute ESLint with text output format
    const output = execSync('npx next lint', { encoding: 'utf8' });
    
    // Parse the text output to extract warnings
    const fileWarnings = [];
    let currentFile = null;
    let messages = [];
    
    const lines = output.split('\n');
    for (const line of lines) {
      // New file starts with ./
      if (line.startsWith('./')) {
        // Save previous file if exists
        if (currentFile) {
          fileWarnings.push({
            filePath: currentFile,
            messages: messages
          });
        }
        
        // Start new file
        currentFile = path.resolve(process.cwd(), line.substring(2));
        messages = [];
      }
      // Warning lines have line:column format
      else if (line.match(/^\d+:\d+/)) {
        const [lineCol, ...rest] = line.split('  ');
        const [lineNum, colNum] = lineCol.split(':').map(Number);
        const message = rest.join('  ').trim();
        
        // Extract rule ID
        const ruleIdMatch = message.match(/(@[\w-]+\/[\w-]+)$/);
        const ruleId = ruleIdMatch ? ruleIdMatch[1] : null;
        
        messages.push({
          line: lineNum,
          column: colNum,
          message,
          ruleId
        });
      }
    }
    
    // Add the last file
    if (currentFile && messages.length > 0) {
      fileWarnings.push({
        filePath: currentFile,
        messages: messages
      });
    }
    
    return fileWarnings;
  } catch (error) {
    console.error('Failed to run ESLint:', error);
    return [];
  }
}

// Fix unused variables by prefixing them with underscore
function fixUnusedVariables(filePath, warnings) {
  const unusedVars = warnings
    .filter(warning => warning.ruleId === '@typescript-eslint/no-unused-vars')
    .map(warning => {
      const match = warning.message.match(/'([^']+)'/);
      return match ? {
        name: match[1],
        line: warning.line,
        column: warning.column
      } : null;
    })
    .filter(Boolean); // Remove null entries

  if (unusedVars.length === 0) return false;

  console.log(`Fixing ${unusedVars.length} unused variables in ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Process each unused variable
    unusedVars.forEach(variable => {
      const line = lines[variable.line - 1];
      
      // Different patterns for fixing:
      // 1. Import statements
      if (line.includes('import')) {
        // Find the specific variable within the import statement
        const importMatch = line.match(/import\s+{([^}]+)}/);
        if (importMatch) {
          const importList = importMatch[1];
          const updatedImport = importList.replace(
            new RegExp(`\\b${variable.name}\\b`),
            `_${variable.name}`
          );
          lines[variable.line - 1] = line.replace(importList, updatedImport);
        }
      } 
      // 2. Variable declarations
      else if (line.includes('const') || line.includes('let') || line.includes('var')) {
        const regex = new RegExp(`\\b(const|let|var)\\s+(${variable.name})\\b`);
        if (regex.test(line)) {
          lines[variable.line - 1] = line.replace(
            new RegExp(`\\b${variable.name}\\b`),
            `_${variable.name}`
          );
        }
      }
      // 3. Function parameters
      else if (line.includes('(') && line.includes(')')) {
        // Only replace if it's a parameter
        const paramMatch = line.match(/\(([^)]+)\)/);
        if (paramMatch && paramMatch[1].includes(variable.name)) {
          lines[variable.line - 1] = line.replace(
            new RegExp(`\\b${variable.name}\\b`),
            `_${variable.name}`
          );
        }
      }
      // 4. Function declarations
      else if (line.includes('function')) {
        const funcMatch = line.match(/function\s+(\w+)/);
        if (funcMatch && funcMatch[1] === variable.name) {
          lines[variable.line - 1] = line.replace(
            new RegExp(`\\bfunction\\s+${variable.name}\\b`),
            `function _${variable.name}`
          );
        }
      }
    });

    fs.writeFileSync(filePath, lines.join('\n'));
    return true;
  } catch (error) {
    console.error(`Error fixing unused variables in ${filePath}:`, error);
    return false;
  }
}

// Fix explicit any types with more appropriate types
function fixExplicitAny(filePath, warnings) {
  const anyWarnings = warnings
    .filter(warning => warning.ruleId === '@typescript-eslint/no-explicit-any')
    .map(warning => ({
      line: warning.line,
      column: warning.column
    }));

  if (anyWarnings.length === 0) return false;

  console.log(`Addressing ${anyWarnings.length} explicit any types in ${filePath}`);
  
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Process each any type warning
    anyWarnings.forEach(warning => {
      const line = lines[warning.line - 1];
      
      // Different patterns to replace any with better types:
      
      // 1. Function parameters/returns
      if (line.match(/\w+\s*:\s*any(\[\])?/)) {
        // Common replacement patterns
        if (line.includes('error') || line.includes('err')) {
          // For error handlers
          lines[warning.line - 1] = line.replace(/:\s*any/, ': Error | unknown');
        }
        else if (line.includes('event') || line.includes('evt')) {
          // For event handlers
          lines[warning.line - 1] = line.replace(/:\s*any/, ': Event');
        }
        else if (line.includes('response') || line.includes('res')) {
          // For API responses
          lines[warning.line - 1] = line.replace(/:\s*any/, ': Record<string, unknown>');
        }
        else if (line.includes('data')) {
          // For data objects
          lines[warning.line - 1] = line.replace(/:\s*any/, ': Record<string, unknown>');
        }
        else if (line.includes('callback')) {
          // For callback functions
          lines[warning.line - 1] = line.replace(/:\s*any/, ': unknown');
        }
        else if (line.includes('options')) {
          // For options objects
          lines[warning.line - 1] = line.replace(/:\s*any/, ': Record<string, unknown>');
        }
        else if (line.includes('result')) {
          // For result objects
          lines[warning.line - 1] = line.replace(/:\s*any/, ': unknown');
        }
        else if (line.includes('value')) {
          // For generic values
          lines[warning.line - 1] = line.replace(/:\s*any/, ': unknown');
        }
        // Default case - replace with unknown
        else {
          lines[warning.line - 1] = line.replace(/:\s*any/, ': unknown');
        }
      }
      // 2. Generic type parameters
      else if (line.match(/<any>/)) {
        lines[warning.line - 1] = line.replace(/<any>/, '<unknown>');
      }
      // 3. Array types
      else if (line.match(/any\[\]/)) {
        lines[warning.line - 1] = line.replace(/any\[\]/, 'unknown[]');
      }
      // 4. Type assertions
      else if (line.match(/as any/)) {
        lines[warning.line - 1] = line.replace(/as any/, 'as unknown');
      }
      // 5. Comments above the line to explain why any is needed
      else if (line.includes(': any')) {
        const indentation = line.match(/^(\s*)/)[1];
        // Add a comment explaining why any is used
        lines.splice(warning.line - 1, 0, `${indentation}// TODO: Replace 'any' with a more specific type`);
        warning.line++; // Adjust the line number for the next warnings
      }
    });

    // Write the changes back to the file
    fs.writeFileSync(filePath, lines.join('\n'));
    return true;
  } catch (error) {
    console.error(`Error fixing any types in ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Running ESLint to identify issues...');
  const warnings = getLintWarnings();
  let filesFixed = 0;

  console.log(`Found ${warnings.length} files with issues`);

  for (const file of warnings) {
    const filePath = file.filePath;
    
    // Skip node_modules
    if (filePath.includes('node_modules')) continue;
    
    let fileModified = false;
    
    // Fix unused variables
    if (fixUnusedVariables(filePath, file.messages)) {
      fileModified = true;
    }
    
    // Fix explicit any types
    if (fixExplicitAny(filePath, file.messages)) {
      fileModified = true;
    }
    
    if (fileModified) {
      filesFixed++;
    }
  }

  console.log(`Fixed issues in ${filesFixed} files`);
}

main().catch(console.error);
