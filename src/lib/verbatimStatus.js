export const VERBATIM_STATUS = {
  NOT_STARTED: 'not_started',
  EXTRACTED: 'extracted',
};

export const VERBATIM_STATUS_OPTIONS = [
  { value: VERBATIM_STATUS.NOT_STARTED, label: 'Not started' },
  { value: VERBATIM_STATUS.EXTRACTED, label: 'Extracted' },
];

export function normalizeVerbatimStatus(status) {
  return status === VERBATIM_STATUS.EXTRACTED
    ? VERBATIM_STATUS.EXTRACTED
    : VERBATIM_STATUS.NOT_STARTED;
}
