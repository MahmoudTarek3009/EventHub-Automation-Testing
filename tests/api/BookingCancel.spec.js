import { test, expect } from '../../src/fixtures/Fixtures.js';
import { errorShape } from '../../src/utils/api/ResponseShapes.js';
import events from '../test-data/Events.json' with { type: 'json' };
import customer from '../test-data/Customer.json' with { type: 'json' };

const { priceEvent, seatsEvent } = events;

test.describe('Cancel a booking', () => {
  test('API-12 cancels a booking', async ({ api }) => {
    const bookingsApi = api.getBookingsApi();
    const event = await api.getEventsApi().findByTitle(priceEvent.name);

    const created = await bookingsApi.book(event.id, 1, customer);
    expect(created.status()).toBe(201);
    const { data } = await created.json();
    const cancelled = await bookingsApi.cancel(data.id);
    const fetched = await bookingsApi.get(data.id);

    expect(cancelled.status()).toBe(200);
    expect(await cancelled.json()).toMatchObject({ success: true, message: 'Booking cancelled' });
    expect(fetched.status()).toBe(404);
    expect(await fetched.json()).toMatchObject(errorShape);
  });

  test('API-13 returns the seats when a booking is cancelled', async ({ api }) => {
    const bookingsApi = api.getBookingsApi();
    const eventsApi = api.getEventsApi();
    const event = await eventsApi.findByTitle(seatsEvent.name);
    expect(event.availableSeats, `${seatsEvent.name} should start with ${seatsEvent.seats} seats`).toBe(seatsEvent.seats);

    const created = await bookingsApi.book(event.id, 2, customer);
    expect(created.status()).toBe(201);
    const { data } = await created.json();
    const cancelled = await bookingsApi.cancel(data.id);
    const eventAfter = await eventsApi.get(event.id);

    expect(cancelled.status()).toBe(200);
    expect(eventAfter.status()).toBe(200);
    expect((await eventAfter.json()).data.availableSeats).toBe(seatsEvent.seats);
  });
});
