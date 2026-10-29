#!/usr/bin/env node
// Turns this template into your project: names, target URLs, placeholder credentials.
// Usage: npm run init:project -- --name acme-e2e --base-url https://staging.acme.com [options]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { URL, fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const USAGE = `Usage: npm run init:project -- --name <kebab-name> --base-url <url> [options]

  --name <kebab-name>   npm package name (required), e.g. acme-e2e
  --base-url <url>      Web UI under test, written to every config/env/*.env (required)
  --api-url <url>       API under test (default: keep the current value)
  --title "<Title>"     Human name for reports/README (default: derived from --name)
  --repo <owner/name>   GitHub repo, rewrites README/CONTRIBUTING badge and Pages links
  --author "<Name>"     Copyright holder in LICENSE
  --keep-credentials    Keep the demo-SUT credentials instead of resetting them to placeholders
  --dry-run             Show what would change, write nothing
  --root <dir>          Project root (default: repo root)
`;

const { values } = parseArgs({
  options: {
    name: { type: 'string' },
    'base-url': { type: 'string' },
    'api-url': { type: 'string' },
    title: { type: 'string' },
    repo: { type: 'string' },
    author: { type: 'string' },
    'keep-credentials': { type: 'boolean' },
    'dry-run': { type: 'boolean' },
    root: { type: 'string' },
    help: { type: 'boolean', short: 'h' },
  },
});

const fail = (message) => {
  process.stderr.write(`init:project: ${message}\n\n${USAGE}`);
  process.exit(1);
};

if (values.help) {
  process.stdout.write(USAGE);
  process.exit(0);
}

const root = path.resolve(
  values.root ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..'),
);
const name = values.name;
if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) fail('--name is required and must be kebab-case');
const title =
  values.title ??
  name.replace(/(^|-)([a-z0-9])/g, (_, sep, c) => (sep ? ' ' : '') + c.toUpperCase());
if (/['"\\\r\n]/.test(title)) fail('--title must not contain quotes, backslashes or newlines');

const checkUrl = (flag, value) => {
  try {
    new URL(value);
  } catch {
    fail(`${flag} must be a valid absolute URL`);
  }
};
if (!values['base-url']) fail('--base-url is required');
checkUrl('--base-url', values['base-url']);
if (values['api-url']) checkUrl('--api-url', values['api-url']);
const repo = values.repo;
if (repo && !/^[\w.-]+\/[\w.-]+$/.test(repo)) fail('--repo must look like owner/name');

const changes = new Map();
const file = (relative) => path.join(root, relative);

/** Rewrites a text file, preserving its line endings. Missing files are skipped. */
function edit(relative, transform) {
  const target = file(relative);
  if (!existsSync(target)) return;
  const original = readFileSync(target, 'utf8');
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  // Chain onto earlier edits of the same file instead of overwriting them.
  const current = changes.get(relative) ?? original;
  const updated = transform(current.replace(/\r\n/g, '\n')).replace(/\n/g, eol);
  if (updated !== original) changes.set(relative, updated);
}

const editJson = (relative, mutate) =>
  edit(relative, (text) => {
    const json = JSON.parse(text);
    mutate(json);
    return `${JSON.stringify(json, null, 2)}\n`;
  });

editJson('package.json', (pkg) => {
  pkg.name = name;
  pkg.description = `${title}: AI-ready Playwright test automation`;
  pkg.version = '0.1.0';
});
editJson('package-lock.json', (lock) => {
  lock.name = name;
  if (lock.packages?.['']) lock.packages[''].name = name;
});

edit('allurerc.mjs', (text) =>
  text.replace(/(name|reportName): '[^']*'/g, (_, key) => `${key}: '${title}'`),
);
edit('.github/workflows/nightly.yml', (text) =>
  text.replace(/report_name: .*/, `report_name: ${JSON.stringify(title)}`),
);

edit('README.md', (text) => text.replace(/^# .*/m, `# ${title}`));
if (repo) {
  const [owner, repoName] = repo.split('/');
  for (const doc of ['README.md', 'CONTRIBUTING.md']) {
    edit(doc, (text) =>
      text
        .replaceAll('aroygas.github.io/PlaywrightAIpowered', `${owner}.github.io/${repoName}`)
        .replaceAll('aroygas/PlaywrightAIpowered', repo),
    );
  }
}
if (values.author) {
  edit('LICENSE', (text) => text.replace(/^(Copyright \(c\) \d{4}) .*/m, `$1 ${values.author}`));
}

for (const env of ['local', 'dev', 'staging', 'prod']) {
  edit(`config/env/${env}.env`, (text) => {
    let out = text.replace(/^BASE_URL=.*/m, `BASE_URL=${values['base-url']}`);
    if (values['api-url']) out = out.replace(/^API_URL=.*/m, `API_URL=${values['api-url']}`);
    if (values['keep-credentials']) return out;
    return out
      .replace(
        /^# Public demo-SUT credentials.*/m,
        '# PLACEHOLDERS: real values come from process env / CI secrets, never from this file.',
      )
      .replace(/^((?:ADMIN|USER)_(?:UI|API)_(?:USERNAME|PASSWORD))=.*/gm, '$1=change-me')
      .replace(/^WORKER_ACCOUNTS=.*/m, 'WORKER_ACCOUNTS=');
  });
}

const verb = values['dry-run'] ? 'would update' : 'updated';
for (const [relative, content] of changes) {
  if (!values['dry-run']) writeFileSync(file(relative), content);
  process.stdout.write(`${verb} ${relative}\n`);
}
if (changes.size === 0) process.stdout.write('nothing to change (already initialised?)\n');

process.stdout.write(`
Next steps:
  1. Replace the demo SUT code: src/ui/pages, src/ui/components, src/api/services|schemas,
     tests/e2e, tests/api, specs/. Keep the architecture, swap the content.
  2. Roles live in src/auth/roles.ts (+ the *_UI_*/*_API_* variables in config/environments.ts).
  3. Real credentials: CI secrets or a gitignored .env, never config/env/*.env.
  4. GitHub: tick "Template repository" only on the template; enable Pages (source: gh-pages) for Allure.
  5. Run: npm run ai:check
`);
