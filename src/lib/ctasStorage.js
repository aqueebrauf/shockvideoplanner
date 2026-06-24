const STORAGE_KEY = 'shock-ctas-data';

export function normalizeCta(row) {
  return {
    id: row.id,
    text: row.text ?? '',
  };
}

export function loadCtas(baseline) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(normalizeCta);
    }
  } catch {
    /* fall through */
  }

  return baseline.map(normalizeCta);
}

export function saveCtas(ctas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ctas));
}

export function nextCtaId(ctas) {
  if (ctas.length === 0) return 1;
  return Math.max(...ctas.map((c) => c.id)) + 1;
}

export const DEFAULT_CTA_ID = 3;
