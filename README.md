# EventHub-Automation-Testing

## Project Structure

```
EventHub-Automation-Testing/
├── .github/workflows/   CI pipeline (Playwright)
├── docs/                Assessment documents
├── tests/
│   ├── ui/              UI tests
│   ├── api/             API tests
│   └── e2e/             End-to-end user journeys
├── pages/               Page Object classes
├── utils/               Shared helpers
├── test-data/           Static test inputs
├── playwright-report/   Generated HTML report (not tracked)
├── test-results/        Generated test artifacts (not tracked)
├── .env.example         Template for required environment variables
└── playwright.config.js Playwright configuration
```

## Setup

```
npm install
cp .env.example .env
```