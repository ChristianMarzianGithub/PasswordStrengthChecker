import { describe, expect, it } from 'vitest';
import { detectDictionary, normalizeLeet } from '../dictionary';

describe('dictionary detection', () => {
  it('detects common words', () => {
    expect(detectDictionary('mypassword123')).toContain('password');
  });

  it('detects leetspeak variants', () => {
    expect(detectDictionary('p@ssw0rd')).toContain('password');
    expect(normalizeLeet('p@ssw0rd')).toBe('password');
  });
});
