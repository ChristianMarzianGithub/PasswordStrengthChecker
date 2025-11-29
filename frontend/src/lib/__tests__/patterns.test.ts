import { describe, expect, it } from 'vitest';
import { detectPatterns } from '../patterns';

describe('detectPatterns', () => {
  it('flags keyboard sequences', () => {
    const matches = detectPatterns('qwerty2024');
    expect(matches.some((m) => m.type === 'keyboard')).toBe(true);
  });

  it('flags repeated characters', () => {
    const matches = detectPatterns('aaaaBBB');
    expect(matches.some((m) => m.type === 'repeat')).toBe(true);
  });
});
