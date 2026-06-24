const MONTHS = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatPlanDate(date = new Date()) {
  return `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}`;
}

export function parseGoalDate(dateStr) {
  if (!dateStr?.trim()) return null;

  const match = dateStr.trim().match(/^([A-Za-z]{3})\s+(\d{1,2})$/);
  if (!match) return null;

  const month = MONTHS[match[1].toLowerCase().slice(0, 3)];
  if (month === undefined) return null;

  const day = parseInt(match[2], 10);
  const now = new Date();
  let year = now.getFullYear();
  let candidate = new Date(year, month, day);

  if (candidate > now) {
    const prevYear = new Date(year - 1, month, day);
    if (now - prevYear < candidate - now) {
      candidate = prevYear;
    }
  }

  return candidate;
}

export function formatGoalDateLabel(dateStr) {
  const parsed = parseGoalDate(dateStr);
  if (!parsed) return dateStr?.trim() || '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(parsed);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today - target) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return dateStr.trim();
}

export function sortGoalsByRecent(goals) {
  return [...goals].sort((a, b) => {
    const dateA = parseGoalDate(a.date);
    const dateB = parseGoalDate(b.date);

    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    return dateB - dateA;
  });
}
