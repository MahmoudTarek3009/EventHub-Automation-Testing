// @ts-check
/** @typedef {import('@playwright/test').APIRequestContext} APIRequestContext */

export class AuthApi {
  /** @param {APIRequestContext} request */
  constructor(request) {
    this.request = request;
  }

  /**
   * @param {string} email
   * @param {string} password
   */
  register(email, password) {
    return this.request.post('auth/register', { data: { email, password } });
  }

  /**
   * @param {string} email
   * @param {string} password
   */
  login(email, password) {
    return this.request.post('auth/login', { data: { email, password } });
  }
}
