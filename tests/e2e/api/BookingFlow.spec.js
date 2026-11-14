import { test, expect } from '../../../src/fixtures/Fixtures.js';
import events from '../../test-data/Events.json' with { type: 'json' };
import customer from '../../test-data/Customer.json' with { type: 'json' };

const { seatsEvent } = events;

test('E2E-02 books tickets, lists the booking and cancels it', async ({ api }) => {
  const quantity = 2;
  const bookingsApi = api.getBookingsApi();
  const eventsApi = api.getEventsApi();
  const event = await eventsApi.findByTitle(seatsEvent.name);
  expect(event.availableSeats, `${seatsEvent.name} should start with ${seatsEvent.seats} seats`).toBe(seatsEvent.seats);
  let booking;

  await test.step('Book 2 tickets', async () => {
    const response = await bookingsApi.book(event.id, quantity, customer);

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.message).toBe('Booking confirmed!');
    expect(Number(body.data.totalPrice)).toBe(seatsEvent.price * quantity);
    booking = body.data;
  });

  await test.step('Find the booking in the list', async () => {
    const response = await bookingsApi.list();

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data[0]).toMatchObject({ id: booking.id, bookingRef: booking.bookingRef, status: 'confirmed' });
  });

  await test.step('Cancel the booking', async () => {
    const cancelled = await bookingsApi.cancel(booking.id);

    expect(cancelled.status()).toBe(200);
    expect(await cancelled.json()).toMatchObject({ success: true, message: 'Booking cancelled' });

    const fetched = await bookingsApi.get(booking.id);
    const eventAfter = await eventsApi.get(event.id);

    expect(fetched.status()).toBe(404);
    expect(eventAfter.status()).toBe(200);
    expect((await eventAfter.json()).data.availableSeats).toBe(seatsEvent.seats);
  });
});
