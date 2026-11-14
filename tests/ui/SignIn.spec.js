import { test, expect } from '../../src/fixtures/Fixtures.js';
import { PoManager } from '../../src/pages/PoManager.js';
import { buildPassword } from '../../src/utils/DataBuilder.js';

test.describe('Sign in', () => {
  test('UI-03 signs in with valid credentials', async ({ page, account }) => {
    const poManager = new PoManager(page);
    const loginPage = poManager.getLoginPage();

    await loginPage.goTo();
    await loginPage.signIn(account.email, account.password);

    await expect(poManager.getHomePage().heading).toBeVisible();
  });

  test('UI-04 shows an error for a wrong password', async ({ page, account }) => {
    const poManager = new PoManager(page);
    const loginPage = poManager.getLoginPage();

    await loginPage.goTo();
    await loginPage.signIn(account.email, buildPassword());

    await expect(loginPage.invalidCredentialsMessage).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('UI-14 sends a signed-out visitor to the sign in page', async ({ page }) => {
    const poManager = new PoManager(page);

    await poManager.getMyBookingsPage().goTo();

    await expect(page).toHaveURL(/\/login/);
    await expect(poManager.getLoginPage().heading).toBeVisible();
  });
});
