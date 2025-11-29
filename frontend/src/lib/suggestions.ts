import { COMMON_SYMBOLS, UNCOMMON_SYMBOLS } from './entropy';
import { detectDictionary, isCommonPassword } from './dictionary';
import { detectPatterns } from './patterns';

export function buildSuggestions(password: string) {
  const suggestions: string[] = [];
  if (password.length < 12) suggestions.push('Increase length to at least 12 characters.');
  if (!/[a-z]/.test(password)) suggestions.push('Add lowercase letters.');
  if (!/[A-Z]/.test(password)) suggestions.push('Add uppercase letters.');
  if (!/\d/.test(password)) suggestions.push('Add numbers.');
  if (!new RegExp(`[${escapeForRegex(COMMON_SYMBOLS + UNCOMMON_SYMBOLS)}]`).test(password)) {
    suggestions.push('Include symbols to expand the character set.');
  }

  const patterns = detectPatterns(password);
  if (patterns.some((p) => p.type === 'repeat')) suggestions.push('Avoid repeated characters.');
  if (patterns.some((p) => p.type === 'sequence')) suggestions.push('Break predictable sequences like 1234.');
  if (patterns.some((p) => p.type === 'keyboard')) suggestions.push('Avoid keyboard patterns like qwerty.');

  const dictionaryMatches = detectDictionary(password);
  if (dictionaryMatches.length > 0) suggestions.push('Remove dictionary words or replace them with unique phrases.');
  if (isCommonPassword(password)) suggestions.push('Start from a unique passphrase, not a known weak password.');

  return [...new Set(suggestions)];
}

function escapeForRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
