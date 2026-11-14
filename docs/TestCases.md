# Test cases: US-114 Book tickets for an event

A set of test cases chosen by risk and by coverage of the acceptance criteria (AC) of US-114.
The API carries most of the rules, the UI covers what only the screen can show, and one end-to-end test joins the layers.
The tests use the events already on the site. Creating events is not part of the story.
`Q#` points to a row of the story review in the [README](../README.md).

Each test case is one run. Where a rule needs several data values, they are steps of the same test, not separate runs.

| Layer | Folder | Test cases | Runs |
|---|---|---|---|
| API | `tests/api` | 7 | 7 |
| UI | `tests/ui` | 2 | 2 |
| E2E | `tests/e2e` | 1 | 1 |

## Priority

| Priority | Meaning | 
|---|---|---|
| P1 | High risk and core to the story: money, seats, access, the main journey | 
| P2 | Medium risk: input rules |


## API tests

| ID | AC | Scenario and technique | P | Steps | Expected |
|---|---|---|---|---|---|
| API-01 | Prerequisite | **Account sign-up and sign-in**<br>Technique: equivalence partitioning (valid and invalid credentials) | P1 | • Register a new user with a unique email<br>• Log in with the same email and password<br>• Call `GET /auth/me` with the token<br>• Log in with a wrong password | • 201 with a token<br>• 200 with a token<br>• 200 with the user's email<br>• 400 `Invalid email or password` |
| API-02 | AC1, AC2, AC3, AC5 | **Book tickets and check the price**<br>Technique: use-case testing, boundary value analysis (maximum quantity) | P1 | • Book 10 tickets (the maximum) on Hollywood Monsoon Night with valid customer details<br>• List bookings. Get the booking by id and by reference. | • 201 `Booking confirmed!`. Status `confirmed`. Quantity 10. Customer details as sent. A reference is returned. `totalPrice` is 25000 (2,500 × 10, returned as text, so compare as a number).<br>• The booking is first in the list. Id and reference return the same booking. |
| API-03 | AC1 | **Invalid booking request is rejected**<br>Technique: boundary value analysis, equivalence partitioning, negative testing | P2 | • Book 11 tickets (above the maximum), all other fields valid<br>• Send one request with four faults: quantity 0, name of 1 character, email `not-an-email`, phone of 9 digits<br>• List bookings | • 400 `Quantity must be an integer between 1 and 10`<br>• 400 with a message for each of the four fields<br>• The list is empty. No booking was created. |
| API-04 | AC1 | **Seats cannot be exceeded**<br>Technique: boundary value analysis (capacity), state-based testing | P1 | • Book 9 tickets on World Tech Summit (8 seats)<br>• Book 8 tickets<br>• Book 1 ticket | • 400 `Only 8 seat(s) available, but 9 requested`<br>• 201 and `availableSeats` is 0<br>• 400 `Only 0 seat(s) available, but 1 requested` |
| API-05 | AC3, AC5 | **Booking data is protected**<br>Technique: authorization and security testing, negative testing | P1 | • Create a booking without a token<br>• User A books 1 ticket on Hollywood Monsoon Night. User B reads that booking by id.<br>• User B cancels A's booking<br>• User A gets the booking | • 401 `Unauthorized` (docs show it as public, Q13)<br>• 403<br>• An error status (403 or 404)<br>• Found and unchanged |
| API-06 | AC4 | **Cancel returns the seats**<br>Technique: state transition testing | P1 | • Book 2 tickets on World Tech Summit<br>• Get the event<br>• Cancel the booking<br>• Get the booking and list bookings<br>• Get the event<br>• Cancel the same booking again | • 201<br>• `availableSeats` is 6<br>• 200 `Booking cancelled`<br>• 404 and it is not in the list<br>• `availableSeats` is 8<br>• 404 and the seats stay at 8 |
| API-07 | AC1 | **No overselling**<br>Technique: concurrency (race condition) testing | P1 | • On World Tech Summit (8 seats), send 10 bookings of 1 ticket at the same time<br>• Count the successful bookings, then cancel them all<br>• Repeat up to 3 times | • At most 8 succeed<br>• Seats are back to 8<br>• Stop at the first round that oversells<br>**Known bug:** 10 succeeded in 2 of 3 rounds. A round can pass by chance, so the test repeats. |

## UI tests

| ID | AC | Scenario and technique | P | Steps | Expected |
|---|---|---|---|---|---|
| UI-01 | AC1, AC2 | **Book tickets through the form**<br>Technique: use-case testing, negative testing (client-side validation), boundary value analysis (ticket limit) | P1 | • Open World Tech Summit<br>• Click **Confirm Booking** on the empty form<br>• Click + until it stops<br>• Click − until 2 tickets show<br>• Enter valid details and click **Confirm Booking** | • The form shows `$1,500 × 1 ticket` and total `$1,500`<br>• `Name must be at least 2 chars`, `Enter a valid email`, `Enter a valid 10-digit phone`. No booking is created.<br>• The label shows `(max 8)`, + is disabled, `$1,500 × 8 tickets`, total `$12,000`<br>• `$1,500 × 2 tickets`, total `$3,000`<br>• `Booking Confirmed!` with a booking reference, the customer name, tickets `2` and total `$3,000` |
| UI-02 | AC3, AC4 | **Find and cancel a booking in My Bookings**<br>Technique: use-case testing (state verification), state transition testing | P1 | • Open **My Bookings** (2 tickets on Hollywood Monsoon Night, created through the API)<br>• Click **Cancel Booking**<br>• Click **Yes, cancel it** | • A card with the reference, `confirmed`, the event title, `2 tickets` and `$5,000`<br>• The dialog `Cancel this booking?` names the reference<br>• The card disappears and `No bookings yet` shows |

## End-to-end test

| ID | AC | Scenario and technique | P | Steps | Expected |
|---|---|---|---|---|---|
| E2E-01 | AC1 to AC5 | **Book in the UI, check the API, cancel in the UI, check the API**<br>Technique: end-to-end scenario testing, state transition testing | P1 | • Open World Tech Summit and book 2 tickets in the UI<br>• Through the API, get the booking by reference and get the event<br>• Open **My Bookings** and cancel the booking in the UI<br>• Through the API, get the booking and the event | • The confirmation shows a reference and `$3,000`<br>• The same booking (2 tickets, 3000, same details). The event has 6 seats.<br>• The booking disappears from the list<br>• 404 for the booking. The event has 8 seats. |

## Traceability

| AC | API | UI | E2E |
|---|---|---|---|
| Prerequisite (sign-in) | API-01 | | |
| AC1 | API-02, 03, 04, 07 | UI-01 | E2E-01 |
| AC2 | API-02 | UI-01 | E2E-01 |
| AC3 | API-02, 05 | UI-02 | E2E-01 |
| AC4 | API-06 | UI-02 | E2E-01 |
| AC5 | API-02, 05 | | E2E-01 |

## Test data preparation

No events are created. A fixture cancels any booking a test leaves behind.

| Test | User | Event | Booking | Clean up |
|---|---|---|---|---|
| API-01 | None. The test creates its own account. | None | None | None (accounts cannot be deleted) |
| API-02 | Framework user | Hollywood Monsoon Night | Made in the test | Cancel the booking |
| API-03 | Framework user | Hollywood Monsoon Night | None | None |
| API-04 | Framework user | World Tech Summit | Made in the test | Cancel the bookings |
| API-05 | Framework user (A) and a second user (B) | Hollywood Monsoon Night | A's booking, made in the test | Cancel the booking |
| API-06 | Framework user | World Tech Summit | Made in the test | None (the test cancels it) |
| API-07 | Framework user | World Tech Summit | Made in the test | Cancel the bookings |
| UI-01 | Framework user, signed in | World Tech Summit | None. Made through the form. | Cancel the booking |
| UI-02 | Framework user, signed in | Hollywood Monsoon Night | 2 tickets, created through the API | None (the test cancels it) |
| E2E-01 | Framework user, signed in | World Tech Summit | None. Made through the UI. | None (the test cancels it) |

## Not automated, and why

| Item | Why | Story review row |
|---|---|---|
| Booking or cancelling a booking for a past event | Rule not defined. Both succeed today. | 7, 11 |
| Booking twice with identical details | Not known whether a repeat is valid. | 8 |
| UI message for a sold-out event | Not defined. The API side is covered by API-04. | 6 |
| Phone formats beyond 10 digits (`+91 …`, spaces) | The accepted format is not defined. | 3 |
| Currency and rounding | Not defined. The seeded prices are whole numbers, so decimal prices are not checked. | 9 |
| Confirmation email | Not defined, and there is no mailbox to read. | 2 |
| Server errors on bad input (malformed JSON, `DELETE /bookings/abc`, a 500-character name) | A defect, not part of the story. To be reported. | 3 |
| Seat count on the event page not updating without a reload | A defect, not part of the story. To be reported. | |
| Paging and filters of the booking list, unknown event, unknown booking | Generic behaviour, low risk. | |
| Sign-in redirect, empty My Bookings, booking details page, keeping a booking when the cancel dialog is dismissed | Low risk. The main flows are covered by UI-02 and E2E-01. | 1 |
| Creating events, refund check, **Clear all bookings** | Not part of US-114. | |
