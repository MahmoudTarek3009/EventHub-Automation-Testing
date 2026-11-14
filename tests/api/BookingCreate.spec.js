import { test, expect } from '../../src/fixtures/Fixtures.js';
import { bookingShape } from '../../src/utils/api/ResponseShapes.js';
import events from '../test-data/Events.json' with { type: 'json' };
import customer from '../test-data/Customer.json' with { type: 'json' };

const { priceEvent, seatsEvent } = events;

test.describe('Create a booking', () => {
  test('API-05 creates a booking with valid data', async ({ api }) => {
    const quantity = 2;
    const event = await api.getEventsApi().findByTitle(priceEvent.name);

    const response = await api.getBookingsApi().book(event.id, quantity, customer);

    expect(response.status()).toBe(201);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    expect(body).toMatchObject({ success: true, message: 'Booking confirmed!', data: bookingShape });
    expect(body.data).toMatchObject({
      eventId: event.id,
      status: 'confirmed',
      quantity,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
    });
  });

  test('API-06 calculates the total as price times quantity', async ({ api }) => {
    const quantity = 3;
    const event = await api.getEventsApi().findByTitle(priceEvent.name);

    const response = await api.getBookingsApi().book(event.id, quantity, customer);

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(Number(body.data.totalPrice)).toBe(priceEvent.price * quantity);
  });

  test('API-07 rejects more than 10 tickets', async ({ api }) => {
    const event = await api.getEventsApi().findByTitle(priceEvent.name);

    const response = await api.getBookingsApi().book(event.id, 11, customer);

    expect(response.status()).toBe(400);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(await response.json()).toMatchObject({
      success: false,
      error: 'Validation failed',
      details: [{ field: 'quantity', message: 'Quantity must be an integer between 1 and 10' }],
    });
  });

  test('API-08 rejects more tickets than the seats left', async ({ api }) => {
    const event = await api.getEventsApi().findByTitle(seatsEvent.name);
    expect(event.availableSeats, `${seatsEvent.name} should start with ${seatsEvent.seats} seats`).toBe(seatsEvent.seats);
    const quantity = seatsEvent.seats + 1;

    const response = await api.getBookingsApi().book(event.id, quantity, customer);

    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({
      success: false,
      error: `Only ${seatsEvent.seats} seat(s) available, but ${quantity} requested`,
    });
  });

  test('API-09 takes the seats of a booking', async ({ api }) => {
    const quantity = 2;
    const event = await api.getEventsApi().findByTitle(seatsEvent.name);
    expect(event.availableSeats, `${seatsEvent.name} should start with ${seatsEvent.seats} seats`).toBe(seatsEvent.seats);

    const booked = await api.getBookingsApi().book(event.id, quantity, customer);
    expect(booked.status()).toBe(201);
    const eventAfter = await api.getEventsApi().get(event.id);

    expect(eventAfter.status()).toBe(200);
    expect((await eventAfter.json()).data.availableSeats).toBe(seatsEvent.seats - quantity);
  });

  test('API-14 requires a token to create a booking', async ({ api, anonymousApi }) => {
    const event = await api.getEventsApi().findByTitle(priceEvent.name);

    const response = await anonymousApi.getBookingsApi().book(event.id, 1, customer);

    expect(response.status()).toBe(401);
    expect(await response.json()).toMatchObject({ success: false, error: 'Unauthorized' });
  });
});
