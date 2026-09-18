import { latestVerificationForPreset } from "./verification-history.mjs";

const TRUST_LEVELS = {
  verified: {
    label: "Verified",
    tone: "verified",
    description: "BindForge marks this preset verified from documented or direct evidence. Recheck after major game updates.",
  },
  "community-tested": {
    label: "Community tested",
    tone: "community",
    description: "Community evidence reports this preset working. Test it on your character before relying on it.",
  },
  experimental: {
    label: "Experimental",
    tone: "experimental",
    description: "This preset is experimental or user-submitted. Test carefully and keep a rollback command available.",
  },
};

const SOURCE_LABELS = {
  official: "Official source",
  wiki: "Wiki source",
  community: "Community source",
  "user-submitted": "User submitted",
};

export function presetTrustInfo(preset) {
  const confidence = preset?.confidence && TRUST_LEVELS[preset.confidence]
    ? preset.confidence
    : preset?.difficulty === "Risky"
      ? "experimental"
      : "community-tested";
  const trust = TRUST_LEVELS[confidence];
  const sourceLabel = SOURCE_LABELS[preset?.sourceType] ?? "Community source";
  const latestVerification = latestVerificationForPreset(preset);
  const checkedLabel = latestVerification?.date ? `Checked ${latestVerification.date}` : "Verification date pending";
  const versionLabel = latestVerification?.gameVersion
    ? String(latestVerification.gameVersion)
    : preset?.gameVersion
      ? String(preset.gameVersion)
      : "Game version not recorded";

  return {
    confidence,
    label: trust.label,
    tone: trust.tone,
    description: trust.description,
    sourceLabel,
    checkedLabel,
    versionLabel,
    verificationResult: latestVerification?.result ?? null,
  };
}

export function trustNeedsCaution(preset) {
  return presetTrustInfo(preset).confidence !== "verified";
}
