const STORAGE_KEY = 'shock-goals-overrides';

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

export function mergeGoals(baseline, overrides) {
  return baseline.map((row) => {
    const base = {
      ...row,
      title: row.title ?? '',
      link: row.link ?? '',
    };
    const saved = overrides[String(row.id)];
    if (!saved) return base;

    return {
      ...base,
      title: saved.title ?? base.title,
      link: saved.link ?? base.link,
    };
  });
}

export function patchGoal(overrides, id, patch) {
  const key = String(id);
  return { ...overrides, [key]: { ...overrides[key], ...patch } };
}
