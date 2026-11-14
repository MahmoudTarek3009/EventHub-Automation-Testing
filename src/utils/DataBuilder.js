import { randomBytes } from 'node:crypto';

export function buildEmail() {
  return `qa.${Date.now()}.${randomBytes(3).toString('hex')}@example.com`;
}

// Meets the Register page rules: 8+ characters, an uppercase letter, a number and a symbol.
export function buildPassword() {
  return `Aa1!${randomBytes(6).toString('hex')}`;
}

export function buildCredentials() {
  return { email: buildEmail(), password: buildPassword() };
}
