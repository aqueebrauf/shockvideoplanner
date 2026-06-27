export const PLAN_STATUS_NOT_STARTED = 'not started';
export const PLAN_STATUS_COMPLETED = 'completed';

export const PLAN_STATUSES = [
  { value: PLAN_STATUS_NOT_STARTED, label: 'Not started' },
  { value: PLAN_STATUS_COMPLETED, label: 'Completed' },
];

export function normalizePlanStatus(value) {
  if (value === PLAN_STATUS_COMPLETED) return PLAN_STATUS_COMPLETED;
  return PLAN_STATUS_NOT_STARTED;
}
