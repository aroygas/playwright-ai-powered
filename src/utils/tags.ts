/** Closed vocabulary of test tags. Use only these in test titles/`tag` options. */
export const TAGS = {
  smoke: '@smoke',
  regression: '@regression',
  api: '@api',
  /** Known-flaky test, excluded from all runs until fixed. Run with `npm run test:quarantine`. */
  quarantine: '@quarantine',
} as const;
