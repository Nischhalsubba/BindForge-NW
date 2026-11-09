"use client";
import { useEffect, useState } from "react";
import { getCloudClient } from "../lib/supabase-client";
import { emailAuth } from "../lib/email-auth.mjs";
export function EmailAccountAccess({
  enabled,
  onAuthenticated,
  onStatus,
  recoveryOnly = false,
}: {
  enabled: boolean;
  recoveryOnly?: boolean;
  onAuthenticated: () => Promise<void>;
  onStatus: (message: string) => void;
}) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [mode, setMode] = useState<"signin" | "signup" | "reset">("signin"),
    [busy, setBusy] = useState(false),
    [recovery, setRecovery] = useState(false);
  useEffect(() => {
    const client = getCloudClient();
    const sub = client?.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    const params = new URLSearchParams(location.search);
    if (params.get("recovery") === "1") queueMicrotask(() => setRecovery(true));
    return () => sub?.data.subscription.unsubscribe();
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (recovery) {
        if (
          password.length < 8 ||
          new TextEncoder().encode(password).length > 72
        )
          throw Error("Use at least 8 characters and no more than 72 bytes.");
        const client = getCloudClient();
        if (!client) throw Error("Account connection is unavailable.");
        const verified = await client.auth.getUser();
        if (!verified.data.user)
          throw Error(
            "Open a valid password-reset link from your email first.",
          );
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        setPassword("");
        setRecovery(false);
        history.replaceState(null, "", "/account");
        onStatus("Password updated. You can now save your workspace.");
        await onAuthenticated();
      } else {
        const data = await emailAuth(getCloudClient(), {
          action: mode,
          email,
          password,
          redirectTo: new URL(
            mode === "reset" ? "/account?recovery=1" : "/account",
            location.origin,
          ).toString(),
        });
        setPassword("");
        if (mode === "signup" && !data?.session)
          onStatus(
            "If this address is eligible, check your email to confirm the account. Confirmation delivery must be configured by the site owner.",
          );
        else if (mode === "reset")
          onStatus(
            "If an account exists, a reset link will be sent. Check your email.",
          );
        else await onAuthenticated();
      }
    } catch (error) {
      onStatus(
        error instanceof Error
          ? error.message
          : "Account request could not be completed. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (recoveryOnly && !recovery) return null;
  return (
    <section aria-labelledby="email-accounts-title">
      <h2 id="email-accounts-title">
        {recovery
          ? "Set a new password"
          : mode === "signup"
            ? "Create an email account"
            : mode === "reset"
              ? "Reset your password"
              : "Sign in with email"}
      </h2>
      <p>
        Save approved keybind workspaces across devices without a Google
        account. Guest copying always stays available.
      </p>
      <form onSubmit={(event) => void submit(event)}>
        {!recovery ? (
          <>
            <label htmlFor="email-account-address">Email address</label>
            <input
              id="email-account-address"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </>
        ) : null}
        {mode !== "reset" || recovery ? (
          <>
            <label htmlFor="email-account-password">
              {recovery ? "New password" : "Password"}
            </label>
            <input
              id="email-account-password"
              type="password"
              autoComplete={
                mode === "signup" || recovery
                  ? "new-password"
                  : "current-password"
              }
              required
              minLength={mode === "signup" || recovery ? 8 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </>
        ) : null}
        <div className="buttonrow">
          <button
            className="btn primary"
            disabled={busy || !enabled}
            type="submit"
          >
            {busy
              ? "Working…"
              : recovery
                ? "Save new password"
                : mode === "signup"
                  ? "Create account"
                  : mode === "reset"
                    ? "Send reset link"
                    : "Sign in with email"}
          </button>
        </div>
      </form>
      {!recovery ? (
        <div className="buttonrow">
          <button
            className="btn"
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setPassword("");
            }}
          >
            {mode === "signup"
              ? "I already have an account"
              : "Create an account"}
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setMode(mode === "reset" ? "signin" : "reset");
              setPassword("");
            }}
          >
            {mode === "reset" ? "Back to sign in" : "Forgot password?"}
          </button>
        </div>
      ) : null}
      {!enabled ? (
        <p className="hint">
          Email sign-in is unavailable or still being checked. Guest tools
          remain available.
        </p>
      ) : null}
    </section>
  );
}
