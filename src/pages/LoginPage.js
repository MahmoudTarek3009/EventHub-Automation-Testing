// @ts-check
/** @typedef {import('@playwright/test').Page} Page */

export class LoginPage {
  /** @param {Page} page */
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Sign in to EventHub' });
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.invalidCredentialsMessage = page.getByText('Invalid email or password', { exact: true });
  }

  async goTo() {
    await this.page.goto('/login');
  }

  async signIn(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
