# EventHub-Automation-Testing

Playwright (JavaScript) UI and API tests.

## Story review (US-114)

| # | AC | What is missing, unclear or wrong | Question for the Product Owner |
|---|---|---|---|
| 1 | Story | Says "visitor", but the app has no guest access. Every page redirects to sign-in. | Is booking only for registered users? If guests should be able to book, how are they identified? |
| 2 | AC1 | User is logged in, yet the form asks for name, email and phone again. Not stated whose details they are or whether an email is sent. | Are these the attendee's details or the booker's, and why enter them again when logged in? Is a confirmation email sent, and to which address: the account email or the one typed in the form? |
| 3 | AC1 | No validation rules given. A 500-character name causes a server error. | What are the rules and limits for each field? |
| 4 | AC1 | No minimum or maximum ticket count. The app allows 1 to 10, capped by seats left. | What is the maximum per booking? Does the limit apply per booking or per user per event? |
| 5 | AC1 | Reference format not defined. Docs say `EVT-XXXXXX`, the app creates `D-XXXXXX`. | What format must the reference have, and must it be unique? Which is correct, the docs or the app? |
| 6 | AC1 | Sold-out and not-enough-seats behaviour is not described. | What should the user see? Should a sold-out event stay listed and bookable? |
| 7 | AC1 | Past events can be booked. The app lists them as "Upcoming". | Should booking close when the event starts or when it ends? Should past events be hidden? |
| 8 | AC1 | Repeat submission is not covered. Submitting twice creates two bookings and uses the seats twice. | Is a repeat booking with identical details a valid second purchase, or should it be blocked, warned about or treated as the same booking? |
| 9 | AC2 | Currency, rounding and extra charges not defined. The UI shows `$`. | Which currency applies? How should totals be rounded? Are there fees, taxes or discounts? |
| 10 | AC3 | Does not say what is shown, in what order, or how many per page. | Which fields must be shown? What is the sort order? Is there paging? |
| 11 | AC4 | No cancellation rules. A booking for a past event can be cancelled. | Until when can a booking be cancelled (for example, up to a set time before the event)? Should cancelling a booking for a past event be blocked? |
| 12 | AC4 | Cancel permanently deletes the booking. The docs list a `cancelled` status that never appears. | Should a cancelled booking be kept and shown with the status "cancelled", or is deleting it intended? |
| 13 | AC5 | Authentication, request fields and error codes not stated. The docs show the endpoints as public, but they return 401 without a token. | Is a token required? Should the API apply the same rules as the UI (limits, validation, price)? Which error codes and messages are expected? |

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