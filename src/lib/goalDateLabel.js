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

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_DAY_RE = /^([A-Za-z]+)\s+(\d{1,2})(?:,?\s*(\d{4}))?$/;

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isValidYmd(year, monthIndex, day) {
  const date = new Date(year, monthIndex, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === monthIndex &&
    date.getDate() === day
  );
}

export function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatShortDate(date) {
  const label = `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}`;
  if (date.getFullYear() === new Date().getFullYear()) return label;
  return `${label}, ${date.getFullYear()}`;
}

export function formatPlanDate(date = new Date()) {
  return formatShortDate(date);
}

export function parseGoalDate(dateStr) {
  if (!dateStr?.trim()) return null;

  const raw = dateStr.trim();
  const iso = raw.match(ISO_DATE_RE);
  if (iso) {
    const year = Number(iso[1]);
    const monthIndex = Number(iso[2]) - 1;
    const day = Number(iso[3]);
    if (!isValidYmd(year, monthIndex, day)) return null;
    return new Date(year, monthIndex, day);
  }

  const match = raw.match(MONTH_DAY_RE);
  if (!match) return null;

  const monthIndex = MONTHS[match[1].toLowerCase().slice(0, 3)];
  if (monthIndex === undefined) return null;

  const day = Number(match[2]);
  const year = match[3] ? Number(match[3]) : new Date().getFullYear();
  if (!isValidYmd(year, monthIndex, day)) return null;

  return new Date(year, monthIndex, day);
}

export function toDateInputValue(dateStr) {
  const parsed = parseGoalDate(dateStr);
  return parsed ? formatDateInputValue(parsed) : '';
}

export function formatGoalDateLabel(dateStr) {
  const parsed = parseGoalDate(dateStr);
  if (!parsed) return dateStr?.trim() || '';

  const today = startOfDay(new Date());
  const target = startOfDay(parsed);
  const diffDays = Math.round((today - target) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return formatShortDate(parsed);
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
