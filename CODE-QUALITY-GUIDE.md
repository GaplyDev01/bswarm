# BlockSwarms Code Quality Guide

This guide outlines the tools and practices we've implemented to maintain high code quality standards throughout the BlockSwarms codebase.

## Code Quality Tools

### 1. ESLint for TypeScript

We've configured ESLint with TypeScript-specific rules to catch potential issues early in the development process.

**Key Features:**
- TypeScript type checking integration
- Warning for unused variables
- Warning for explicit `any` types
- Warning for direct `console.log` usage

**Usage:**
```bash
# Run ESLint
npm run lint

# Auto-fix issues where possible
npm run lint -- --fix
```

### 2. Prettier for Code Formatting

Prettier ensures consistent code formatting across the entire codebase, eliminating debates about code style.

**Key Configuration:**
- Single quotes for strings
- 2-space indentation
- 100 character line width
- Semi-colons required
- ES5 trailing commas

**Usage:**
```bash
# Format all files
npm run format

# Check if files are properly formatted
npm run format:check
```

### 3. Console Log Management

We've implemented a system to ensure `console.log` statements don't appear in production code.

**Tools:**
- ESLint rule to warn about direct console usage
- Script to scan for console logs
- Script to automatically remove/guard console logs in production

**Usage:**
```bash
# Check for console logs
npm run check-console-logs

# Remove console logs in production build
npm run remove-console-logs
```

### 4. TypeScript Type Checking

Strict TypeScript checking helps catch type-related errors before runtime.

**Usage:**
```bash
# Run TypeScript type checking
npm run typecheck
```

### 5. Jest for Testing

Jest is configured for unit and integration testing.

**Usage:**
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## Pre-Deployment Quality Checks

Before deploying, you should run the full preflight check:

```bash
npm run preflight
```

This will:
1. Run ESLint to check for code issues
2. Run TypeScript to verify type correctness
3. Check for console logs
4. Run a security audit

## IDE Setup Recommendations

### VS Code

1. **Install Extensions:**
   - ESLint
   - Prettier
   - TypeScript and JavaScript Language Features

2. **Settings:**
   Add to your `.vscode/settings.json`:
   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
     "typescript.tsdk": "node_modules/typescript/lib"
   }
   ```

### JetBrains WebStorm/IntelliJ

1. Enable ESLint in Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. Enable Prettier in Settings → Languages & Frameworks → JavaScript → Prettier
3. Enable "Run on save" for both tools

## Recommended Git Hooks

For enforcing code quality on every commit, consider setting up Husky with lint-staged:

```bash
# Install dependencies
npm install --save-dev husky lint-staged
npx husky init

# Add this to your package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}

# Create pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

## Best Practices

### TypeScript

1. **Avoid `any` Type**
   ```typescript
   // ❌ Avoid
   function processData(data: any) {}
   
   // ✅ Better
   interface Data {
     id: string;
     value: number;
   }
   function processData(data: Data) {}
   ```

2. **Use Type Inference When Obvious**
   ```typescript
   // ❌ Redundant
   const count: number = 5;
   
   // ✅ Better (type is inferred)
   const count = 5;
   ```

3. **Use Function Return Types**
   ```typescript
   // ❌ Implicit return type
   function getData() { return { value: 42 }; }
   
   // ✅ Explicit return type
   function getData(): { value: number } { return { value: 42 }; }
   ```

### Logging

1. **Use the Logger Utility**
   ```typescript
   // ❌ Avoid
   console.log('User signed in');
   
   // ✅ Better
   import { logger } from '@/lib/logger';
   logger.log('User signed in');
   ```

2. **Include Contextual Information**
   ```typescript
   // ❌ Limited context
   logger.error('Operation failed');
   
   // ✅ Better context
   logger.error('User registration failed', { 
     userId, 
     errorCode,
     timestamp: new Date().toISOString()
   });
   ```

### React Components

1. **Use Function Components**
   ```typescript
   // ✅ Use function components with hooks
   function UserProfile({ userId }: { userId: string }) {
     // Component logic
     return <div>...</div>;
   }
   ```

2. **Memoize Expensive Calculations**
   ```typescript
   // ✅ Use useMemo for expensive calculations
   const sortedItems = useMemo(() => {
     return [...items].sort((a, b) => a.value - b.value);
   }, [items]);
   ```

3. **Avoid Inline Function Props When Possible**
   ```typescript
   // ❌ Creates new function on each render
   <Button onClick={() => handleClick(id)} />
   
   // ✅ Better for frequently re-rendered components
   const handleItemClick = useCallback(() => {
     handleClick(id);
   }, [id, handleClick]);
   
   <Button onClick={handleItemClick} />
   ```

## Continuous Improvement

Code quality is an ongoing process. Regularly review and update these standards as the project evolves. Consider implementing:

1. Regular code reviews
2. Automated PR checks
3. Code quality metrics tracking
4. Documentation updates
