import test from "node:test";
import assert from "node:assert/strict";
import { assertSafeSourceUrl, isBlockedIp } from "../app/lib/source-url-safety.mjs";

test("blocks private, loopback, link-local and reserved literal IPs", () => {
  for (const ip of ["127.0.0.1", "10.0.0.1", "172.16.0.1", "192.168.1.1", "169.254.169.254", "0.0.0.0", "::1", "fc00::1", "fe80::1", "::ffff:127.0.0.1"]) {
    assert.equal(isBlockedIp(ip), true, ip);
  }
  assert.equal(isBlockedIp("8.8.8.8"), false);
  assert.equal(isBlockedIp("2606:4700:4700::1111"), false);
});

test("requires https and rejects hostnames resolving to private addresses", async () => {
  await assert.rejects(() => assertSafeSourceUrl("http://example.com", async () => [{ address: "93.184.216.34" }]));
  await assert.rejects(() => assertSafeSourceUrl("https://localhost", async () => [{ address: "127.0.0.1" }]));
  await assert.rejects(() => assertSafeSourceUrl("https://example.com", async () => [{ address: "93.184.216.34" }, { address: "10.0.0.1" }]));
});

test("accepts https only when every resolved address is public", async () => {
  const url = await assertSafeSourceUrl("https://example.com/path", async () => [
    { address: "93.184.216.34" },
    { address: "2606:2800:220:1:248:1893:25c8:1946" },
  ]);
  assert.equal(url.href, "https://example.com/path");
});
