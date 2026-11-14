// @ts-check

/** @typedef {import('@playwright/test').Page} Page */

export class EventDetailsPage {
  /** @param {Page} page */
  constructor(page) {
    this.page = page;
    this.seatsAvailable = page.getByText(/\d+ \/ \d+ seats/);
    this.increaseButton = page.getByRole('button', { name: '+', exact: true });
    this.decreaseButton = page.getByRole('button', { name: '\u2212', exact: true });
    this.maxTicketsLabel = page.getByText(/\(max \d+\)/);
    this.nameInput = page.getByLabel('Full Name*');
    this.emailInput = page.getByLabel('Email*');
    this.phoneInput = page.getByLabel('Phone Number*');
    this.confirmBookingButton = page.getByRole('button', { name: 'Confirm Booking' });
    this.nameRequiredMessage = page.getByText('Name must be at least 2 chars', { exact: true });
    this.emailInvalidMessage = page.getByText('Enter a valid email', { exact: true });
    this.phoneInvalidMessage = page.getByText('Enter a valid 10-digit phone', { exact: true });
    this.confirmationHeading = page.getByRole('heading', { name: 'Booking Confirmed!' });
    this.bookingReference = page.getByText(/^[A-Z]+-[A-Z0-9]{6}$/);
    this.viewMyBookingsButton = page.getByRole('button', { name: 'View My Bookings' });
  }

  /** @param {number} times */
  async increaseTickets(times) {
    for (let i = 0; i < times; i++) {
      await this.increaseButton.click();
    }
  }

  /** @param {{ name: string, email: string, phone: string }} customer */
  async fillCustomerDetails(customer) {
    await this.nameInput.fill(customer.name);
    await this.emailInput.fill(customer.email);
    await this.phoneInput.fill(customer.phone);
  }

  async confirmBooking() {
    await this.confirmBookingButton.click();
  }

  /** @param {{ name: string, email: string, phone: string }} customer */
  async bookTickets(customer) {
    await this.fillCustomerDetails(customer);
    await this.confirmBooking();
  }

  async reload() {
    await this.page.reload();
  }

  async viewMyBookings() {
    await this.viewMyBookingsButton.click();
  }

  async getBookingReference() {
    await this.confirmationHeading.waitFor();
    return this.bookingReference.innerText();
  }

  // The price summary line, for example "$2,500 × 3 tickets".
  /**
   * @param {number} price
   * @param {number} quantity
   */
  ticketLine(price, quantity) {
    const noun = quantity === 1 ? 'ticket' : 'tickets';
    return this.page.getByText(`$${price.toLocaleString('en-US')} × ${quantity} ${noun}`, { exact: true });
  }

  // The same price can also show as the price per ticket and the subtotal, so the Total is the last one on the page.
  /** @param {number} amount */
  total(amount) {
    return this.page.getByText(`$${amount.toLocaleString('en-US')}`, { exact: true }).last();
  }

  /** @param {string} name */
  confirmationCustomer(name) {
    return this.page.getByText(name, { exact: true });
  }

  /** @param {number} quantity */
  confirmationTickets(quantity) {
    return this.page.getByText(String(quantity), { exact: true });
  }
}
