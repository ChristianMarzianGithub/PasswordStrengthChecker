export type StrengthCategory = 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';

export interface PatternMatch {
  type: 'keyboard' | 'repeat' | 'sequence' | 'weak-password' | 'dictionary';
  details: string;
}

export interface StrengthResult {
  password: string;
  score: number;
  category: StrengthCategory;
  entropyBits: number;
  crackTime: string;
  warnings: string[];
  suggestions: string[];
  patterns: PatternMatch[];
  breach?: {
    checked: boolean;
    found: boolean;
    count?: number;
  };
}
