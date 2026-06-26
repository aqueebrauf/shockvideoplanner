import { normalizeExternalUrl } from './externalUrl';

const STORAGE_KEY = 'shock-plan-data';

export function normalizeScreen(screen) {
  return {
    name: screen.name ?? '',
    copy: screen.copy ?? '',
  };
}

export function normalizePlan(row) {
  return {
    id: row.id,
    generatedDate: row.generatedDate ?? '',
    hook: row.hook ?? '',
    goalName: row.goalName ?? '',
    screens: Array.isArray(row.screens)
      ? row.screens.map(normalizeScreen)
      : [],
    referenceVideoLink: normalizeExternalUrl(row.referenceVideoLink ?? ''),
    caption: row.caption ?? '',
  };
}

export function loadPlan(baseline) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(normalizePlan);
    }
  } catch {
    /* fall through */
  }

  return baseline.map(normalizePlan);
}

export function savePlan(plan) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export function nextPlanId(plan) {
  if (plan.length === 0) return 1;
  return Math.max(...plan.map((row) => row.id)) + 1;
}
