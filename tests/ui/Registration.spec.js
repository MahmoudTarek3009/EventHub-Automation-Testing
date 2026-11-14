import { test, expect } from '../../src/fixtures/Fixtures.js';
import { PoManager } from '../../src/pages/PoManager.js';
import { buildCredentials, buildPassword } from '../../src/utils/DataBuilder.js';

test.describe('Registration', () => {
  test('UI-01 registers a new account', async ({ page }) => {
    const poManager = new PoManager(page);
    const registerPage = poManager.getRegisterPage();
    const { email, password } = buildCredentials();

    await registerPage.goTo();
    await registerPage.register(email, password);

    await expect(poManager.getHomePage().heading).toBeVisible();
  });

  test('UI-02 shows an error when the email is already registered', async ({ page, account }) => {
    const poManager = new PoManager(page);
    const registerPage = poManager.getRegisterPage();

    await registerPage.goTo();
    await registerPage.register(account.email, buildPassword());

    await expect(registerPage.emailAlreadyRegisteredMessage).toBeVisible();
    await expect(page).toHaveURL(/\/register/);
  });
});
