import { describe, expect, it } from "vitest";

import {
  contactBodySchema,
  emailOnlyBodySchema,
  emailWithTurnstileBodySchema,
} from "./public-forms";

describe("public-forms schemas", () => {
  it("accepts a valid contact payload", () => {
    const r = contactBodySchema.safeParse({
      name: "Ama",
      email: "ama@example.com",
      subject: "Hello",
      message: "Body text",
    });
    expect(r.success).toBe(true);
  });

  it("rejects contact when message empty", () => {
    const r = contactBodySchema.safeParse({
      name: "Ama",
      email: "ama@example.com",
      subject: "Hello",
      message: "",
    });
    expect(r.success).toBe(false);
  });

  it("emailOnlyBodySchema requires valid email", () => {
    expect(emailOnlyBodySchema.safeParse({ email: "x" }).success).toBe(false);
    expect(emailOnlyBodySchema.safeParse({ email: "ok@example.com" }).success).toBe(true);
  });

  it("emailWithTurnstileBodySchema allows optional turnstile token", () => {
    const r = emailWithTurnstileBodySchema.safeParse({
      email: "ok@example.com",
      turnstileToken: "token",
    });
    expect(r.success).toBe(true);
  });
});
