const STORAGE_KEY = 'shock-captions-data';

export function normalizeCaption(row) {
  return {
    id: row.id,
    style: row.style ?? '',
    structure: row.structure ?? '',
    guide: row.guide ?? '',
    example: row.example ?? '',
  };
}

export function loadCaptions(baseline) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(normalizeCaption);
    }
  } catch {
    /* fall through */
  }

  return baseline.map(normalizeCaption);
}

export function saveCaptions(captions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(captions));
}

export function nextCaptionId(captions) {
  if (captions.length === 0) return 1;
  return Math.max(...captions.map((c) => c.id)) + 1;
}
