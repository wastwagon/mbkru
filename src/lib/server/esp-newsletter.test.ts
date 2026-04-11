import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("pushNewsletterSubscriptionToEspIfConfigured", () => {
  const original = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.MAILCHIMP_API_KEY;
    delete process.env.MAILCHIMP_LIST_ID;
    delete process.env.CONVERTKIT_API_SECRET;
    delete process.env.CONVERTKIT_FORM_ID;
  });

  afterEach(() => {
    process.env = { ...original };
  });

  it("returns none when no ESP env is set", async () => {
    const { pushNewsletterSubscriptionToEspIfConfigured } = await import("./esp-newsletter");
    const out = await pushNewsletterSubscriptionToEspIfConfigured("User@Example.com");
    expect(out).toEqual({ provider: "none", ok: true });
  });

  it("uses Mailchimp when key and list id are set", async () => {
    process.env.MAILCHIMP_API_KEY = "abc-us19";
    process.env.MAILCHIMP_LIST_ID = "list1";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => "",
    });
    vi.stubGlobal("fetch", fetchMock);

    const { pushNewsletterSubscriptionToEspIfConfigured } = await import("./esp-newsletter");
    const out = await pushNewsletterSubscriptionToEspIfConfigured("User@Example.com");

    expect(out.provider).toBe("mailchimp");
    expect(out.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://us19.api.mailchimp.com/3.0/lists/list1/members/b58996c504c5638798eb6b511e6f49af");
    expect(init.method).toBe("PUT");
    expect(init.headers).toMatchObject({ Authorization: expect.stringContaining("Basic ") });
    const body = JSON.parse(init.body as string);
    expect(body.email_address).toBe("user@example.com");
    expect(body.status).toBe("subscribed");
  });

  it("prefers Mailchimp over ConvertKit when both are configured", async () => {
    process.env.MAILCHIMP_API_KEY = "k-us8";
    process.env.MAILCHIMP_LIST_ID = "L";
    process.env.CONVERTKIT_API_SECRET = "sec";
    process.env.CONVERTKIT_FORM_ID = "99";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}), text: async () => "" }),
    );

    const { pushNewsletterSubscriptionToEspIfConfigured } = await import("./esp-newsletter");
    const out = await pushNewsletterSubscriptionToEspIfConfigured("a@b.co");
    expect(out.provider).toBe("mailchimp");
  });

  it("uses ConvertKit when only ConvertKit is configured", async () => {
    process.env.CONVERTKIT_API_SECRET = "secret";
    process.env.CONVERTKIT_FORM_ID = "42";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => "",
    });
    vi.stubGlobal("fetch", fetchMock);

    const { pushNewsletterSubscriptionToEspIfConfigured } = await import("./esp-newsletter");
    const out = await pushNewsletterSubscriptionToEspIfConfigured("x@y.z");

    expect(out).toMatchObject({ provider: "convertkit", ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.convertkit.com/v3/forms/42/subscribe",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ api_key: "secret", email: "x@y.z" }),
      }),
    );
  });

  it("reports Mailchimp failure when API returns error", async () => {
    process.env.MAILCHIMP_API_KEY = "k-us1";
    process.env.MAILCHIMP_LIST_ID = "L";
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ title: "Invalid", detail: "bad" }),
        text: async () => "",
      }),
    );

    const { pushNewsletterSubscriptionToEspIfConfigured } = await import("./esp-newsletter");
    const out = await pushNewsletterSubscriptionToEspIfConfigured("x@y.z");
    expect(out.ok).toBe(false);
    expect(out.detail).toContain("Invalid");
  });
});
