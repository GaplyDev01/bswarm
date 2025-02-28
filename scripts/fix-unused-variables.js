/**
 * Fix unused variables by prefixing them with an underscore to comply with ESLint
 */

const fs = require('fs');
const path = require('path');

// Function to fix unused variables in a file
function fixUnusedVariables(filePath) {
  // Read the file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`Error reading file ${filePath}: ${err.message}`);
    return false;
  }
  
  // Find the ESLint warning pattern for unused variables
  const unusedVarPattern = /(\w+) is (defined but never used|assigned a value but never used)/g;
  const unusedVars = [];
  let match;
  
  // Extract variable names from the lint message
  while ((match = unusedVarPattern.exec(content)) !== null) {
    const varName = match[1];
    // Skip variables that are already prefixed with underscore
    if (!varName.startsWith('_') && varName !== 'React') {
      unusedVars.push(varName);
    }
  }
  
  // If no unused variables, skip the file
  if (unusedVars.length === 0) {
    return false;
  }
  
  // Create a modified version of the content with prefixed variables
  let modifiedContent = content;
  let changesCount = 0;
  
  // Replace all occurrences of the variable with prefixed version
  for (const varName of unusedVars) {
    // Only replace declarations, not all occurrences
    // Match for different declaration patterns
    const patterns = [
      // const/let/var declarations
      new RegExp(`(const|let|var)\\s+(${varName})\\s*=`, 'g'),
      // function parameters
      new RegExp(`function\\s+\\w+\\s*\\(([^)]*, )?(${varName})(?=[,)]|\\s*:)`, 'g'),
      // destructuring patterns
      new RegExp(`\\{([^}]*, )?(${varName})(?=[,}]|\\s*:)`, 'g'),
      // arrow function parameters
      new RegExp(`\\(([^)]*, )?(${varName})(?=[,)]|\\s*:)`, 'g'),
      // for loop declarations
      new RegExp(`for\\s*\\(\\s*(const|let|var)\\s+(${varName})\\s*=`, 'g'),
      // import statements
      new RegExp(`import\\s+\\{([^}]*, )?(${varName})(?=[,}])`, 'g'),
      // named function parameters
      new RegExp(`(${varName}):\\s*[\\w<>\\[\\]]+(?=[,)]|\\s*=)`, 'g')
    ];
    
    for (const pattern of patterns) {
      let lastModifiedContent = modifiedContent;
      
      if (pattern.toString().includes('import')) {
        // Handle import statements specially to avoid duplicate replacements
        modifiedContent = modifiedContent.replace(pattern, (match, p1, p2) => {
          if (p2 === varName) {
            return match.replace(p2, `_${p2}`);
          }
          return match;
        });
      }
      else if (pattern.toString().includes('{')) {
        // Handle destructuring specially
        modifiedContent = modifiedContent.replace(pattern, (match, p1, p2) => {
          if (p2 === varName) {
            return match.replace(p2, `_${p2}`);
          }
          return match;
        });
      }
      else if (pattern.toString().includes('function')) {
        // Handle function parameters specially
        modifiedContent = modifiedContent.replace(pattern, (match, p1, p2) => {
          if (p2 === varName) {
            return match.replace(p2, `_${p2}`);
          }
          return match;
        });
      }
      else {
        // Handle other declarations
        modifiedContent = modifiedContent.replace(pattern, (match, p1, p2) => {
          if (p1 && p2 === varName) {
            return `${p1} _${p2} =`;
          }
          return match;
        });
      }
      
      if (modifiedContent !== lastModifiedContent) {
        changesCount++;
      }
    }
  }
  
  // If changes were made, write the file
  if (changesCount > 0) {
    try {
      fs.writeFileSync(filePath, modifiedContent);
      console.log(`Fixed ${unusedVars.length} unused variables in ${filePath}`);
      return true;
    } catch (err) {
      console.error(`Error writing file ${filePath}: ${err.message}`);
      return false;
    }
  }
  
  console.log(`No changes needed in ${filePath}`);
  return false;
}

// Function to find all files with ESLint unused variable warnings
function findFilesWithUnusedVars(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      findFilesWithUnusedVars(filePath, fileList);
    } else if (
      (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) && 
      !file.endsWith('.d.ts') // Skip declaration files
    ) {
      // Check for ESLint unused variable warnings
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('is defined but never used') || 
          content.includes('is assigned a value but never used')) {
        fileList.push(filePath);
      }
    }
  }
  
  return fileList;
}

// Process all files with unused variables
function processAllFiles() {
  // Find all files with unused variables
  const files = findFilesWithUnusedVars(process.cwd());
  console.log(`Found ${files.length} files with unused variables`);
  
  let fixedFiles = 0;
  for (const file of files) {
    if (fixUnusedVariables(file)) {
      fixedFiles++;
    }
  }
  
  console.log(`Fixed unused variables in ${fixedFiles} files`);
}

// Execute the main function
processAllFiles();
