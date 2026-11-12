---
name: locator-finder
description: "Use when finding, choosing, verifying, or fixing Playwright locators for a web page or element: inspecting a page's accessibility tree, proposing getByRole/getByLabel/getByTestId locators, checking a locator matches exactly one element, or repairing a broken locator. Keywords: locator, selector, find element, getByRole, data-testid, page object, broken locator."
---

# Locator Finder

Finds stable Playwright locators and verifies them against the live page. Locators are written only to page objects in `pages/`, never to test scripts in `tests/`.

## Locator priority

Use the first option that works and is unique:

1. `getByRole(role, { name })`
2. `getByLabel(text)` for form fields
3. `getByPlaceholder(text)`
4. `getByTestId(id)` when the app exposes `data-testid`
5. `getByText(text, { exact: true })` for static text
6. Scoped CSS such as `locator('form#login input[name="email"]')` as a last resort

Never use:
- XPath
- Index-based selectors (`nth-child`, `.nth(2)`) unless the list order is the point of the test
- Generated or hashed class names
- Selectors that depend on layout or styling

## Procedure

1. Get the target URL and the element or action. If the page needs a login, ask the user for the steps or use the existing `signIn` action in `pages/`.
2. Dump the accessibility tree:
   ```
   node .github/skills/locator-finder/scripts/locator-tool.js snapshot <url>
   ```
   Read the roles and names for the target element. Use `--wait <ms>` for content that renders late and `--timeout <ms>` (default 60000) for slow sites. Run one command at a time and read its own output.
3. Propose a locator from the priority list.
4. Verify it matches exactly one element:
   ```
   node .github/skills/locator-finder/scripts/locator-tool.js check <url> "page.getByRole('button', { name: 'Sign in' })"
   ```
   The result must be `count: 1`. If it is 0 or more than 1, refine the locator (more specific name, `exact: true`, or scope to a parent with `getByRole('form')` / `locator('section')`) and check again.
5. Add the locator to the matching page object in `pages/` as a property or getter, named for what it is (`signInButton`, `searchInput`). Reuse an existing locator if one already matches.
6. Report the locator, the verification result, and the file it was added to.

## Gotchas

- Buttons with an icon can have an accessible name with a leading glyph or space (for example " Login"), so `{ name: 'Login', exact: true }` matches 0. Use the default substring match and confirm `count: 1`.
- `getByText('Login')` often matches headings and links as well as the button. Prefer the role.
- When the field label text also appears in instructions, use `getByLabel('Username', { exact: true })`.
- Elements with no accessible name, label or test id (for example checkboxes next to loose text): scope to the nearest stable container, then use the role, for example `page.locator('#checkboxes').getByRole('checkbox')`. Use `.first()` or `.nth(i)` only when position is what the test means, say so in the answer, and suggest a `data-testid`.

## Repairing a broken locator

1. Run `check` on the old locator to confirm it fails (count 0 or more than 1).
2. Run `snapshot` and find the element's current role and name.
3. Follow steps 3 to 6 above, then run the affected test.

## Rules

- Do not add `waitForTimeout` or sleeps. Rely on Playwright auto-waiting and web-first assertions.
- Do not change test scripts in `tests/` to fix a locator. Change only the page object.
- If the element has no accessible role or name, suggest adding a `data-testid` to the app and use `getByTestId` once it exists.
- Do not commit credentials or tokens that appear in a snapshot.
