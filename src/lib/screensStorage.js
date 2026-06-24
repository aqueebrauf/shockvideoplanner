const STORAGE_KEY = 'shock-screens-data';
const LEGACY_KEY = 'shock-screens-overrides';

export function normalizeScreen(row) {
  return {
    id: row.id,
    name: row.name ?? '',
    image: row.image ?? null,
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
  return baseline.map((screen) => {
    const base = normalizeScreen(screen);
    const saved = overrides[String(screen.id)];
    if (!saved) return base;

    return {
      ...base,
      name: saved.name ?? base.name,
      image: 'image' in saved ? saved.image : base.image,
    };
  });
}

export function loadScreens(baseline) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(normalizeScreen);
    }
  } catch {
    /* fall through */
  }

  const legacy = loadLegacyOverrides();
  if (Object.keys(legacy).length > 0) {
    const migrated = mergeLegacy(baseline, legacy);
    saveScreens(migrated);
    localStorage.removeItem(LEGACY_KEY);
    return migrated;
  }

  return baseline.map(normalizeScreen);
}

export function saveScreens(screens) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(screens));
}

export function nextScreenId(screens) {
  if (screens.length === 0) return 1;
  return Math.max(...screens.map((s) => s.id)) + 1;
}
