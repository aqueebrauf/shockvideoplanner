const STORAGE_KEY = 'shock-hashtags-data';
const LEGACY_KEY = 'shock-hashtags-overrides';

export const CATEGORIES = ['broad', 'medium', 'niche'];

export function normalizeHashtag(row) {
  return {
    id: row.id,
    hashtag: row.hashtag ?? '',
    posts: row.posts ?? null,
    category: row.category ?? 'broad',
    notes: row.notes ?? '',
  };
}

function loadLegacyOverrides() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function mergeLegacy(baseline, overrides) {
  return baseline.map((row) => {
    const base = normalizeHashtag(row);
    const saved = overrides[String(row.id)];
    if (!saved) return base;

    return {
      ...base,
      hashtag: saved.hashtag ?? base.hashtag,
      posts: saved.posts ?? base.posts,
      category: saved.category ?? base.category,
      notes: saved.notes ?? base.notes,
    };
  });
}

export function loadHashtags(baseline) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(normalizeHashtag);
    }
  } catch {
    /* fall through */
  }

  const legacy = loadLegacyOverrides();
  if (Object.keys(legacy).length > 0) {
    const migrated = mergeLegacy(baseline, legacy);
    saveHashtags(migrated);
    localStorage.removeItem(LEGACY_KEY);
    return migrated;
  }

  return baseline.map(normalizeHashtag);
}

export function saveHashtags(hashtags) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hashtags));
}

export function nextHashtagId(hashtags) {
  if (hashtags.length === 0) return 1;
  return Math.max(...hashtags.map((h) => h.id)) + 1;
}
