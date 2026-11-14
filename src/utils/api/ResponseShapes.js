import { expect } from '@playwright/test';

// The fields and types a response must carry. Each test checks the values it cares about on top of this.
export const bookingShape = {
  id: expect.any(Number),
  eventId: expect.any(Number),
  customerName: expect.any(String),
  customerEmail: expect.any(String),
  customerPhone: expect.any(String),
  quantity: expect.any(Number),
  totalPrice: expect.any(String),
  status: expect.any(String),
  bookingRef: expect.stringMatching(/\S/),
  event: expect.objectContaining({ id: expect.any(Number), title: expect.any(String) }),
};

/** @param {string} email */
export function authShape(email) {
  return {
    success: true,
    token: expect.stringMatching(/\S/),
    user: { id: expect.any(Number), email },
  };
}

export const errorShape = { success: false, error: expect.any(String) };
