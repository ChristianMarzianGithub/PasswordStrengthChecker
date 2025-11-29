const COMMON_WORDS = [
  'password',
  'letmein',
  'welcome',
  'dragon',
  'monkey',
  'qwerty',
  'baseball',
  'football',
  'sunshine',
  'admin',
  'trustno1',
  'iloveyou',
  'princess'
];

const LEET_MAP: Record<string, string> = {
  '@': 'a',
  '4': 'a',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '0': 'o',
  '$': 's',
  '5': 's',
  '7': 't'
};

export function normalizeLeet(password: string) {
  return password
    .toLowerCase()
    .split('')
    .map((char) => LEET_MAP[char] ?? char)
    .join('');
}

export function detectDictionary(password: string) {
  const normalized = password.toLowerCase();
  const normalizedLeet = normalizeLeet(password);
  const matches: string[] = [];

  for (const word of COMMON_WORDS) {
    const reversed = word.split('').reverse().join('');
    if (
      normalized.includes(word) ||
      normalized.includes(reversed) ||
      normalizedLeet.includes(word)
    ) {
      matches.push(word);
    }
  }
  return matches;
}

export function isCommonPassword(password: string) {
  return COMMON_WORDS.includes(password.toLowerCase());
}

export { COMMON_WORDS };
