# ESLint TypeScript Configuration for BlockSwarms

The ESLint configuration for this project has been enhanced to include TypeScript-specific rules that will help catch potential issues early in the development process.

## Configuration Changes

The ESLint configuration in `.eslintrc.json` has been updated to include:

1. TypeScript ESLint parser and plugins
2. Recommended TypeScript rules
3. Custom rules for:
   - Unused variables (require underscore prefix)
   - Console usage (warn on direct console.log usage)
   - Any type usage (warn when explicit any is used)

## Running ESLint

To check your code for issues:

```bash
npm run lint
```

To automatically fix issues where possible:

```bash
npm run lint -- --fix
```

## Common Issues Detected

The configured ESLint rules help catch several common issues:

1. **Unused Variables**: All unused variables should be prefixed with an underscore to indicate they are intentionally unused.

   ```typescript
   // ❌ Bad
   function doSomething(param) {
     // param is never used
   }
   
   // ✅ Good
   function doSomething(_param) {
     // _param is intentionally unused
   }
   ```

2. **Direct Console Usage**: The configuration warns about direct `console.log` usage, promoting the use of the logger utility instead.

   ```typescript
   // ❌ Bad
   console.log('Debug info');
   
   // ✅ Good
   import { logger } from '@/lib/logger';
   logger.log('Debug info');
   ```

3. **Any Type**: Using `any` type is discouraged as it bypasses TypeScript's type checking.

   ```typescript
   // ❌ Bad
   function processData(data: any) {
     return data.value;
   }
   
   // ✅ Good
   interface Data {
     value: string;
   }
   
   function processData(data: Data) {
     return data.value;
   }
   ```

## Manual Fixes for Circular Dependencies

If you encounter circular dependency issues, consider the following approaches:

1. **Extract Shared Code**: Move shared code that creates circular dependencies to a separate utility file.

2. **Interface-based Communication**: Use interfaces to define the contract between modules rather than direct references.

3. **Inversion of Control**: Use dependency injection patterns to avoid direct dependencies.

4. **Lazy Loading**: Import modules dynamically when needed instead of at the top of the file.

   ```typescript
   // Instead of:
   import { CircularDependency } from './circular';
   
   // Use:
   async function loadCircularDependency() {
     const { CircularDependency } = await import('./circular');
     return CircularDependency;
   }
   ```

## Staged Rollout Suggestion

For large codebases with many existing issues, consider a staged rollout:

1. Start by fixing the logger-related issues (highest priority)
2. Address unused variable warnings (requires minimal code changes)
3. Gradually tackle type-related warnings (may require more extensive refactoring)

## IDE Integration

For the best development experience, configure your IDE to show ESLint errors and warnings in real-time:

### VS Code
1. Install the ESLint extension
2. Add this to your settings.json:
   ```json
   "editor.codeActionsOnSave": {
     "source.fixAll.eslint": true
   },
   "eslint.validate": ["javascript", "typescript", "typescriptreact"]
   ```

### WebStorm/IntelliJ
1. Go to Preferences → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. Enable "Automatic ESLint configuration"
3. Check "Run eslint --fix on save"
