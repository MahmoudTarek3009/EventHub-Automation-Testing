import { test, expect } from '../../../src/fixtures/Fixtures.js';
import { PoManager } from '../../../src/pages/PoManager.js';
import events from '../../test-data/Events.json' with { type: 'json' };
import customer from '../../test-data/Customer.json' with { type: 'json' };

const { priceEvent } = events;

test('E2E-01 books tickets, finds the booking and cancels it', async ({ authenticatedPage }) => {
  const quantity = 2;
  const poManager = new PoManager(authenticatedPage);
  const eventsPage = poManager.getEventsPage();
  const eventDetailsPage = poManager.getEventDetailsPage();
  const myBookingsPage = poManager.getMyBookingsPage();
  let reference;

  await test.step('Book 2 tickets', async () => {
    await eventsPage.goTo();
    await eventsPage.openEvent(priceEvent.name);
    await eventDetailsPage.increaseTickets(quantity - 1);
    await eventDetailsPage.bookTickets(customer);

    await expect(eventDetailsPage.confirmationHeading).toBeVisible();
    await expect(eventDetailsPage.total(priceEvent.price * quantity)).toBeVisible();
    reference = await eventDetailsPage.getBookingReference();
  });

  await test.step('Find the booking in My Bookings', async () => {
    await eventDetailsPage.viewMyBookings();

    await expect(myBookingsPage.bookingCard(reference)).toBeVisible();
    await expect(myBookingsPage.totalInCard(reference, priceEvent.price * quantity)).toBeVisible();
  });

  await test.step('Cancel the booking', async () => {
    await myBookingsPage.cancelBooking(reference);

    await expect(myBookingsPage.bookingCard(reference)).toBeHidden();
    await expect(myBookingsPage.noBookingsMessage).toBeVisible();
  });
});
