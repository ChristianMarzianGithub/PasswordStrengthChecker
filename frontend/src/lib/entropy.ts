const COMMON_SYMBOLS = "!@#$%^&*()_+-=[]{}|;:'\",.<>/?";
const UNCOMMON_SYMBOLS = '`~¡¿§±•¶¡¢£¤¥¦¨©«¬®¯°±²³´µ·¸º»¼½¾¿÷×§';

export function estimateEntropy(password: string) {
  let charsetSize = 0;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = new RegExp(`[${escapeForRegex(COMMON_SYMBOLS)}]`).test(password);
  const hasUncommon = new RegExp(`[${escapeForRegex(UNCOMMON_SYMBOLS)}]`).test(password);

  if (hasLower) charsetSize += 26;
  if (hasUpper) charsetSize += 26;
  if (hasNumber) charsetSize += 10;
  if (hasSymbol) charsetSize += COMMON_SYMBOLS.length;
  if (hasUncommon) charsetSize += UNCOMMON_SYMBOLS.length;

  const entropyBits = password.length * Math.log2(Math.max(charsetSize, 1));
  const crackTimeSeconds = Math.pow(2, entropyBits) / 1e10;

  return {
    entropyBits,
    charsetSize,
    crackTime: formatTime(crackTimeSeconds)
  };
}

function formatTime(seconds: number): string {
  if (seconds < 1) return '<1 second';
  const units: [number, string][] = [
    [60, 'minute'],
    [60, 'hour'],
    [24, 'day'],
    [30, 'month'],
    [12, 'year']
  ];

  let unitIndex = 0;
  let value = seconds;

  while (unitIndex < units.length && value >= units[unitIndex][0]) {
    value /= units[unitIndex][0];
    unitIndex++;
  }

  const label = unitIndex === 0 ? 'second' : units[unitIndex - 1][1];
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} ${label}${rounded !== 1 ? 's' : ''}`;
}

function escapeForRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export { COMMON_SYMBOLS, UNCOMMON_SYMBOLS };
