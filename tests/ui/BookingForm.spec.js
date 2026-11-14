import { test, expect } from '../../src/fixtures/Fixtures.js';
import { PoManager } from '../../src/pages/PoManager.js';
import events from '../test-data/Events.json' with { type: 'json' };
import customer from '../test-data/Customer.json' with { type: 'json' };

const { priceEvent, seatsEvent } = events;

test.describe('Booking form', () => {
  test('UI-05 confirms a booking made with valid details', async ({ authenticatedPage }) => {
    const poManager = new PoManager(authenticatedPage);
    const eventsPage = poManager.getEventsPage();
    const eventDetailsPage = poManager.getEventDetailsPage();

    await eventsPage.goTo();
    await eventsPage.openEvent(priceEvent.name);
    await eventDetailsPage.bookTickets(customer);

    await expect(eventDetailsPage.confirmationHeading).toBeVisible();
    await expect(eventDetailsPage.bookingReference).toBeVisible();
    await expect(eventDetailsPage.confirmationCustomer(customer.name)).toBeVisible();
    await expect(eventDetailsPage.confirmationTickets(1)).toBeVisible();
    await expect(eventDetailsPage.total(priceEvent.price)).toBeVisible();
  });

  test('UI-06 shows a total that follows the ticket count', async ({ authenticatedPage }) => {
    const poManager = new PoManager(authenticatedPage);
    const eventsPage = poManager.getEventsPage();
    const eventDetailsPage = poManager.getEventDetailsPage();

    await eventsPage.goTo();
    await eventsPage.openEvent(priceEvent.name);
    await eventDetailsPage.increaseTickets(2);

    await expect(eventDetailsPage.ticketLine(priceEvent.price, 3)).toBeVisible();
    await expect(eventDetailsPage.total(priceEvent.price * 3)).toBeVisible();
  });

  test('UI-07 shows required-field messages for an empty form', async ({ authenticatedPage }) => {
    const poManager = new PoManager(authenticatedPage);
    const eventsPage = poManager.getEventsPage();
    const eventDetailsPage = poManager.getEventDetailsPage();

    await eventsPage.goTo();
    await eventsPage.openEvent(priceEvent.name);
    await eventDetailsPage.confirmBooking();

    await expect(eventDetailsPage.nameRequiredMessage).toBeVisible();
    await expect(eventDetailsPage.emailInvalidMessage).toBeVisible();
    await expect(eventDetailsPage.phoneInvalidMessage).toBeVisible();
    await expect(eventDetailsPage.confirmationHeading).toBeHidden();
  });

  test('UI-08 stops the ticket count at the seats left', async ({ authenticatedPage }) => {
    const poManager = new PoManager(authenticatedPage);
    const eventsPage = poManager.getEventsPage();
    const eventDetailsPage = poManager.getEventDetailsPage();

    await eventsPage.goTo();
    await eventsPage.openEvent(seatsEvent.name);
    await eventDetailsPage.increaseTickets(seatsEvent.seats - 1);

    await expect(eventDetailsPage.maxTicketsLabel).toHaveText(`(max ${seatsEvent.seats})`);
    await expect(eventDetailsPage.increaseButton).toBeDisabled();
    await expect(eventDetailsPage.total(seatsEvent.price * seatsEvent.seats)).toBeVisible();
    await expect(eventDetailsPage.ticketLine(seatsEvent.price, seatsEvent.seats)).toBeVisible();
  });

  test('UI-09 lowers the seats left after a booking', async ({ authenticatedPage }) => {
    const quantity = 2;
    const poManager = new PoManager(authenticatedPage);
    const eventsPage = poManager.getEventsPage();
    const eventDetailsPage = poManager.getEventDetailsPage();

    await eventsPage.goTo();
    await eventsPage.openEvent(seatsEvent.name);
    await eventDetailsPage.increaseTickets(quantity - 1);
    await eventDetailsPage.bookTickets(customer);
    await expect(eventDetailsPage.confirmationHeading).toBeVisible();
    await eventDetailsPage.reload();

    await expect(eventDetailsPage.seatsAvailable).toHaveText(
      `${seatsEvent.seats - quantity} / ${seatsEvent.totalSeats} seats`,
    );
  });
});
