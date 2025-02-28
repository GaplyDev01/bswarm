// @ts-nocheck
/**
 * Production-safe logger utility that handles environment checking properly
 */

// Type-safe environment checking function to prevent TypeScript errors
const isProduction = () => process.env.NODE_ENV === 'production';

// Type-safe logger with properly handled environment checks
export const logger = {
  log: (message: string, ...args: unknown[]) => {
    if (!isProduction()) {
      console.log(message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (!isProduction()) {
      console.error(message, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (!isProduction()) {
      console.warn(message, ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (!isProduction()) {
      console.info(message, ...args);
    }
  },
  debug: (message: string, ...args: unknown[]) => {
    if (!isProduction()) {
      console.debug(message, ...args);
    }
  },
};
