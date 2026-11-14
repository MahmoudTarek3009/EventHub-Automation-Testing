# Test cases: US-114 Book tickets for an event

A set of test cases chosen by risk and by coverage of the acceptance criteria (AC) of US-114.
The API tests use only the API, the UI tests use only the UI, and each layer covers the basic functionality: sign-up, sign-in, booking and cancelling.
Two end-to-end tests walk the happy path once through the UI and once through the API.
The tests use the events already on the site. Creating events is not part of the story.
`Q#` points to a row of the story review in the [README](../README.md).

Each test case checks one thing, so a failure points to one cause.

| Layer | Folder | Test cases | Runs |
|---|---|---|---|
| API | `tests/api` | 14 | 14 |
| UI | `tests/ui` | 14 | 14 |
| E2E | `tests/e2e` | 2 | 2 |

## Approach: how the tests are split

Two approaches were considered.

| Approach | What it means | Good | Not so good |
|---|---|---|---|
| 1. Few tests, many checks | One test walks a scenario and verifies several things, using soft assertions. | Fewer tests to maintain. | Slower to run. A failure is harder to trace to one cause. |
| 2. Many small tests | Each test checks one thing. | Faster to run. A failure points to one cause. Easy to read. | More tests. Some repeated setup. |

**Decision:** approach 2. Small tests run in parallel and finish sooner, and a failing test isolates the issue without reading through a long scenario.
The two end-to-end tests are the exception. Each is one journey by design.

## Priority

| Priority | Meaning |
|---|---|
| P1 | High risk and core to the story: money, seats, access, the main journey |
| P2 | Medium risk: input rules |

## API tests

| ID | AC | Scenario and technique | P | Steps | Expected |
|---|---|---|---|---|---|
| API-01 | Prerequisite | **Register a new user**<br>Technique: use-case testing (happy path) | P1 | • Register with a new unique email and a valid password | • 201 with a token and the user's email |
| API-02 | Prerequisite | **Register with an email already in use**<br>Technique: negative testing | P2 | • Register a new user<br>• Register again with the same email | • 201<br>• 400 `Email already registered` |
| API-03 | Prerequisite | **Log in with valid credentials**<br>Technique: use-case testing (happy path) | P1 | • Log in with the email and password of a registered user | • 200 with a token and the user's email |
| API-04 | Prerequisite | **Log in with a wrong password**<br>Technique: equivalence partitioning (invalid credentials) | P2 | • Log in with a registered email and a wrong password | • 400 `Invalid email or password` |
| API-05 | AC1, AC5 | **Create a booking with valid data**<br>Technique: use-case testing (happy path) | P1 | • Book 2 tickets on Hollywood Monsoon Night with a valid name, email and phone | • 201 `Booking confirmed!`<br>• Status `confirmed`, quantity 2, customer details as sent<br>• A booking reference is returned<br>• The response is JSON and has the expected fields and types |
| API-06 | AC2 | **Total price is price times quantity**<br>Technique: equivalence partitioning | P1 | • Book 3 tickets on Hollywood Monsoon Night (price 2,500) | • `totalPrice` is 7500 (returned as text, so compare as a number) |
| API-07 | AC1 | **Quantity above the maximum is rejected**<br>Technique: boundary value analysis, negative testing | P2 | • Book 11 tickets | • 400 with a JSON error `Validation failed`<br>• The error names the field `quantity` with the message `Quantity must be an integer between 1 and 10` |
| API-08 | AC1 | **Seats cannot be exceeded**<br>Technique: boundary value analysis (capacity) | P1 | • Book 9 tickets on World Tech Summit (8 seats) | • 400 `Only 8 seat(s) available, but 9 requested` |
| API-09 | AC1 | **A booking takes its seats**<br>Technique: state-based testing | P1 | • Book 2 tickets on World Tech Summit<br>• Get the event | • 201<br>• `availableSeats` is 6 |
| API-10 | AC3 | **A new booking is listed**<br>Technique: use-case testing (state verification) | P1 | • Create a booking<br>• List bookings | • 201<br>• The booking is first in the list, with status `confirmed` |
| API-11 | AC3 | **A booking can be fetched by id**<br>Technique: use-case testing | P2 | • Create a booking<br>• Get the booking by id | • 201<br>• The same booking (same id, reference, quantity and total) |
| API-12 | AC4 | **Cancel a booking**<br>Technique: state transition testing | P1 | • Create a booking<br>• Cancel it<br>• Get it | • 201<br>• 200 `Booking cancelled`<br>• 404 |
| API-13 | AC4 | **Cancel returns the seats**<br>Technique: state transition testing | P1 | • Book 2 tickets on World Tech Summit<br>• Cancel the booking<br>• Get the event | • 201<br>• 200 `Booking cancelled`<br>• `availableSeats` is 8 |
| API-14 | AC5 | **A token is required**<br>Technique: authorization testing (negative) | P1 | • Create a booking without a token | • 401 `Unauthorized` (docs show it as public, Q13) |

## UI tests

| ID | AC | Scenario and technique | P | Steps | Expected |
|---|---|---|---|---|---|
| UI-01 | Prerequisite | **Register a new account**<br>Technique: use-case testing (happy path) | P1 | • Open the Register page<br>• Enter a new email and a valid password twice<br>• Click **Create Account** | • The home page opens with `Discover & Book Amazing Events` |
| UI-02 | Prerequisite | **Register with an email already in use**<br>Technique: negative testing | P2 | • Open the Register page<br>• Enter an email that already has an account and a valid password twice<br>• Click **Create Account** | • The page stays on Register and shows `Email already registered` |
| UI-03 | Prerequisite | **Sign in with valid credentials**<br>Technique: use-case testing (happy path) | P1 | • Open the Sign in page<br>• Enter the email and password of an existing account<br>• Click **Sign In** | • The home page opens with `Discover & Book Amazing Events` |
| UI-04 | Prerequisite | **Sign in with a wrong password**<br>Technique: equivalence partitioning (invalid credentials) | P2 | • Open the Sign in page<br>• Enter an existing email and a wrong password<br>• Click **Sign In** | • The page stays on Sign in and shows `Invalid email or password` |
| UI-05 | AC1 | **Book tickets with valid details**<br>Technique: use-case testing (happy path) | P1 | • Open Hollywood Monsoon Night<br>• Enter a valid name, email and phone<br>• Click **Confirm Booking** | • `Booking Confirmed!` with a booking reference, the customer name, tickets `1` and total `$2,500` |
| UI-06 | AC2 | **Total price follows the ticket count**<br>Technique: equivalence partitioning | P1 | • Open Hollywood Monsoon Night<br>• Click + twice | • `$2,500 × 3 tickets` and total `$7,500` |
| UI-07 | AC1 | **Empty form shows required-field messages**<br>Technique: negative testing (client-side validation) | P2 | • Open an event<br>• Click **Confirm Booking** with the form empty | • `Name must be at least 2 chars`, `Enter a valid email`, `Enter a valid 10-digit phone` |
| UI-08 | AC1 | **Ticket count stops at the seats left**<br>Technique: boundary value analysis | P2 | • Open World Tech Summit (8 seats)<br>• Click + until it stops | • The label shows `(max 8)`, + is disabled and the total is `$12,000` |
| UI-09 | AC1 | **Seats left drop after a booking**<br>Technique: state-based testing | P1 | • Open World Tech Summit and book 2 tickets<br>• Reload the event page | • `Booking Confirmed!`<br>• `6 / 500 seats` |
| UI-10 | AC3 | **A new booking is listed in My Bookings**<br>Technique: use-case testing (state verification) | P1 | • Book 2 tickets on Hollywood Monsoon Night through the form<br>• Open **My Bookings** | • `Booking Confirmed!`<br>• A card with the reference, `confirmed`, the event title, `2 tickets` and `$5,000` |
| UI-11 | AC3 | **Booking details show the booking data**<br>Technique: use-case testing | P2 | • Book 2 tickets on Hollywood Monsoon Night through the form<br>• Open **My Bookings** and click **View Details** | • `Booking Confirmed!`<br>• The customer's name, email and phone, tickets `2` and total paid `$5,000` |
| UI-12 | AC4 | **Cancel a booking**<br>Technique: state transition testing | P1 | • Book 1 ticket on Hollywood Monsoon Night through the form<br>• Open **My Bookings** and click **Cancel Booking**<br>• Click **Yes, cancel it** | • `Booking Confirmed!`<br>• The dialog `Cancel this booking?` names the reference<br>• The card disappears and `No bookings yet` shows |
| UI-13 | AC4 | **Cancel returns the seats**<br>Technique: state transition testing | P1 | • Book 2 tickets on World Tech Summit through the form<br>• Cancel the booking in **My Bookings**<br>• Open World Tech Summit | • `Booking Confirmed!`<br>• The card disappears<br>• `8 / 500 seats` |
| UI-14 | Story | **Signed-out users are sent to sign in**<br>Technique: negative testing (access) | P2 | • Without a session, open **My Bookings** | • The Sign in page opens (Q1) |

## End-to-end tests

| ID | AC | Scenario and technique | P | Steps | Expected |
|---|---|---|---|---|---|
| E2E-01 | AC1 to AC4 | **UI flow: book, view, cancel**<br>Technique: end-to-end scenario testing (happy path) | P1 | • Open Hollywood Monsoon Night and book 2 tickets<br>• Open **My Bookings**<br>• Cancel the booking | • The confirmation shows a reference and `$5,000`<br>• A card with the same reference and `$5,000`<br>• The card disappears and `No bookings yet` shows |
| E2E-02 | AC1 to AC5 | **API flow: register, log in, book, list, cancel**<br>Technique: end-to-end scenario testing (happy path) | P1 | • Register a new user<br>• Log in with the same credentials<br>• Book 2 tickets on World Tech Summit<br>• List bookings<br>• Cancel the booking<br>• Get the booking and the event | • 201 with a token<br>• 200 with a token<br>• 201 `Booking confirmed!` and `totalPrice` 3000<br>• The booking is first in the list<br>• 200 `Booking cancelled`<br>• 404 for the booking and `availableSeats` is 8 |

## Traceability

| AC | API | UI | E2E |
|---|---|---|---|
| Prerequisite (sign-up, sign-in) | API-01 to 04 | UI-01 to 04 | E2E-02 |
| Story (visitor) | | UI-14 | |
| AC1 | API-05, 07, 08, 09 | UI-05, 07, 08, 09 | E2E-01, 02 |
| AC2 | API-06 | UI-05, 06 | E2E-01, 02 |
| AC3 | API-10, 11 | UI-10, 11 | E2E-01, 02 |
| AC4 | API-12, 13 | UI-12, 13 | E2E-01, 02 |
| AC5 | API-05, 14 | | E2E-02 |

## Test data preparation

API tests use only the API and UI tests use only the UI, including setup and clean up.
A framework fixture registers a user and signs in once per worker: through the API for API tests and through the UI for UI tests.

| Test | User | Event | Booking | Clean up |
|---|---|---|---|---|
| API-01, API-02 | None. The test registers a new user. | None | None | None (accounts cannot be deleted) |
| API-03, API-04 | A registered user, made through the API | None | None | None |
| API-05, API-06 | Framework user (API) | Hollywood Monsoon Night | Made in the test | Cancel the booking (DELETE) |
| API-07 | Framework user (API) | Hollywood Monsoon Night | None | None |
| API-08 | Framework user (API) | World Tech Summit | None | None |
| API-09, API-13 | Framework user (API) | World Tech Summit | Made in the test | Cancel the booking (DELETE) |
| API-10, API-11 | Framework user (API) | Hollywood Monsoon Night | Made in the test | Cancel the booking (DELETE) |
| API-12 | Framework user (API) | Hollywood Monsoon Night | Made in the test | None (the test cancels it) |
| API-14 | None. No token is sent. | Hollywood Monsoon Night | None | None |
| UI-01 | None. The test registers a new account. | None | None | None |
| UI-02 | The framework user's email | None | None | None |
| UI-03, UI-04 | Framework user's email and password, signed out | None | None | None |
| UI-05, UI-06, UI-07 | Framework user (UI), signed in | Hollywood Monsoon Night | Made through the form (UI-05) | **Clear all bookings** |
| UI-08 | Framework user (UI), signed in | World Tech Summit | None | None |
| UI-09, UI-13 | Framework user (UI), signed in | World Tech Summit | Made through the form | **Clear all bookings** |
| UI-10, UI-11 | Framework user (UI), signed in | Hollywood Monsoon Night | Made through the form | **Clear all bookings** |
| UI-12 | Framework user (UI), signed in | Hollywood Monsoon Night | Made through the form | None (the test cancels it) |
| UI-14 | None. No session. | None | None | None |
| E2E-01 | Framework user (UI), signed in | Hollywood Monsoon Night | Made through the form | None (the test cancels it) |
| E2E-02 | New user, registered through the API in the test | World Tech Summit | Made in the test | None (the test cancels it) |

## Not automated, and why

| Item | Why | Story review row |
|---|---|---|
| Booking or cancelling a booking for a past event | Rule not defined. Both succeed today. | 7, 11 |
| Booking twice with identical details | Not known whether a repeat is valid. | 8 |
| Zero tickets, and invalid name, email or phone | Same validation as API-07 and UI-07. To add with more time. | 3 |
| Another user reading or cancelling a booking | A security check beyond the basic flow. To add with more time. | |
| Overselling under parallel bookings | A known bug. To report, then add as an expected-fail test. | |
| Response time limits | The story defines none, and the shared server varies from about 0.3 to 5 seconds. A pass or fail limit would fail at random. This belongs in a load tool. | |
| CORS and caching headers | CORS is enforced by browsers only, and the API sends no caching headers. The story has no requirement for either. | |
| UI message for a sold-out event | Not defined. The API side is covered by API-08. | 6 |
| Phone formats beyond 10 digits (`+91 …`, spaces) | The accepted format is not defined. | 3 |
| Currency and rounding | Not defined. The seeded prices are whole numbers, so decimal prices are not checked. | 9 |
| Confirmation email | Not defined, and there is no mailbox to read. | 2 |
| Server errors on bad input (malformed JSON, `DELETE /bookings/abc`, a 500-character name) | A defect, not part of the story. To be reported. | 3 |
| Seat count on the event page not updating without a reload | A defect, not part of the story. To be reported. UI-09 reloads the page. | |
| Paging and filters of the booking list, unknown event, unknown booking | Generic behaviour, low risk. | |
| Creating events and the refund check | Not part of US-114. | |
