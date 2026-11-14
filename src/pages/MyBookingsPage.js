// @ts-check
/** @typedef {import('@playwright/test').Page} Page */

export class MyBookingsPage {
  /** @param {Page} page */
  constructor(page) {
    this.page = page;
    this.noBookingsMessage = page.getByRole('heading', { name: 'No bookings yet' });
    this.cancelDialog = page.getByRole('dialog', { name: 'Cancel this booking?' });
    this.confirmCancelButton = page.getByRole('button', { name: 'Yes, cancel it' });
    this.clearAllButton = page.getByRole('button', { name: 'Clear all bookings' });
  }

  async goTo() {
    await this.page.goto('/bookings');
  }

  /** @param {string} reference */
  bookingCard(reference) {
    return this.page.getByTestId('booking-card').filter({ hasText: reference });
  }

  // The card shows the count with an icon in front, for example "🎫 2 tickets".
  /**
   * @param {string} reference
   * @param {number} quantity
   */
  ticketsInCard(reference, quantity) {
    const noun = quantity === 1 ? 'ticket' : 'tickets';
    return this.bookingCard(reference).getByText(`${quantity} ${noun}`);
  }

  /**
   * @param {string} reference
   * @param {number} amount
   */
  totalInCard(reference, amount) {
    return this.bookingCard(reference).getByText(`$${amount.toLocaleString('en-US')}`, { exact: true });
  }

  /** @param {string} reference */
  async openDetails(reference) {
    await this.bookingCard(reference).getByRole('link', { name: 'View Details' }).click();
  }

  /** @param {string} reference */
  async openCancelDialog(reference) {
    await this.bookingCard(reference).getByRole('button', { name: 'Cancel Booking' }).click();
  }

  async confirmCancel() {
    await this.confirmCancelButton.click();
  }

  /** @param {string} reference */
  async cancelBooking(reference) {
    await this.openCancelDialog(reference);
    await this.confirmCancel();
  }

  // Test clean up: the app asks for confirmation with a native browser dialog.
  async clearAllBookings() {
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.clearAllButton.click();
    await this.noBookingsMessage.waitFor();
  }
}
