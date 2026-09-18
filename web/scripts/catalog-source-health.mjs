// Scheduled source health report. Network failures are evidence to review, not automatic proof that a source is invalid.
import { readdir, writeFile } from "node:fs/promises";
import { assertSafeSourceUrl, SourceUrlSafetyError } from "../app/lib/source-url-safety.mjs";

const sectionsDirectory = new URL("../app/data/keybindPresetSections/", import.meta.url);
const outputPath = new URL("../catalog-source-health.json", import.meta.url);
const files = (await readdir(sectionsDirectory)).filter((name) => name.endsWith(".ts")).sort();
const presets = [];

for (const file of files) {
  const sectionModule = await import(new URL(file, sectionsDirectory));
  const exportedArrays = Object.values(sectionModule).filter(Array.isArray);
  if (exportedArrays.length !== 1) continue;
  presets.push(...exportedArrays[0]);
}

const consoleCommandSource = "https://neverwinter.fandom.com/wiki/Console_command";
const hotkeySource = "https://neverwinter.fandom.com/wiki/Hotkeys";

function inferredUrl(preset) {
  if (preset.sourceUrl) return preset.sourceUrl;
  const evidence = `${preset.plainEnglish ?? ""} ${preset.notes ?? ""}`.toLowerCase();
  if (evidence.includes("wiki supplied") || evidence.includes("wiki-supplied")) {
    return preset.type === "Camera / Screenshot" || preset.type === "Utility" ? hotkeySource : consoleCommandSource;
  }
  return null;
}

function classify(status) {
  if (status >= 200 && status < 400) return "healthy";
  if ([401, 403, 429].includes(status)) return "blocked-or-rate-limited";
  if ([404, 410].includes(status)) return "missing";
  if (status >= 500) return "source-error";
  return "review";
}

async function safeRequest(rawUrl, method, signal) {
  let current = await assertSafeSourceUrl(rawUrl);
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    const response = await fetch(current, {
      method,
      redirect: "manual",
      signal,
      headers: {
        "user-agent": "BindForge-NW-catalog-health/1.0",
        ...(method === "GET" ? { range: "bytes=0-0" } : {}),
      },
    });
    if (response.status < 300 || response.status >= 400) {
      return { response, finalUrl: current.href, redirects };
    }
    const location = response.headers.get("location");
    await response.body?.cancel();
    if (!location) return { response, finalUrl: current.href, redirects };
    current = await assertSafeSourceUrl(new URL(location, current).href);
  }
  throw new SourceUrlSafetyError("too many source redirects");
}

async function inspect(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    // Every redirect hop is separately URL/DNS validated and the same timeout aborts the actual fetch.
    let result = await safeRequest(url, "HEAD", controller.signal);
    if (result.response.status === 405) {
      await result.response.body?.cancel();
      result = await safeRequest(url, "GET", controller.signal);
    }
    await result.response.body?.cancel();
    return {
      url,
      finalUrl: result.finalUrl,
      status: result.response.status,
      classification: classify(result.response.status),
      redirected: result.redirects > 0,
      redirectCount: result.redirects,
    };
  } catch (error) {
    return {
      url,
      finalUrl: url,
      status: null,
      classification: error instanceof SourceUrlSafetyError
        ? "unsafe-url"
        : error?.name === "AbortError"
          ? "timeout"
          : "network-error",
      redirected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

const urls = [...new Set(presets.map(inferredUrl).filter((url) => /^https?:\/\//i.test(url)))].sort();
const sources = [];
for (const url of urls) sources.push(await inspect(url));

const report = {
  generatedAt: new Date().toISOString(),
  sourceCount: sources.length,
  summary: sources.reduce((counts, item) => {
    counts[item.classification] = (counts[item.classification] ?? 0) + 1;
    return counts;
  }, {}),
  sources,
  note: "Blocked/rate-limited/network results require human review and do not automatically invalidate a catalogue source. Unsafe private/reserved targets and redirect hops are never fetched.",
};

await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
