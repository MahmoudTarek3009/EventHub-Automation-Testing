// @ts-check
/** @typedef {import('@playwright/test').Page} Page */

export class HomePage {
  /** @param {Page} page */
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Discover & Book Amazing Events', level: 1 });
  }
}
