const STORAGE_KEY = 'shock-screens-overrides';

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

export function mergeScreens(baseline, overrides) {
  return baseline.map((screen) => {
    const saved = overrides[String(screen.id)];
    if (!saved) return { ...screen, image: screen.image ?? null };

    return {
      ...screen,
      name: saved.name ?? screen.name,
      image: 'image' in saved ? saved.image : (screen.image ?? null),
    };
  });
}

export function patchScreen(overrides, id, patch) {
  const key = String(id);
  return { ...overrides, [key]: { ...overrides[key], ...patch } };
}
