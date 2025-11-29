import { PatternMatch } from './types';

const KEYBOARD_SEQUENCES = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890', 'password'];

export function detectPatterns(password: string): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const lower = password.toLowerCase();

  if (/^(.)\1{3,}$/.test(password)) {
    matches.push({ type: 'repeat', details: 'Contains long repeated characters' });
  }

  if (/([a-zA-Z0-9])\1{2,}/.test(password)) {
    matches.push({ type: 'repeat', details: 'Has repeated character groups' });
  }

  if (/(0123|1234|2345|3456|4567|5678|6789)/.test(lower) || /(abcd|bcde|cdef|fghi|ijkl|lmno|mnop)/.test(lower)) {
    matches.push({ type: 'sequence', details: 'Contains sequential patterns' });
  }

  for (const sequence of KEYBOARD_SEQUENCES) {
    if (hasSubsequence(lower, sequence, 4)) {
      matches.push({ type: 'keyboard', details: `Keyboard pattern like ${sequence}` });
      break;
    }
  }

  return matches;
}

function hasSubsequence(text: string, sequence: string, minLength: number) {
  for (let i = 0; i <= sequence.length - minLength; i++) {
    const segment = sequence.slice(i, i + minLength);
    if (text.includes(segment)) {
      return true;
    }
  }
  return false;
}
