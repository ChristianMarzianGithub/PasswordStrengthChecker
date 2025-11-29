import { detectDictionary, isCommonPassword } from './dictionary';
import { estimateEntropy } from './entropy';
import { detectPatterns } from './patterns';
import { buildSuggestions } from './suggestions';
import { StrengthCategory, StrengthResult } from './types';

export function evaluatePassword(password: string): StrengthResult {
  const { entropyBits, crackTime } = estimateEntropy(password);
  const patterns = detectPatterns(password);
  const dictionaryMatches = detectDictionary(password);
  const weak = isCommonPassword(password);

  let score = 0;
  // length
  if (password.length >= 16) score += 30;
  else if (password.length >= 12) score += 20;
  else if (password.length >= 8) score += 10;

  // variety
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^\w\s]/, /[`~¡¿§±•¶¡¢£¤¥¦¨©«¬®¯°±²³´µ·¸º»¼½¾¿÷×§]/];
  let varietyScore = 0;
  for (const regex of variety) {
    if (regex.test(password)) varietyScore += 5;
  }
  score += Math.min(varietyScore, 25);

  // entropy contribution scaled
  const entropyScore = Math.min(25, Math.round(entropyBits / 3));
  score += entropyScore;

  const warnings: string[] = [];

  for (const match of patterns) {
    warnings.push(match.details);
    score -= 10;
  }

  if (dictionaryMatches.length) {
    warnings.push(`Contains dictionary word: ${dictionaryMatches.join(', ')}`);
    score -= 15;
  }

  if (weak) {
    warnings.push('Matches a known weak password.');
    score -= 25;
  }

  if (password.length < 8) {
    warnings.push('Too short; use at least 12 characters.');
    score -= 20;
  }

  score = Math.max(0, Math.min(100, score));

  const category = computeCategory(score);
  const suggestions = buildSuggestions(password);

  return {
    password,
    score,
    category,
    entropyBits: Math.round(entropyBits * 10) / 10,
    crackTime,
    warnings: [...new Set(warnings)],
    suggestions,
    patterns
  };
}

function computeCategory(score: number): StrengthCategory {
  if (score <= 20) return 'Very Weak';
  if (score <= 40) return 'Weak';
  if (score <= 60) return 'Medium';
  if (score <= 80) return 'Strong';
  return 'Very Strong';
}
