import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");

test("Next.js declares the same browser protections as Netlify", async () => {
  const [nextConfig, netlify] = await Promise.all([
    readFile(path.join(root, "next.config.ts"), "utf8"),
    readFile(path.resolve(root, "..", "netlify.toml"), "utf8"),
  ]);

  for (const header of [
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
  ]) {
    assert.ok(nextConfig.includes(header), `Next.js missing ${header}`);
    assert.ok(netlify.includes(header), `Netlify missing ${header}`);
  }
  assert.match(nextConfig, /source: "\/:path\*"/);
  assert.match(nextConfig, /poweredByHeader: false/);
});

test("security.txt provides a valid, unexpired disclosure contact", async () => {
  const securityTxt = await readFile(
    path.join(root, "public", ".well-known", "security.txt"),
    "utf8",
  );
  const fields = Object.fromEntries(
    securityTxt
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf(":");
        assert.ok(separator > 0, `Invalid security.txt field: ${line}`);
        return [line.slice(0, separator), line.slice(separator + 1).trim()];
      }),
  );
  assert.match(fields.Contact, /^mailto:[^@\s]+@[^@\s]+$/);
  assert.equal(
    fields.Canonical,
    "https://neverwinterkeybind.netlify.app/.well-known/security.txt",
  );
  assert.ok(Date.parse(fields.Expires) > Date.now(), "security.txt is expired");
});
