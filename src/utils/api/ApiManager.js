// @ts-check
import { AuthApi } from './AuthApi.js';
import { EventsApi } from './EventsApi.js';
import { BookingsApi } from './BookingsApi.js';

/** @typedef {import('@playwright/test').APIRequestContext} APIRequestContext */

export class ApiManager {
  /** @param {APIRequestContext} request */
  constructor(request) {
    this.request = request;
    this.authApi = new AuthApi(this.request);
    this.eventsApi = new EventsApi(this.request);
    this.bookingsApi = new BookingsApi(this.request);
  }

  getAuthApi() {
    return this.authApi;
  }

  getEventsApi() {
    return this.eventsApi;
  }

  getBookingsApi() {
    return this.bookingsApi;
  }
}
