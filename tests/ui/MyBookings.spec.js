import { test, expect } from '../../src/fixtures/Fixtures.js';
import { PoManager } from '../../src/pages/PoManager.js';
import events from '../test-data/Events.json' with { type: 'json' };
import customer from '../test-data/Customer.json' with { type: 'json' };

const { priceEvent, seatsEvent } = events;

// Books tickets through the form and returns the booking reference from the confirmation.
async function bookThroughForm(poManager, event, quantity) {
  const eventsPage = poManager.getEventsPage();
  const eventDetailsPage = poManager.getEventDetailsPage();

  await eventsPage.goTo();
  await eventsPage.openEvent(event.name);
  await eventDetailsPage.increaseTickets(quantity - 1);
  await eventDetailsPage.bookTickets(customer);
  return eventDetailsPage.getBookingReference();
}

test.describe('My bookings', () => {
  test('UI-10 lists a new booking in My Bookings', async ({ authenticatedPage }) => {
    const quantity = 2;
    const poManager = new PoManager(authenticatedPage);
    const myBookingsPage = poManager.getMyBookingsPage();

    const reference = await bookThroughForm(poManager, priceEvent, quantity);
    await poManager.getEventDetailsPage().viewMyBookings();

    const card = myBookingsPage.bookingCard(reference);
    await expect(card).toBeVisible();
    await expect(card).toContainText('confirmed');
    await expect(card).toContainText(priceEvent.name);
    await expect(myBookingsPage.ticketsInCard(reference, quantity)).toBeVisible();
    await expect(myBookingsPage.totalInCard(reference, priceEvent.price * quantity)).toBeVisible();
  });

  test('UI-11 shows the booking data on the details page', async ({ authenticatedPage }) => {
    const quantity = 2;
    const poManager = new PoManager(authenticatedPage);
    const bookingDetailsPage = poManager.getBookingDetailsPage();

    const reference = await bookThroughForm(poManager, priceEvent, quantity);
    await poManager.getEventDetailsPage().viewMyBookings();
    await poManager.getMyBookingsPage().openDetails(reference);

    await expect(bookingDetailsPage.detail(customer.name)).toBeVisible();
    await expect(bookingDetailsPage.detail(customer.email)).toBeVisible();
    await expect(bookingDetailsPage.detail(customer.phone)).toBeVisible();
    await expect(bookingDetailsPage.detail(String(quantity))).toBeVisible();
    await expect(bookingDetailsPage.totalPaid(priceEvent.price * quantity)).toBeVisible();
  });

  test('UI-12 cancels a booking', async ({ authenticatedPage }) => {
    const poManager = new PoManager(authenticatedPage);
    const myBookingsPage = poManager.getMyBookingsPage();

    const reference = await bookThroughForm(poManager, priceEvent, 1);
    await poManager.getEventDetailsPage().viewMyBookings();
    await myBookingsPage.openCancelDialog(reference);

    await expect(myBookingsPage.cancelDialog).toContainText(reference);

    await myBookingsPage.confirmCancel();

    await expect(myBookingsPage.bookingCard(reference)).toBeHidden();
    await expect(myBookingsPage.noBookingsMessage).toBeVisible();
  });

  test('UI-13 returns the seats when a booking is cancelled', async ({ authenticatedPage }) => {
    const poManager = new PoManager(authenticatedPage);
    const myBookingsPage = poManager.getMyBookingsPage();
    const eventsPage = poManager.getEventsPage();
    const eventDetailsPage = poManager.getEventDetailsPage();

    const reference = await bookThroughForm(poManager, seatsEvent, 2);
    await eventDetailsPage.viewMyBookings();
    await myBookingsPage.cancelBooking(reference);

    await expect(myBookingsPage.bookingCard(reference)).toBeHidden();

    await eventsPage.goTo();
    await eventsPage.openEvent(seatsEvent.name);

    await expect(eventDetailsPage.seatsAvailable).toHaveText(`${seatsEvent.seats} / ${seatsEvent.totalSeats} seats`);
  });
});
