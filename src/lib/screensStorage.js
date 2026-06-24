const STORAGE_KEY = 'shock-screens-data';
const LEGACY_KEY = 'shock-screens-overrides';

export function normalizeScreen(row) {
  return {
    id: row.id,
    name: row.name ?? '',
    image: row.image ?? null,
    suggestedCopy: row.suggestedCopy ?? '',
  };
}

function mergeBaselineSuggestedCopy(screens, baseline) {
  const baselineById = Object.fromEntries(
    baseline.map((screen) => [screen.id, normalizeScreen(screen)])
  );

  return screens.map((screen) => {
    const normalized = normalizeScreen(screen);
    if (normalized.suggestedCopy.trim()) return normalized;

    const base = baselineById[screen.id];
    if (!base?.suggestedCopy?.trim()) return normalized;

    return { ...normalized, suggestedCopy: base.suggestedCopy };
  });
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

function migrateMergedScreens3And4(screens) {
  if (screens.length !== 14) return screens;

  const byId = Object.fromEntries(screens.map((screen) => [screen.id, screen]));
  const old3 = byId[3];
  const old4 = byId[4];
  if (!old3 || !old4 || old4.name !== 'Set goals') return screens;

  const merged3 = normalizeScreen({
    id: 3,
    name: 'Clicking on hamburger menu to open Set goals',
    image: old4.image ?? old3.image ?? null,
    suggestedCopy: 'Set your goal',
  });

  return screens
    .filter((screen) => screen.id !== 3 && screen.id !== 4)
    .map((screen) => (screen.id > 4 ? { ...screen, id: screen.id - 1 } : screen))
    .concat(merged3)
    .sort((a, b) => a.id - b.id)
    .map(normalizeScreen);
}

export function loadScreens(baseline) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const migrated = migrateMergedScreens3And4(parsed);
        if (migrated !== parsed) {
          saveScreens(migrated);
        }
        return mergeBaselineSuggestedCopy(migrated, baseline);
      }
    }
  } catch {
    /* fall through */
  }

  const legacy = loadLegacyOverrides();
  if (Object.keys(legacy).length > 0) {
    const migrated = mergeLegacy(baseline, legacy);
    saveScreens(migrated);
    localStorage.removeItem(LEGACY_KEY);
    return mergeBaselineSuggestedCopy(migrated, baseline);
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
