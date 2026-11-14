import { test, expect } from '../../src/fixtures/Fixtures.js';
import events from '../test-data/Events.json' with { type: 'json' };
import customer from '../test-data/Customer.json' with { type: 'json' };

const { priceEvent } = events;

test.describe('Read bookings', () => {
  test('API-10 lists a new booking', async ({ api }) => {
    const bookingsApi = api.getBookingsApi();
    const event = await api.getEventsApi().findByTitle(priceEvent.name);

    const created = await bookingsApi.book(event.id, 1, customer);
    expect(created.status()).toBe(201);
    const { data } = await created.json();
    const listed = await bookingsApi.list();

    expect(listed.status()).toBe(200);
    const listedBody = await listed.json();
    expect(listedBody.data[0]).toMatchObject({ id: data.id, status: 'confirmed' });
  });

  test('API-11 fetches a booking by id', async ({ api }) => {
    const bookingsApi = api.getBookingsApi();
    const event = await api.getEventsApi().findByTitle(priceEvent.name);

    const created = await bookingsApi.book(event.id, 1, customer);
    expect(created.status()).toBe(201);
    const { data } = await created.json();
    const fetched = await bookingsApi.get(data.id);

    expect(fetched.status()).toBe(200);
    const fetchedBody = await fetched.json();
    expect(fetchedBody.data).toMatchObject({
      id: data.id,
      bookingRef: data.bookingRef,
      quantity: data.quantity,
      totalPrice: data.totalPrice,
    });
  });
});
