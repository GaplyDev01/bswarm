/**
 * Fix explicit any types in TypeScript files
 * This script replaces 'any' types with more specific or appropriate types
 * based on context clues and naming patterns
 */

const fs = require('fs');
const path = require('path');

// Map of common variable name patterns to appropriate types
const typeInferenceMap = {
  // API and HTTP related patterns
  req: 'Request',
  request: 'Request',
  res: 'Response',
  response: 'Response',
  
  // Data patterns
  data: 'Record<string, unknown>',
  result: 'unknown',
  values: 'unknown[]',
  item: 'unknown',
  items: 'unknown[]',
  
  // Event patterns
  event: 'Event',
  evt: 'Event',
  e: 'Event',
  
  // Error patterns
  error: 'Error | unknown',
  err: 'Error | unknown',
  exception: 'Error | unknown',
  
  // Function patterns
  callback: '(...args: unknown[]) => void',
  handler: '(...args: unknown[]) => unknown',
  fn: '(...args: unknown[]) => unknown',
  
  // Common object patterns
  options: 'Record<string, unknown>',
  config: 'Record<string, unknown>',
  params: 'Record<string, unknown>',
  props: 'Record<string, unknown>',
  
  // Solana specific
  connection: 'Connection',
  wallet: 'Wallet',
  provider: 'Provider',
  account: 'Account',
  transaction: 'Transaction',
  
  // DOM elements
  element: 'HTMLElement',
  el: 'HTMLElement',
  
  // Generic types
  value: 'unknown',
  obj: 'Record<string, unknown>',
  object: 'Record<string, unknown>',
  state: 'Record<string, unknown>',
  context: 'Record<string, unknown>',
  
  // Web3/blockchain specific
  token: 'Token',
  balance: 'number | bigint',
  address: 'string',
  signature: 'string',
  publicKey: 'PublicKey',
  privateKey: 'string',
  price: 'number',
};

// Function to derive a type based on variable name and file context
function deriveType(variableName, line, filePath) {
  const lowerVarName = variableName.toLowerCase();
  
  // Check for array notation
  const isArray = line.includes(': any[]') || variableName.endsWith('s');
  
  // First check for exact matches in our map
  for (const [pattern, type] of Object.entries(typeInferenceMap)) {
    if (lowerVarName.includes(pattern)) {
      return isArray && !type.includes('[]') ? `${type}[]` : type;
    }
  }
  
  // Special handling for Solana files
  if (filePath.includes('solana')) {
    if (lowerVarName.includes('key')) return 'PublicKey';
    if (lowerVarName.includes('amount')) return 'number | bigint';
    if (lowerVarName.includes('instruction')) return 'TransactionInstruction';
  }
  
  // Special handling for API files
  if (filePath.includes('api')) {
    if (lowerVarName.includes('body')) return 'Record<string, unknown>';
    if (lowerVarName.includes('query')) return 'Record<string, string>';
  }
  
  // When all else fails, use unknown (better than any)
  return isArray ? 'unknown[]' : 'unknown';
}

// Function to replace 'any' types with more appropriate types
function fixAnyTypes(filePath) {
  // Read the file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`Error reading file ${filePath}: ${err.message}`);
    return false;
  }
  
  // Split into lines for processing
  const lines = content.split('\n');
  
  // Track modified lines
  const modifiedLines = [];
  
  // Process the file line by line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Named variable or parameter with 'any' type
    const varMatch = line.match(/(\w+)\s*:\s*any(\[\])?/);
    if (varMatch) {
      const variableName = varMatch[1];
      const derivedType = deriveType(variableName, line, filePath);
      
      if (varMatch[2]) { // Has array brackets
        lines[i] = line.replace(`${variableName}: any[]`, `${variableName}: ${derivedType}`);
      } else {
        lines[i] = line.replace(`${variableName}: any`, `${variableName}: ${derivedType}`);
      }
      modifiedLines.push(i);
      continue;
    }
    
    // Generic type parameters
    if (line.includes('<any>')) {
      lines[i] = line.replace(/<any>/g, '<unknown>');
      modifiedLines.push(i);
      continue;
    }
    
    // Type assertions
    if (line.includes('as any')) {
      lines[i] = line.replace(/as any/g, 'as unknown');
      modifiedLines.push(i);
      continue;
    }
    
    // Array types
    if (line.includes('any[]')) {
      lines[i] = line.replace(/any\[\]/g, 'unknown[]');
      modifiedLines.push(i);
      continue;
    }
    
    // Generic any type without variable name
    if (line.includes(': any')) {
      // Add a comment explaining why any is used
      const indentation = line.match(/^(\s*)/)[1];
      lines.splice(i, 0, `${indentation}// TODO: Replace 'any' with a more specific type`);
      lines[i+1] = lines[i+1].replace(/: any/g, ': unknown');
      i++; // Skip the inserted line
      modifiedLines.push(i - 1, i);
    }
  }
  
  // Write the modified content back to the file
  if (modifiedLines.length > 0) {
    try {
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`Fixed ${modifiedLines.length} instances of 'any' types in ${filePath}`);
      return true;
    } catch (err) {
      console.error(`Error writing file ${filePath}: ${err.message}`);
      return false;
    }
  }
  
  return false;
}

// Function to find all TypeScript files with 'any' types
function findFilesWithAnyTypes(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      findFilesWithAnyTypes(filePath, fileList);
    } else if (
      (file.endsWith('.ts') || file.endsWith('.tsx')) && 
      !file.endsWith('.d.ts') // Skip declaration files
    ) {
      // Check if file contains 'any' type
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(': any') || content.includes('<any>') || content.includes('as any') || content.includes('any[]')) {
        fileList.push(filePath);
      }
    }
  }
  
  return fileList;
}

// Process a list of files with 'any' type issues
function processFiles(files) {
  let filesFixed = 0;
  
  for (const file of files) {
    if (fixAnyTypes(file)) {
      filesFixed++;
    }
  }
  
  console.log(`Fixed 'any' types in ${filesFixed} files`);
}

// Main execution
const rootDir = process.cwd();
// Use a specific list of files, or scan the entire codebase
const filesToFix = findFilesWithAnyTypes(rootDir);
console.log(`Found ${filesToFix.length} files with 'any' types`);
processFiles(filesToFix);

// Report completion
console.log('Type fixing complete!');
