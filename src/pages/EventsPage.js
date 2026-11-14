// @ts-check
/** @typedef {import('@playwright/test').Page} Page */

export class EventsPage {
  /** @param {Page} page */
  constructor(page) {
    this.page = page;
  }

  async goTo() {
    await this.page.goto('/events');
  }

  /** @param {string} title */
  async openEvent(title) {
    await this.page.getByRole('link', { name: title, exact: true }).click();
  }
}
