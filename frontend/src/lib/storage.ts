import { StrengthResult } from './types';

const HISTORY_KEY = 'psc-history-v1';

export function saveToHistory(result: StrengthResult) {
  if (typeof localStorage === 'undefined') return;
  const existing = loadHistory();
  const masked = maskPassword(result.password);
  const entry = { ...result, password: masked, timestamp: Date.now() };
  const next = [entry, ...existing].slice(0, 10);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function loadHistory(): Array<StrengthResult & { timestamp: number }> {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse history', e);
    return [];
  }
}

function maskPassword(password: string) {
  if (password.length <= 2) return '*'.repeat(password.length);
  const visible = password.slice(-2);
  return `${'*'.repeat(Math.max(0, password.length - 2))}${visible}`;
}
