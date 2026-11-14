# EventHub-Automation-Testing

Playwright (JavaScript) UI, API and end-to-end tests for the EventHub ticket-booking flow (user story US-114). There are 30 test cases and no credentials to share, because every run registers its own accounts.

## Tech used

| Area | What |
|---|---|
| Test framework | Playwright Test 1.65 in JavaScript (ES modules), Node.js 20.12 or newer |
| UI tests | Page Object Model with a `PoManager`, and fixtures that give a signed-in page |
| API tests | Playwright `request` with one API object per resource and an `ApiManager` |
| Test data | JSON files for inputs, data builders for unique accounts |
| Typing | JSDoc types and `// @ts-check` in the page and API objects |
| Code quality | ESLint 10 with the Playwright and Unicorn plugins |
| Git checks | Husky 9 hooks and commitlint (Conventional Commits) |
| CI | GitHub Actions, with the HTML report uploaded as an artifact |

## How to run

Needs Node.js 20.12 or newer and Git.

```
git clone https://github.com/MahmoudTarek3009/EventHub-Automation-Testing.git
cd EventHub-Automation-Testing
npm install
npx playwright install chromium
npm test
```

- `npm install` also installs the git hooks.
- **No credentials are needed.** Every run registers its own accounts on the shared site. Accounts cannot be deleted there, so each worker leaves one behind.
- Optional: copy `.env.example` to `.env` to point the tests at another `BASE_URL` or `API_URL`. Both have defaults. Never commit `.env`.

| Command | What it does |
|---|---|
| `npm test` | Run all tests (UI, API and end-to-end) |
| `npm run test:ui` | Run the UI tests |
| `npm run test:api` | Run the API tests |
| `npm run test:e2e` | Run the two end-to-end journeys |
| `npx playwright test -g "UI-05"` | Run one test by its ID |
| `npm run test:ui -- --headed` | Watch the browser |
| `npm run report` | Open the HTML report of the last run |
| `npm run lint` | Check the scripts against the rules (`npm run lint:fix` repairs what it can) |
| `npm run check:artifacts` | Fail if a generated report, test output file or `.env` file is committed |

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
| 10 | AC4 | No cancellation rules. A booking for a past event can be cancelled. | Until when can a booking be cancelled (for example, up to a set time before the event)? Should cancelling a booking for a past event be blocked? |
| 11 | AC4 | Cancel permanently deletes the booking. The docs list a `cancelled` status that never appears. | Should a cancelled booking be kept and shown with the status "cancelled", or is deleting it intended? |

## Test cases

The test cases are in [docs/TestCases.md](docs/TestCases.md): 14 API, 14 UI and 2 end-to-end. The document has the steps, expected results, priority, technique and test data of each case, and what is not automated.

## Assumptions

- Unclear rules follow the app's current behaviour.
- Each user's seats and bookings are isolated.
- World Tech Summit event keeps its 8 seats.
- Past-dated seeded events remain bookable during testing.

## App versus docs

| # | The API docs say | The app does |
|---|---|---|
| 1 | Events and bookings need no authentication | They return 401 without a token |
| 2 | A booking reference looks like `EVT-A1B2C3` | It is the first letter of the event name and 6 characters, for example `H-YJ2CXY` |
| 3 | `price` and `totalPrice` are numbers | They are returned as text, for example `"7500"` |
| 4 | A password needs at least 6 characters | The API accepts `abcdef`, but the Register page blocks it and asks for 8 with an uppercase letter, a number and a symbol |

## Defects found

| # | Severity | Where | What happens |
|---|---|---|---|
| D1 | High | API | Bookings can exceed the seats. 10 parallel requests for 1 ticket on an 8-seat event all succeeded in 2 of 3 rounds, although the docs say booking is atomic |
| D2 | Medium | UI and API | Past events can be booked and cancelled. The seeded events are dated April, July and October 2026, the site date is November 2026, and they are listed as "Upcoming". Creating an event in the past is rejected, so the rule exists but is not applied to booking |
| D3 | Low | UI | After a booking, the seats shown on the event page do not change until the page is reloaded |
| D4 | Low | UI and API | The phone check is loose: the API accepts `++++++++++`, and the form says "10-digit" but accepts `+91 98765 43210` |

None of these is automated yet. See "Not automated, and why" in the test-case document.

## Key decisions

| Decision | Why |
|---|---|
| Many small single-purpose tests, not long scenarios with soft assertions | They run in parallel and a failure points to one cause. Both options are compared in the test-case document |
| Page objects with a `PoManager`, and API objects with an `ApiManager` (one class per resource, no assertions inside) | One place to change, tests read like manual cases, and negative tests can check any status |
| Authorization is handled by fixtures: `authenticatedPage` for the UI and `api` for the API. Only the register and sign-in tests start signed out | The brief asks for authorization in the framework and not in each test |
| No shared credentials: each worker registers its own account, through the UI for UI tests and through the API for API tests | Nothing to hand over, and seats and bookings are per user, so parallel tests do not disturb each other |
| Use the seeded events: Hollywood Monsoon Night for prices and World Tech Summit (8 seats) for seat checks. Fixtures cancel the bookings after each test, and a test fails with a clear message if the seed data changes | Creating events is outside the story, and the data stays predictable |
| One Playwright project per layer (`ui`, `api`, `e2e-ui`, `e2e-api`), each with its own base URL. `.env` only overrides the defaults | The UI and the API are on different hosts |

## Project Structure

```
EventHub-Automation-Testing/
├── .github/
│   ├── workflows/            CI pipeline (Playwright)
│   ├── skills/               Copilot skills (locator-finder, test-linter)
│   ├── agents/               Copilot agents (push-agent)
│   └── copilot-instructions.md  Rules Copilot follows
├── docs/                    Assessment documents
├── quality-gate/
│   ├── eslint.config.mjs    Lint rules
│   ├── husky/               Git hooks (commit and push checks)
│   └── scripts/             Repo tooling (artifact check)
├── src/
│   ├── pages/               Page Object classes
│   ├── fixtures/            Playwright fixtures (page objects, API clients)
│   └── utils/               Data builders; api/ holds the API objects
├── tests/
│   ├── ui/                  UI tests
│   ├── api/                 API tests
│   ├── e2e/                 End-to-end journeys (ui/ and api/)
│   └── test-data/           Static test inputs
├── reports/                 Generated test results and HTML report (not tracked)
├── .env.example             Template for environment variables
└── playwright.config.js     Playwright configuration
```

## Quality gates and AI assistance

Rules are enforced by tools, so they do not depend on memory.

| Gate | When it runs | What it blocks |
|---|---|---|
| ESLint (`npm run lint`) | Pre-push hook | Raw locators in tests, fixed waits, hard-coded credentials, wrong naming, Playwright anti-patterns |
| commitlint | Commit-message hook | Messages that are not Conventional Commits |
| Artifact check (`npm run check:artifacts`) | Pre-commit and pre-push hooks | Committing generated files or secrets: anything in `reports/` (HTML report, results), any `tests/**/output/` folder, or a `.env` file. Only `.gitkeep` and `.env.example` are allowed |
| GitHub Actions | Push to `main` and pull requests | Runs the Playwright tests and uploads the HTML report |

Git flow: work on a `<type>/<topic>` branch, never push to `main`, never skip the hooks, and open a pull request.

GitHub Copilot was used to build and review this repository. It is set up to follow the same rules as a person:

| Part | Where | What it does |
|---|---|---|
| Instructions | `.github/copilot-instructions.md` | The project layout and the rules Copilot follows when it writes code |
| Skill `locator-finder` | `.github/skills/` | Finds a locator on the live page and checks that it matches one element |
| Skill `test-linter` | `.github/skills/` | Runs the lint gate and fixes the findings |
| Agent `push-agent` | `.github/agents/` | Commits and pushes safely: feature branch, Conventional Commit, artifact check, no push to `main`, no force-push |


## What I would do with more time

| Area | Next step |
|---|---|
| API tests | Data-driven negative cases (missing fields, wrong types, bad phone and email), another user's booking, paging and filters |
| Defects | Report D1 to D4 and add them as expected-fail tests. Settle the open story questions and adapt the tests |
| Contracts | Validate responses against a JSON Schema once the docs match the API |
| Coverage | Accessibility checks, mobile layout, Firefox and WebKit (already in the config, switched off) |
| CI |  publish the report to GitHub Pages |