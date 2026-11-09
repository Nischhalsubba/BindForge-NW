import test from "node:test";
import assert from "node:assert/strict";
import { emailAuth } from "../app/lib/email-auth.mjs";
test("email login and signup use Supabase auth without storing a password", async () => {
  let calls = [];
  const client = {
    auth: {
      signInWithPassword: async (value) => {
        calls.push(["signin", value]);
        return { data: { session: {} } };
      },
      signUp: async (value) => {
        calls.push(["signup", value]);
        return { data: { session: null } };
      },
    },
  };
  await emailAuth(client, {
    action: "signin",
    email: "a@example.com",
    password: "test-password",
    redirectTo: "https://example.com/account",
  });
  const signup = await emailAuth(client, {
    action: "signup",
    email: "a@example.com",
    password: "test-password",
    redirectTo: "https://example.com/account",
  });
  assert.equal(calls[0][0], "signin");
  assert.equal(
    calls[1][1].options.emailRedirectTo,
    "https://example.com/account",
  );
  assert.equal(signup.session, null);
});
test("invalid addresses, weak signup passwords and provider failures are actionable", async () => {
  await assert.rejects(() =>
    emailAuth(null, { action: "signin", email: "a@example.com" }),
  );
  await assert.rejects(() =>
    emailAuth(
      {},
      { action: "signup", email: "bad", password: "strongpassword" },
    ),
  );
  await assert.rejects(() =>
    emailAuth(
      {},
      { action: "signup", email: "a@example.com", password: "short" },
    ),
  );
  await assert.rejects(
    () =>
      emailAuth(
        {
          auth: {
            signInWithPassword: async () => ({
              error: Error("Invalid login credentials"),
            }),
          },
        },
        { action: "signin", email: "a@example.com", password: "wrong" },
      ),
    /Invalid login/,
  );
});
