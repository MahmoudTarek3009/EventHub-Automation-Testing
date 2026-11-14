// @ts-check
/** @typedef {import('@playwright/test').APIRequestContext} APIRequestContext */

export class BookingsApi {
  /** @param {APIRequestContext} request */
  constructor(request) {
    this.request = request;
  }

  /**
   * @param {number} eventId
   * @param {number} quantity
   * @param {{ name: string, email: string, phone: string }} customer
   */
  book(eventId, quantity, customer) {
    return this.request.post('bookings', {
      data: {
        eventId,
        quantity,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
      },
    });
  }

  list() {
    return this.request.get('bookings', { params: { limit: 100 } });
  }

  /** @param {number} id */
  get(id) {
    return this.request.get(`bookings/${id}`);
  }

  /** @param {number} id */
  cancel(id) {
    return this.request.delete(`bookings/${id}`);
  }

  // Test clean up: cancels every booking of the user so the seats are released.
  async cancelAll() {
    const response = await this.list();
    if (!response.ok()) {
      throw new Error(`The bookings could not be listed for clean up. The API answered ${response.status()}.`);
    }
    const body = await response.json();
    for (const booking of body.data) {
      await this.cancel(booking.id);
    }
  }
}
