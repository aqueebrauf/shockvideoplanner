import { parseGoalDate } from './goalDateLabel';

export function formatPlanSerial(id) {
  return String(id).padStart(4, '0');
}

export function sortPlansByRecent(plan) {
  return [...plan].sort((a, b) => {
    const dateA = parseGoalDate(a.generatedDate);
    const dateB = parseGoalDate(b.generatedDate);

    if (!dateA && !dateB) return b.id - a.id;
    if (!dateA) return b.id - a.id;
    if (!dateB) return b.id - a.id;

    const diff = dateB - dateA;
    if (diff !== 0) return diff;

    return b.id - a.id;
  });
}

export function sortPlansByOldest(plan) {
  return [...plan].sort((a, b) => {
    const dateA = parseGoalDate(a.generatedDate);
    const dateB = parseGoalDate(b.generatedDate);

    if (!dateA && !dateB) return a.id - b.id;
    if (!dateA) return a.id - b.id;
    if (!dateB) return a.id - b.id;

    const diff = dateA - dateB;
    if (diff !== 0) return diff;

    return a.id - b.id;
  });
}
