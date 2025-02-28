# TXBT Project Guidelines

## Commands
- Build: `npm run build`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Test: `npm test`
- Single test: `npm test -- -t "test name"`
- Type check: `npm run typecheck`

## Code Style
- TypeScript with strict mode and explicit type annotations
- Next.js 13+ App Router structure
- React function components with hooks
- "use client" directive for client components
- Tailwind CSS with class-variance-authority for component variants

## Naming & Formatting
- PascalCase for components: `SignalCard`, `Header`
- camelCase for functions/variables: `useMarketData`, `handleSubmit`
- 2-space indentation, single quotes for strings
- Descriptive function and variable names

## Structure & Imports
- Absolute imports with @/ alias
- Named exports for components/utilities
- Default exports for pages
- Components organized by feature/function
- Library imports first, then absolute, then relative

## Error Handling
- Try/catch blocks with formatErrorResponse utility
- Type checking with instanceof for error types
- Consistent error responses with appropriate status codes
- Descriptive error messages with actionable information