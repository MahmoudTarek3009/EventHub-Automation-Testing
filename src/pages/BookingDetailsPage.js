// @ts-check
/** @typedef {import('@playwright/test').Page} Page */

export class BookingDetailsPage {
  /** @param {Page} page */
  constructor(page) {
    this.page = page;
  }

  /** @param {string} value */
  detail(value) {
    return this.page.getByText(value, { exact: true });
  }

  /** @param {number} amount */
  totalPaid(amount) {
    return this.page.getByText(`$${amount.toLocaleString('en-US')}`, { exact: true });
  }
}
