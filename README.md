# EventHub-Automation-Testing

Playwright (JavaScript) UI and API tests.

## Project Structure

```
EventHub-Automation-Testing/
├── .github/
│   ├── workflows/            CI pipeline (Playwright)
│   ├── skills/               Copilot skills (locator-finder, test-linter)
│   ├── agents/               Copilot agents (push-agent)
│   └── copilot-instructions.md  Rules Copilot follows
├── .husky/                  Git hooks (commit and push checks)
├── docs/                    Assessment documents
├── scripts/                 Repo tooling (artifact check)
├── tests/
│   ├── ui/                  UI tests
│   ├── api/                 API tests
│   └── e2e/                 End-to-end user journeys
├── pages/                   Page Object classes
├── utils/                   Shared helpers
├── test-data/               Static test inputs
├── playwright-report/       Generated HTML report (not tracked)
├── test-results/            Generated test artifacts (not tracked)
├── .env.example             Template for environment variables
├── eslint.config.mjs        Lint rules
└── playwright.config.js     Playwright configuration
```

## Setup

Needs Node.js and Git.

```
npm install
npx playwright install
cp .env.example .env
```

- `npm install` also installs the git hooks.
- Fill in `.env` with your own values. Never commit it.
- Optional: install the GitHub CLI (`gh`) to open pull requests from the terminal.

## Commands

| Command | What it does |
|---|---|
| `npx playwright test` | Run all tests |
| `npm run lint` | Check the scripts against the rules |
| `npm run lint:fix` | Fix lint problems that can be fixed automatically |
| `npm run check:artifacts` | Check no reports, outputs or `.env` files are tracked |

## Rules

- Tests have no locators. Locators live in `pages/`.
- No fixed waits. No hard-coded credentials.
- File names use PascalCase, for example `LoginPage.js`.
- Secrets come from `.env`.

## Committing and pushing

- Work on a branch like `feat/login-page-object`. Never push to `main`.
- Commit messages use Conventional Commits, for example `feat(login): add sign in action`.
- Hooks check this on commit and on push. Do not skip them.
- Files in `test-results/` and `playwright-report/` are never committed.