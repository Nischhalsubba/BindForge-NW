import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export class SourceUrlSafetyError extends Error {
  constructor(message) {
    super(message);
    this.name = "SourceUrlSafetyError";
  }
}

function ipv4Parts(ip) {
  const parts = ip.split(".").map(Number);
  return parts.length === 4 && parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255) ? parts : null;
}

export function isBlockedIp(raw) {
  const ip = String(raw ?? "").trim().toLowerCase().replace(/^\[|\]$/g, "").split("%")[0];
  if (!ip) return true;
  if (ip.startsWith("::ffff:")) return true;

  if (isIP(ip) === 4) {
    const p = ipv4Parts(ip);
    if (!p) return true;
    const [a, b, c] = p;
    return a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0 && (c === 0 || c === 2)) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 198 && b === 51 && c === 100) ||
      (a === 203 && b === 0 && c === 113) ||
      a >= 224;
  }

  if (isIP(ip) === 6) {
    if (ip === "::" || ip === "::1") return true;
    if (/^(fc|fd)/.test(ip)) return true;
    if (/^fe[89ab]/.test(ip)) return true;
    if (/^ff/.test(ip)) return true;
    if (/^2001:db8(?::|$)/.test(ip)) return true;
    return false;
  }

  return true;
}

async function defaultResolver(hostname) {
  return lookup(hostname, { all: true, verbatim: true });
}

export async function assertSafeSourceUrl(raw, resolver = defaultResolver) {
  const url = new URL(String(raw));
  if (url.protocol !== "https:") throw new SourceUrlSafetyError("source URL must use https");
  if (url.username || url.password) throw new SourceUrlSafetyError("source URL credentials are not allowed");

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    throw new SourceUrlSafetyError("local hostnames are not allowed");
  }

  if (isIP(hostname)) {
    if (isBlockedIp(hostname)) throw new SourceUrlSafetyError("private or reserved source address is not allowed");
    return url;
  }

  const addresses = await resolver(hostname);
  if (!Array.isArray(addresses) || addresses.length === 0) throw new SourceUrlSafetyError("source hostname did not resolve");
  if (addresses.some((entry) => !entry?.address || isBlockedIp(entry.address))) {
    throw new SourceUrlSafetyError("source hostname resolves to a private or reserved address");
  }
  return url;
}
