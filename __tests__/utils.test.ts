// @ts-nocheck
import { sanitizeHtml, logger, formatCurrency } from '@/lib/utils';

describe('Utils', () => {
  describe('sanitizeHtml', () => {
    it('should sanitize HTML by removing dangerous tags', () => {
      const dirtyHtml = '<p>Safe text</p><script>alert("XSS")</script>';
      const cleanHtml = sanitizeHtml(dirtyHtml);

      expect(cleanHtml).toContain('<p>Safe text</p>');
      expect(cleanHtml).not.toContain('<script>');
      expect(cleanHtml).not.toContain('alert("XSS")');
    });

    it('should allow permitted tags', () => {
      const html =
        '<p>Text with <b>bold</b> and <i>italic</i> and <a href="https://example.com">link</a></p>';
      const sanitized = sanitizeHtml(html);

      expect(sanitized).toEqual(html);
    });
  });

  describe('logger', () => {
    const originalConsole = { ...console };
    const mockConsole = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    beforeEach(() => {
      // Replace console methods with mocks
      console.debug = mockConsole.debug;
      console.info = mockConsole.info;
      console.warn = mockConsole.warn;
      console.error = mockConsole.error;
    });

    afterEach(() => {
      // Restore original console methods
      console.debug = originalConsole.debug;
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
    });

    it('should log debug messages only in non-production', () => {
      const originalNodeEnv = process.env.NODE_ENV;

      process.env.NODE_ENV = 'development';
      logger.debug('Test debug message');
      expect(mockConsole.debug).toHaveBeenCalledWith('Test debug message');

      mockConsole.debug.mockClear();
      process.env.NODE_ENV = 'production';
      logger.debug('Test debug message');
      expect(mockConsole.debug).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should format error objects correctly', () => {
      const testError = new Error('Test error message');
      logger.error('Error occurred', testError);

      expect(mockConsole.error).toHaveBeenCalledWith('Error occurred', testError);
    });
  });

  describe('formatCurrency', () => {
    it('should format number as currency', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(1000)).toBe('$1,000.00');
    });

    it('should support different currencies', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
      expect(formatCurrency(1234.56, 'JPY')).toBe('¥1,234.56'); // JPY formatting may vary based on locale
    });

    it('should support compact notation', () => {
      expect(formatCurrency(1234567.89, 'USD', true)).toBe('$1.23M');
      expect(formatCurrency(1234.56, 'USD', true)).toBe('$1.23K');
    });
  });
});
