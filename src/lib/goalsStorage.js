const STORAGE_KEY = 'shock-goals-data';
const LEGACY_KEY = 'shock-goals-overrides';

export function normalizeGoal(row) {
  return {
    id: row.id,
    title: row.title ?? '',
    link: row.link ?? '',
    date: row.date ?? '',
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
  return baseline
    .map((row) => {
      const base = normalizeGoal(row);
      const saved = overrides[String(row.id)];
      if (!saved) return base;
      return {
        ...base,
        title: saved.title ?? base.title,
        link: saved.link ?? base.link,
        date: saved.date ?? base.date,
      };
    })
    .filter((row) => row.id !== 3 && row.title !== 'Build my dream body');
}

export function loadGoals(baseline) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(normalizeGoal);
    }
  } catch {
    /* fall through */
  }

  const legacy = loadLegacyOverrides();
  if (Object.keys(legacy).length > 0) {
    const migrated = mergeLegacy(baseline, legacy);
    saveGoals(migrated);
    localStorage.removeItem(LEGACY_KEY);
    return migrated;
  }

  return baseline.map(normalizeGoal);
}

export function saveGoals(goals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

export function nextGoalId(goals) {
  if (goals.length === 0) return 1;
  return Math.max(...goals.map((g) => g.id)) + 1;
}
