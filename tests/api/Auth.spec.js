import { test, expect } from '../../src/fixtures/Fixtures.js';
import { buildCredentials, buildPassword } from '../../src/utils/DataBuilder.js';
import { authShape } from '../../src/utils/api/ResponseShapes.js';

test.describe('Account', () => {
  test('API-01 registers a new user', async ({ anonymousApi }) => {
    const { email, password } = buildCredentials();

    const response = await anonymousApi.getAuthApi().register(email, password);

    expect(response.status()).toBe(201);
    expect(await response.json()).toMatchObject(authShape(email));
  });

  test('API-02 rejects an email that is already registered', async ({ anonymousApi }) => {
    const authApi = anonymousApi.getAuthApi();
    const { email, password } = buildCredentials();

    const first = await authApi.register(email, password);
    const second = await authApi.register(email, password);

    expect(first.status()).toBe(201);
    expect(second.status()).toBe(400);
    expect(await second.json()).toMatchObject({ success: false, error: 'Email already registered' });
  });

  test('API-03 logs in with valid credentials', async ({ anonymousApi, apiUser }) => {
    const response = await anonymousApi.getAuthApi().login(apiUser.email, apiUser.password);

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject(authShape(apiUser.email));
  });

  test('API-04 rejects a wrong password', async ({ anonymousApi, apiUser }) => {
    const response = await anonymousApi.getAuthApi().login(apiUser.email, buildPassword());

    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ success: false, error: 'Invalid email or password' });
  });
});
