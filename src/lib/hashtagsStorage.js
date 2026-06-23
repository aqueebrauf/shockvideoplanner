const STORAGE_KEY = 'shock-hashtags-overrides';

export const CATEGORIES = ['broad', 'medium', 'niche'];

export function loadOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveOverrides(overrides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function mergeHashtags(baseline, overrides) {
  return baseline.map((row) => {
    const base = {
      ...row,
      posts: row.posts ?? null,
      category: row.category ?? 'broad',
      notes: row.notes ?? '',
    };
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

export function patchHashtag(overrides, id, patch) {
  const key = String(id);
  return { ...overrides, [key]: { ...overrides[key], ...patch } };
}
