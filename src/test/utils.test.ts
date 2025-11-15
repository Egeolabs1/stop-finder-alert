/**
 * Testes para utilitários
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { debounce, throttle } from '@/utils/debounce';
import { formatNumber, formatDate, formatDistance, isRTL } from '@/utils/i18n';

describe('debounce', () => {
  it('should delay function execution', async () => {
    let callCount = 0;
    const fn = debounce(() => {
      callCount++;
    }, 100);

    fn();
    expect(callCount).toBe(0);

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(callCount).toBe(1);
  });

  it('should cancel previous calls', async () => {
    let callCount = 0;
    const fn = debounce(() => {
      callCount++;
    }, 100);

    fn();
    fn();
    fn();

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(callCount).toBe(1);
  });
});

describe('throttle', () => {
  it('should limit function execution rate', async () => {
    let callCount = 0;
    const fn = throttle(() => {
      callCount++;
    }, 100);

    fn();
    fn();
    fn();

    expect(callCount).toBe(1);

    await new Promise((resolve) => setTimeout(resolve, 150));
    fn();
    expect(callCount).toBe(2);
  });
});

describe('i18n utilities', () => {
  describe('formatNumber', () => {
    it('should format number in Portuguese', () => {
      expect(formatNumber(1234.56, 'pt')).toBe('1.234,56');
    });

    it('should format number in English', () => {
      expect(formatNumber(1234.56, 'en')).toBe('1,234.56');
    });
  });

  describe('formatDate', () => {
    it('should format date', () => {
      const date = new Date('2025-01-15T10:30:00');
      const formatted = formatDate(date, 'pt', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      expect(formatted).toContain('2025');
    });
  });

  describe('formatDistance', () => {
    it('should format distance in meters', () => {
      expect(formatDistance(500, 'pt')).toBe('500 m');
    });

    it('should format distance in kilometers', () => {
      expect(formatDistance(1500, 'pt')).toContain('km');
    });
  });

  describe('isRTL', () => {
    it('should return false for LTR languages', () => {
      expect(isRTL('pt')).toBe(false);
      expect(isRTL('en')).toBe(false);
    });
  });
});



