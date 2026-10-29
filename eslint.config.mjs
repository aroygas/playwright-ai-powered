import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import prettier from 'eslint-config-prettier';

const LOCATOR_POLICY =
  'Use getByRole > getByLabel > getByTestId. If no accessible handle exists, add a data-testid to the SUT.';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'blob-report/**',
      'allure-results/**',
      'allure-report/**',
      'allure-history/**',
      'merged-report/**',
      'playwright/.cache/**',
      'playground/dist/**',
      '.auth/**',
      'src/auth/storage/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintComments.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Every eslint-disable must carry a justification: `// eslint-disable-next-line rule -- reason`.
      '@eslint-community/eslint-comments/require-description': ['error', { ignore: [] }],
      '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='locator'][callee.object.name='page']",
          message: `page.locator() is banned. ${LOCATOR_POLICY}`,
        },
        {
          selector:
            "CallExpression[callee.property.name='locator'][callee.object.property.name='page']",
          message: `this.page.locator() is banned. ${LOCATOR_POLICY}`,
        },
        {
          selector:
            "CallExpression[callee.property.name='locator'][arguments.0.type=/^(Literal|TemplateLiteral)$/]",
          message: `.locator('<css|xpath string>') is banned. ${LOCATOR_POLICY}`,
        },
        {
          selector:
            "CallExpression:matches([callee.property.name='$'], [callee.property.name='$$'])",
          message: `page.$ / page.$$ are banned. ${LOCATOR_POLICY}`,
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      // Component/page helpers named expectX() wrap web-first assertions.
      'playwright/expect-expect': ['warn', { assertFunctionPatterns: ['^expect', '\\.expect'] }],
    },
  },
  prettier,
);
