// @ts-check
/** @typedef {import('@playwright/test').APIRequestContext} APIRequestContext */

export class EventsApi {
  /** @param {APIRequestContext} request */
  constructor(request) {
    this.request = request;
  }

  list() {
    return this.request.get('events', { params: { limit: 100 } });
  }

  /** @param {number} id */
  get(id) {
    return this.request.get(`events/${id}`);
  }

  // Looks a seeded event up by its title, so a test never hard-codes an event id.
  /** @param {string} title */
  async findByTitle(title) {
    const response = await this.list();
    if (!response.ok()) {
      throw new Error(`The events could not be listed. The API answered ${response.status()}.`);
    }
    const body = await response.json();
    const event = body.data.find((/** @type {{ title: string }} */ item) => item.title === title);
    if (!event) {
      throw new Error(`The event "${title}" was not found. The seeded events may have changed.`);
    }
    return event;
  }
}
