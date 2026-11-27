/** Log terstruktur: satu event per baris JSON, tanpa secret atau body penuh. */

type Level = "error" | "warn" | "info";
type Fields = Record<string, unknown>;

const SENSITIVE_KEY = /password|secret|token|authorization|cookie|connection|dsn|apikey|credential/i;

function sanitize(fields: Fields): Fields {
  const safe: Fields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (SENSITIVE_KEY.test(key)) continue;
    if (typeof value === "string") {
      safe[key] = value.slice(0, 300);
    } else if (typeof value === "number" || typeof value === "boolean") {
      safe[key] = value;
    } else if (value === null) {
      safe[key] = null;
    }
  }
  return safe;
}

export function logEvent(level: Level, event: string, fields: Fields = {}): void {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...sanitize(fields),
  });

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}
