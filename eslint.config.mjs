import js from '@eslint/js';
import globals from 'globals';
import playwright from 'eslint-plugin-playwright';
import unicorn from 'eslint-plugin-unicorn';

const CREDENTIAL_NAME = '/(password|passwd|pwd|secret|token|api_?key|user_?name)/i';

const noHardCodedCredentials = [
  `VariableDeclarator[id.name=${CREDENTIAL_NAME}][init.type='Literal'][init.value=/\\S/]`,
  `PropertyDefinition[key.name=${CREDENTIAL_NAME}][value.type='Literal'][value.value=/\\S/]`,
  `AssignmentExpression[left.name=${CREDENTIAL_NAME}][right.type='Literal'][right.value=/\\S/]`,
  `AssignmentExpression[left.property.name=${CREDENTIAL_NAME}][right.type='Literal'][right.value=/\\S/]`,
  `Property[key.name=${CREDENTIAL_NAME}][value.type='Literal'][value.value=/\\S/]`,
  `Property[key.value=${CREDENTIAL_NAME}][value.type='Literal'][value.value=/\\S/]`,
].map((selector) => ({
  selector,
  message: 'Hard-coded credential. Read it from process.env (.env) instead.',
}));

const credentialsPassedAsLiterals = [
  "CallExpression[callee.name=/^(signIn|logIn|login)$/] > Literal",
  "CallExpression[callee.property.name=/^(signIn|logIn|login)$/] > Literal",
].map((selector) => ({
  selector,
  message: 'Hard-coded credential passed to a login action. Use process.env values.',
}));

const noHardCodedWaits = [
  "CallExpression[callee.name=/^(sleep|delay|setTimeout)$/]",
  "CallExpression[callee.property.name=/^(sleep|delay|setTimeout)$/]",
].map((selector) => ({
  selector,
  message: 'Hard-coded wait. Rely on auto-waiting or web-first assertions (expect(...).toBeVisible()).',
}));

const namingConventions = [
  {
    selector: 'ClassDeclaration[id.name=/^[a-z]/]',
    message: 'Class names use PascalCase (for example LoginPage).',
  },
];

const noRawLocatorsInTests = [
  {
    selector:
      "CallExpression[callee.type='MemberExpression'][callee.property.name=/^(locator|frameLocator|getBy[A-Za-z]+)$/]",
    message:
      'Raw locator in a test script. Add it to a page object in pages/ and call that action or property.',
  },
];

const sharedRestrictions = [
  ...noHardCodedWaits,
  ...noHardCodedCredentials,
  ...credentialsPassedAsLiterals,
  ...namingConventions,
];

const filenameCase = (files, kind) => ({
  files,
  plugins: { unicorn },
  rules: { 'unicorn/filename-case': ['error', { case: kind, checkDirectories: false }] },
});

export default [
  {
    ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**', 'blob-report/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      camelcase: ['error', { properties: 'never' }],
      'no-restricted-syntax': ['error', ...sharedRestrictions],
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.js', 'pages/**/*.js', 'utils/**/*.js'],
  },
  {
    files: ['tests/**/*.js', 'pages/**/*.js', 'utils/**/*.js'],
    rules: {
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-element-handle': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-conditional-in-test': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/missing-playwright-await': 'error',
    },
  },
  {
    files: ['tests/**/*.js'],
    rules: {
      'no-restricted-syntax': ['error', ...sharedRestrictions, ...noRawLocatorsInTests],
    },
  },
  filenameCase(['tests/**/*.js', 'pages/**/*.js', 'utils/**/*.js'], 'pascalCase'),
];
