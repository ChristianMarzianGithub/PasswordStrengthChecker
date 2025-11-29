import { describe, expect, it } from 'vitest';
import { buildSuggestions } from '../suggestions';

describe('suggestions', () => {
  it('suggests adding variety', () => {
    const suggestions = buildSuggestions('aaaa');
    expect(suggestions.some((s) => s.toLowerCase().includes('uppercase'))).toBe(true);
  });

  it('suggests avoiding repeats', () => {
    const suggestions = buildSuggestions('aaaaAAAA');
    expect(suggestions.some((s) => s.includes('repeated'))).toBe(true);
  });
});
