const target = new URL(process.argv[2] ?? "https://neverwinterkeybind.netlify.app");
const base = target.toString().replace(/\/$/, "");
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function get(path) {
  return fetch(new URL(path, `${base}/`), { redirect: "follow", headers: { "user-agent": "BindForge-Release-Verifier/1.0" } });
}

const home = await get("/");
const html = await home.text();
check(home.ok, `Homepage returned ${home.status}`);
check(home.headers.get("content-type")?.includes("text/html"), "Homepage is not HTML");
check(home.headers.get("x-content-type-options") === "nosniff", "Missing X-Content-Type-Options: nosniff");
check(home.headers.get("x-frame-options") === "DENY", "Missing X-Frame-Options: DENY");
check(home.headers.get("referrer-policy") === "strict-origin-when-cross-origin", "Missing Referrer-Policy");
check(Boolean(home.headers.get("permissions-policy")), "Missing Permissions-Policy");

const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1]
  ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1];
const ogUrl = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)/i)?.[1];
const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1];
check(canonical?.replace(/\/$/, "") === base, `Canonical mismatch: ${canonical ?? "missing"}`);
check(ogUrl?.replace(/\/$/, "") === base, `Open Graph URL mismatch: ${ogUrl ?? "missing"}`);
check(Boolean(ogImage?.startsWith("https://")), "Open Graph image is missing or not absolute HTTPS");
check(!/<link[^>]+rel=["']manifest["']/i.test(html), "Retired web manifest is still linked");

if (ogImage) {
  const image = await fetch(ogImage, { redirect: "follow" });
  check(image.ok, `Open Graph image returned ${image.status}`);
  check(image.headers.get("content-type")?.includes("image/png"), "Open Graph image is not PNG");
}

const robots = await get("/robots.txt");
const robotsText = await robots.text();
check(robots.ok, `robots.txt returned ${robots.status}`);
check(robotsText.includes(`Sitemap: ${base}/sitemap.xml`), "robots.txt sitemap URL mismatch");

const sitemap = await get("/sitemap.xml");
const sitemapText = await sitemap.text();
check(sitemap.ok, `sitemap.xml returned ${sitemap.status}`);
check(sitemapText.includes(`<loc>${base}/</loc>`), "sitemap.xml canonical URL mismatch");

const worker = await get("/sw.js");
check(worker.status === 404, `Retired /sw.js returned ${worker.status}, expected 404`);

if (failures.length) {
  console.error("Production verification failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log(`Production verification passed for ${base}`);
