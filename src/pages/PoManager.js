// @ts-check
import { RegisterPage } from './RegisterPage.js';
import { LoginPage } from './LoginPage.js';
import { HomePage } from './HomePage.js';
import { EventsPage } from './EventsPage.js';
import { EventDetailsPage } from './EventDetailsPage.js';
import { MyBookingsPage } from './MyBookingsPage.js';
import { BookingDetailsPage } from './BookingDetailsPage.js';

/** @typedef {import('@playwright/test').Page} Page */

export class PoManager {
  /** @param {Page} page */
  constructor(page) {
    this.page = page;
    this.registerPage = new RegisterPage(this.page);
    this.loginPage = new LoginPage(this.page);
    this.homePage = new HomePage(this.page);
    this.eventsPage = new EventsPage(this.page);
    this.eventDetailsPage = new EventDetailsPage(this.page);
    this.myBookingsPage = new MyBookingsPage(this.page);
    this.bookingDetailsPage = new BookingDetailsPage(this.page);
  }

  getRegisterPage() {
    return this.registerPage;
  }

  getLoginPage() {
    return this.loginPage;
  }

  getHomePage() {
    return this.homePage;
  }

  getEventsPage() {
    return this.eventsPage;
  }

  getEventDetailsPage() {
    return this.eventDetailsPage;
  }

  getMyBookingsPage() {
    return this.myBookingsPage;
  }

  getBookingDetailsPage() {
    return this.bookingDetailsPage;
  }
}
