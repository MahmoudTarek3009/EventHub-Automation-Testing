---
name: test-linter
description: "Use when linting or checking Playwright test scripts, page objects and utils against the suite rules: raw locators in tests, hard-coded waits or sleeps, hard-coded credentials, naming conventions. Keywords: lint, check scripts, quality gate, eslint, raw locator, waitForTimeout, hard-coded password, naming convention, fix lint errors."
---

# Test Linter

Runs the suite quality gates and fixes the findings. The rules live in `eslint.config.mjs`. Change rules there, never in this file.

## Rules enforced

| Rule | Applies to | Fix |
|---|---|---|
| No raw locators (`locator`, `getBy*`, `frameLocator`) | `tests/` | Move the locator into a page object in `pages/` and call the action or property |
| No hard-coded waits (`waitForTimeout`, `sleep`, `delay`, `setTimeout`) | `tests/`, `pages/`, `utils/` | Use auto-waiting or a web-first assertion such as `expect(locator).toBeVisible()` |
| No hard-coded credentials (names like `password`, `username`, `token`, `secret`, `apiKey` assigned a string literal, or literals passed to `signIn` / `login`) | all linted files | Read from `process.env` and add the key to `.env.example` |
| Naming | all linted files | File names in `tests/`, `pages/` and `utils/` use PascalCase (`LoginPage.js`, `SearchFlow.spec.js`), identifiers use camelCase, classes use PascalCase |
| Playwright best practice (`no-element-handle`, `no-force-option`, `no-conditional-in-test`, `prefer-web-first-assertions`, `missing-playwright-await`) | `tests/`, `pages/`, `utils/` | Follow the rule message |

## Procedure

1. Run `npm run lint`. Use `npm run lint:fix` first for auto-fixable findings.
2. Group the remaining findings by rule and explain each one in plain language.
3. Fix them:
   - For a raw locator, use the `locator-finder` skill to verify the locator, add it to the page object, then replace the call in the test.
   - For a hard-coded credential, move the value to `.env` (local only) and `.env.example` (key name only, empty value), and read it with `process.env`.
   - For a file naming error, rename the file and update its imports.
4. Re-run `npm run lint` until it exits 0.

## Rules for fixing

- Do not disable a rule with `eslint-disable` to make an error go away. If a rule is wrong for a real case, tell the user and propose a change to `eslint.config.mjs`.
- Do not put real credentials in `.env.example`.
- Lint is also enforced by the pre-push hook, so a failing lint blocks the push.
