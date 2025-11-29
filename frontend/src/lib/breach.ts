import { sha1 } from 'js-sha1';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export async function checkPwned(password: string) {
  const hash = sha1(password).toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const res = await fetch(`${API_BASE}/pwned?hashPrefix=${prefix}`);
  if (!res.ok) throw new Error('Failed to check breach status');
  const data = (await res.json()) as { hashes?: string[] };
  const foundLine = data.hashes?.find((h) => h.startsWith(suffix));
  if (foundLine) {
    const [, count] = foundLine.split(':');
    return { found: true, count: Number(count) };
  }
  return { found: false };
}
