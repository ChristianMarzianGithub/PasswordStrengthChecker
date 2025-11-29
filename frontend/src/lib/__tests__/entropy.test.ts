import { describe, expect, it } from 'vitest';
import { estimateEntropy } from '../entropy';

describe('estimateEntropy', () => {
  it('calculates higher entropy for longer passwords', () => {
    const short = estimateEntropy('abc');
    const long = estimateEntropy('abcABC123!@#');
    expect(long.entropyBits).toBeGreaterThan(short.entropyBits);
  });

  it('identifies charset size', () => {
    const result = estimateEntropy('abcABC123!');
    expect(result.charsetSize).toBeGreaterThan(26);
  });
});
