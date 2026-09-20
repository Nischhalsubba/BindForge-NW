import type { Metadata } from "next";
import packageInfo from "../package.json";
import { BindForgeProvider } from "./BindForgeProvider";
import "./data/catalogIntegrity";
import "./app.css";

const productionUrl = new URL("https://neverwinterkeybind.netlify.app");
const socialImageUrl = new URL("/opengraph-image?v=20260728-neverwinter-keybind", productionUrl).toString();
const socialTitle = "Neverwinter Keybind | Keybind Builder";
const socialDescription =
  "Search presets, choose safer key combinations, and generate copy-ready Neverwinter bind or unbind commands.";

export const metadata: Metadata = {
  metadataBase: productionUrl,
  alternates: { canonical: productionUrl.toString() },
  title: { default: socialTitle, template: "%s | Neverwinter Keybind" },
  description: socialDescription,
  applicationName: "Neverwinter Keybind",
  keywords: [
    "Neverwinter keybind builder",
    "Neverwinter bind commands",
    "Neverwinter console commands",
    "Neverwinter Bard song binds",
    "Neverwinter command generator",
  ],
  authors: [{ name: "Archew" }],
  creator: "Archew",
  publisher: "Archew",
  category: "gaming tools",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: productionUrl.toString(),
    siteName: "Neverwinter Keybind",
    title: socialTitle,
    description: socialDescription,
    images: [{
      url: socialImageUrl,
      secureUrl: socialImageUrl,
      width: 1200,
      height: 630,
      type: "image/png",
      alt: "Neverwinter Keybind builder showing a generated command preview",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: socialDescription,
    images: [{ url: socialImageUrl, alt: "Neverwinter Keybind builder preview" }],
  },
  other: {
    "og:image": socialImageUrl,
    "og:image:secure_url": socialImageUrl,
    "og:image:type": "image/png",
    "og:image:width": "1200",
    "og:image:height": "630",
    "twitter:image": socialImageUrl,
  },
  icons: {
    icon: [{ url: "/neverwinter-keybind-logo.svg", type: "image/svg+xml" }],
    shortcut: "/neverwinter-keybind-logo.svg",
    apple: "/neverwinter-keybind-logo.svg",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Neverwinter Keybind",
  url: `${productionUrl}/`,
  applicationCategory: "GameApplication",
  applicationSubCategory: "Neverwinter keybind builder and console command generator",
  operatingSystem: "Any operating system with a modern web browser",
  description: "A browser-based Neverwinter keybind builder for searching presets, console commands, and key combinations and generating copy-ready bind and unbind commands.",
  softwareVersion: packageInfo.version,
  isAccessibleForFree: true,
  author: { "@type": "Organization", name: "Archew" },
  creator: { "@type": "Organization", name: "Archew" },
  publisher: { "@type": "Organization", name: "Archew" },
  featureList: [
    "Neverwinter keybind preset library",
    "Editable key-combination previews",
    "Bulk bind and unbind packs",
    "Favourites and named local collections",
    "Shareable library views",
    "Conflict replacement guidance",
    "Preset provenance and confidence filters",
    "Custom say-message keybind generator",
    "Automatic browser-local settings backup",
    "JSON backup export and import",
    "Neverwinter console command search",
    "Custom bind and unbind command generation",
    "Class, action, and difficulty filtering",
    "Reserved and risky key warnings",
    "Keyboard-accessible responsive interface",
  ],
};

const appearanceBootstrap = `
(() => {
  const SETTINGS_KEY = "bindforge-nw:settings:v2";
  const LEGACY_SETTINGS_KEY = "bindforge-nw:settings:v1";
  const THEME_KEY = "bindforge-nw:theme";
  const APPEARANCE_REVISION_KEY = "bindforge-nw:appearance-revision";
  const APPEARANCE_REVISION = "field-manual-paper-2026-09";
  const freshPreferences = {
    experience: "simple",
    theme: "light",
    textSize: "default",
    density: "standard",
    contrast: "standard",
    largeControls: false,
    reducedMotion: false,
    explainTerms: true,
    confirmRisky: true,
    showRawCommands: false,
  };
  const legacyPreferences = {
    ...freshPreferences,
    experience: "standard",
    explainTerms: false,
    showRawCommands: true,
  };
  const validTheme = (value) => value === "light" || value === "dark" || value === "system" ? value : "light";
  let preferences = { ...freshPreferences };

  try {
    const currentRaw = window.localStorage.getItem(SETTINGS_KEY);
    const legacyRaw = currentRaw ? null : window.localStorage.getItem(LEGACY_SETTINGS_KEY);
    const raw = currentRaw || legacyRaw;
    const stored = raw ? JSON.parse(raw) : null;
    const isStoredObject = Boolean(stored) && typeof stored === "object" && !Array.isArray(stored);
    const isV3 = isStoredObject && stored.version === 3;

    if (isV3 && stored.preferences && typeof stored.preferences === "object" && !Array.isArray(stored.preferences)) {
      preferences = { ...freshPreferences, ...stored.preferences, theme: validTheme(stored.preferences.theme) };
    } else if (isStoredObject && (stored.version === 1 || stored.version === 2)) {
      preferences = { ...legacyPreferences, theme: validTheme(window.localStorage.getItem(THEME_KEY)) };
    }

    if (window.localStorage.getItem(APPEARANCE_REVISION_KEY) !== APPEARANCE_REVISION) {
      // Visual revisions must never overwrite an explicit accessibility or appearance choice.
      // Persist only the migration marker; the stored light/dark/system preference remains authoritative.
      window.localStorage.setItem(APPEARANCE_REVISION_KEY, APPEARANCE_REVISION);
    }
  } catch {
    preferences = { ...freshPreferences };
  }

  const choice = validTheme(preferences.theme);
  const resolved = choice === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : choice;
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.dataset.themeChoice = choice;
  root.dataset.experience = preferences.experience;
  root.dataset.textSize = preferences.textSize;
  root.dataset.density = preferences.density;
  root.dataset.contrast = preferences.contrast;
  root.dataset.largeControls = preferences.largeControls ? "true" : "false";
  root.dataset.motion = preferences.reducedMotion ? "reduced" : "system";
  root.dataset.explainTerms = preferences.explainTerms ? "true" : "false";
  root.dataset.confirmRisky = preferences.confirmRisky ? "true" : "false";
  root.dataset.showRawCommands = preferences.showRawCommands ? "true" : "false";
  root.dataset.appearanceReady = "true";
  root.style.colorScheme = resolved;
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script id="bindforge-appearance-bootstrap" dangerouslySetInnerHTML={{ __html: appearanceBootstrap }} />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />
        <BindForgeProvider>{children}</BindForgeProvider>
      </body>
    </html>
  );
}
