import { test as base, expect } from '@playwright/test';
import { PoManager } from '../pages/PoManager.js';
import { ApiManager } from '../utils/api/ApiManager.js';
import { AuthApi } from '../utils/api/AuthApi.js';
import { buildCredentials } from '../utils/DataBuilder.js';

export { expect };

export const test = base.extend({
  // One account per worker, registered through the UI. Holds the credentials and the signed-in session.
  // Register and sign-in tests use the credentials only and start from a signed-out page.
  account: [
    async ({ browser }, use, workerInfo) => {
      const context = await browser.newContext({ baseURL: workerInfo.project.use.baseURL });
      const page = await context.newPage();
      const poManager = new PoManager(page);
      const credentials = buildCredentials();

      const registerPage = poManager.getRegisterPage();
      await registerPage.goTo();
      await registerPage.register(credentials.email, credentials.password);
      await poManager.getHomePage().heading.waitFor();

      const storageState = await context.storageState();
      await context.close();
      await use({ ...credentials, storageState });
    },
    { scope: 'worker', timeout: 60 * 1000 },
  ],

  // A page that is already signed in. Tests that need a user ask for this fixture and never sign in themselves.
  authenticatedPage: async ({ browser, baseURL, account }, use) => {
    const context = await browser.newContext({ baseURL, storageState: account.storageState });
    const page = await context.newPage();

    await use(page);

    // Tear down: cancel the bookings the test left behind so the seats are released for the next test.
    const myBookingsPage = new PoManager(page).getMyBookingsPage();
    await myBookingsPage.goTo();
    await myBookingsPage.clearAllBookings();
    await context.close();
  },

  // One user per worker, registered through the API. Holds the credentials and the token.
  apiUser: [
    async ({ playwright }, use, workerInfo) => {
      const request = await playwright.request.newContext({ baseURL: workerInfo.project.use.baseURL });
      const credentials = buildCredentials();

      const response = await new AuthApi(request).register(credentials.email, credentials.password);
      if (!response.ok()) {
        throw new Error(`The framework user could not be registered. The API answered ${response.status()}.`);
      }
      const body = await response.json();

      await request.dispose();
      await use({ ...credentials, token: body.token });
    },
    { scope: 'worker', timeout: 60 * 1000 },
  ],

  // API objects that send the user's token on every request. Tests that need a user ask for this fixture and never handle a token.
  api: async ({ playwright, baseURL, apiUser }, use) => {
    const request = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { Authorization: `Bearer ${apiUser.token}` },
    });
    const apiManager = new ApiManager(request);

    await use(apiManager);

    // Tear down: cancel the bookings the test left behind so the seats are released for the next test.
    await apiManager.getBookingsApi().cancelAll();
    await request.dispose();
  },

  // API objects with no token, for the register, login and missing-token tests.
  anonymousApi: async ({ request }, use) => {
    await use(new ApiManager(request));
  },
});
