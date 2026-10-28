import { defineConfig } from 'allure';

// Allure 3 config. History is kept across runs in a JSONL file that CI restores/saves
// (GitHub: gh-pages branch / artifact; GitLab: cache), see docs/CI.md.
export default defineConfig({
  name: 'Playwright AI-powered',
  output: './allure-report',
  historyPath: './allure-history/history.jsonl',
  plugins: {
    awesome: {
      options: {
        reportName: 'Playwright AI-powered',
        singleFile: false,
        reportLanguage: 'en',
      },
    },
  },
});
