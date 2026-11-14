// @ts-check
/** @typedef {import('@playwright/test').Page} Page */

export class RegisterPage {
  /** @param {Page} page */
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder('you@email.com');
    this.passwordInput = page.getByPlaceholder('Min 8 chars, uppercase, number & symbol');
    this.confirmPasswordInput = page.getByPlaceholder('Repeat your password');
    this.createAccountButton = page.getByRole('button', { name: 'Create Account' });
    this.emailAlreadyRegisteredMessage = page.getByText('Email already registered', { exact: true });
  }

  async goTo() {
    await this.page.goto('/register');
  }

  /**
   * @param {string} email
   * @param {string} password
   */
  async register(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.createAccountButton.click();
  }
}
