const INSTAGRAM_USERNAME = /^[a-z0-9._]{1,30}$/i;

export function normalizeUsername(value: string): string | null {
  const username = value.trim().replace(/^@+/, "").toLowerCase();
  return INSTAGRAM_USERNAME.test(username) ? username : null;
}

export function profileUrl(username: string): string | null {
  const normalized = normalizeUsername(username);
  return normalized ? `https://www.instagram.com/${encodeURIComponent(normalized)}/` : null;
}

export function uniqueUsernames(values: string[]): string[] {
  return [...new Set(values.map(normalizeUsername).filter((value): value is string => Boolean(value)))];
}
