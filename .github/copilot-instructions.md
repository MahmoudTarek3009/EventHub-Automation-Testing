# Copilot instructions: EventHub Playwright automation

Playwright (JavaScript, `@playwright/test`) UI and API test suite. Follow these rules whenever you write or change code in this repo. They are also enforced by ESLint (`npm run lint`) and git hooks, so code that breaks them will be blocked.

## Project layout

| Folder | Purpose |
|---|---|
| `tests/` | Test scripts only: readable steps, no locators, no Playwright plumbing. Sub-folders `ui/`, `api/`, `e2e/` |
| `pages/` | Page objects: locators and user actions (`signIn`, `search`). Locators live only here |
| `utils/` | Shared helpers (data builders, API clients, env access) |
| `test-data/` | Static test data files |
| `scripts/` | Repo tooling, not tests |

## Test scripts (`tests/`)

- A test reads like a manual test case: call page object actions and assert on page object properties. A non-technical reader should understand it.
- Never use `page.locator`, `page.getBy*` or `frameLocator` in a test. Add the locator to a page object in `pages/` and call that.
- Keep each test small and independent. A test must not depend on another test's state or order.
- One behaviour per test. Name it for the behaviour, for example `shows an error for a wrong password`.
- Group related tests with `test.describe`. Use `test.beforeEach` for shared setup.
- Do not use `test.only`, `test.skip` without a linked reason, or conditional logic (`if`) inside a test.

## Page objects (`pages/`)

- One class per page or component, for example `LoginPage`. The constructor takes `page` and defines locators as properties.
- Expose user-level actions (`signIn(username, password)`), not raw clicks. Actions return nothing or the next page object.
- Do not put assertions about test intent in page objects. Small readiness checks are fine.
- Before adding a locator, check for an existing one in `pages/`.

## Locators

Pick the first option that works and matches exactly one element:
1. `getByRole(role, { name })`
2. `getByLabel`
3. `getByPlaceholder`
4. `getByTestId`
5. `getByText(text, { exact: true })`
6. Scoped CSS as a last resort

Never use XPath, index-based selectors (`nth`, `first`, `last`) unless order is the point of the test, generated class names, or layout-dependent selectors. If an element has no accessible name or test id, scope to a stable container and suggest adding a `data-testid`. Use the `locator-finder` skill to find and verify locators.

## Waiting and assertions

- Never use `waitForTimeout`, `sleep`, `delay` or `setTimeout`. Playwright auto-waits.
- Use web-first assertions that retry: `await expect(locator).toBeVisible()`, `toHaveText`, `toHaveURL`. Do not assert on `await locator.isVisible()` or `textContent()` results.
- Always `await` Playwright calls and assertions.
- Do not use `{ force: true }` or element handles (`page.$`, `$$`).
- Wait for a state (a response, a URL, a visible element), never for a duration.

## Data, credentials and environments

- Never hard-code credentials, tokens, API keys or user names in code. Read them from `process.env`. Add the key name to `.env.example` with an empty value. Never put real values in `.env.example`.
- `.env` is local only and never committed.
- Use `baseURL` from `playwright.config.js` and relative paths (`page.goto('/login')`). Do not hard-code environment URLs in tests.
- Tests create the data they need and clean it up. Do not rely on data left by earlier runs.

## Naming

- File names in `tests/`, `pages/` and `utils/` use PascalCase: `LoginPage.js`, `SearchFlow.spec.js`.
- Variables and functions use camelCase. Classes use PascalCase. Environment variables use UPPER_SNAKE_CASE.
- Test titles are plain sentences that describe the behaviour.

## Quality gates (run before you say a change is done)

1. `npm run lint` must exit 0. Use `npm run lint:fix` for auto-fixes, then fix the rest. Do not silence a rule with `eslint-disable`. If a rule seems wrong, tell the user.
2. `npm run check:artifacts` must exit 0.
3. Run the tests you changed with `npx playwright test <file>`.

## Git

- Use the `push-agent` agent for commit, push and PR work.
- Never push to `main` or `master`. Use a branch named `<type>/<topic>`, for example `feat/login-page-object`.
- Commit messages follow Conventional Commits: `<type>(<scope>): <subject>`. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Lower-case, imperative, no trailing period, header up to 100 characters.
- Never commit anything inside `test-results/`, `playwright-report/` or `tests/**/output/`. Only `.gitkeep` may be tracked there. Never commit `.env` files.
- Never bypass hooks with `--no-verify`, and never force-push.

## Skills to use

- `locator-finder`: find, verify or repair locators.
- `test-linter`: run the lint gates and fix findings.
