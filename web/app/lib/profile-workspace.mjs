export const PROFILE_WORKSPACE_VERSION = 1;

const DEFAULT_CHARACTER_ID = "character-default";
const DEFAULT_PROFILE_ID = "profile-default";

/**
 * @typedef {object} PersonalBind
 * @property {"bind"} mode
 * @property {string} key
 * @property {string} command
 * @property {string} raw
 * @property {number} lineNumber
 */

/**
 * @typedef {object} KeymapProfile
 * @property {string} id
 * @property {string} name
 * @property {Record<string, string>} keyValues
 * @property {PersonalBind[]} personalBinds
 * @property {string} personalSourceName
 * @property {string} personalImportedAt
 * @property {string} updatedAt
 */

/**
 * @typedef {object} CharacterProfile
 * @property {string} id
 * @property {string} name
 * @property {string} className
 * @property {string} role
 * @property {string} paragon
 * @property {KeymapProfile[]} profiles
 */

/**
 * @typedef {object} ProfileWorkspace
 * @property {number} version
 * @property {string} activeCharacterId
 * @property {string} activeProfileId
 * @property {CharacterProfile[]} characters
 */

/** @typedef {{ ok: true, value: ProfileWorkspace } | { ok: false, error: string }} ProfileWorkspaceParseResult */

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function clonePersonalBind(entry) {
  return {
    mode: "bind",
    key: asString(entry?.key),
    command: asString(entry?.command),
    raw: asString(entry?.raw),
    lineNumber: Number.isFinite(entry?.lineNumber) ? entry.lineNumber : 0,
  };
}

function sanitizePersonalBinds(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.key !== "string" || typeof entry.command !== "string") return [];
    return [clonePersonalBind(entry)];
  });
}

function sanitizeKeyValues(value) {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([key, mapped]) => key && typeof mapped === "string"),
  );
}

function hasUniqueIds(values) {
  const ids = values.map((value) => value.id);
  return new Set(ids).size === ids.length;
}

function sanitizeProfile(value) {
  if (!isRecord(value)) return null;
  const id = asString(value.id).trim();
  const name = asString(value.name).trim();
  if (!id || !name) return null;
  return {
    id,
    name,
    keyValues: sanitizeKeyValues(value.keyValues),
    personalBinds: sanitizePersonalBinds(value.personalBinds),
    personalSourceName: asString(value.personalSourceName),
    personalImportedAt: asString(value.personalImportedAt),
    updatedAt: asString(value.updatedAt),
  };
}

function sanitizeCharacter(value) {
  if (!isRecord(value)) return null;
  const id = asString(value.id).trim();
  const name = asString(value.name).trim();
  if (!id || !name || !Array.isArray(value.profiles)) return null;
  const profiles = value.profiles.map(sanitizeProfile).filter(Boolean);
  if (!profiles.length || !hasUniqueIds(profiles)) return null;
  return {
    id,
    name,
    className: asString(value.className, "Unassigned"),
    role: asString(value.role, "DPS"),
    paragon: asString(value.paragon),
    profiles,
  };
}

/**
 * @param {{
 *   keyValues?: Record<string, string>,
 *   personalBinds?: PersonalBind[],
 *   personalSourceName?: string,
 *   personalImportedAt?: string
 * }} [options]
 * @returns {ProfileWorkspace}
 */
export function createDefaultProfileWorkspace({
  keyValues = {},
  personalBinds = [],
  personalSourceName = "",
  personalImportedAt = "",
} = {}) {
  return {
    version: PROFILE_WORKSPACE_VERSION,
    activeCharacterId: DEFAULT_CHARACTER_ID,
    activeProfileId: DEFAULT_PROFILE_ID,
    characters: [{
      id: DEFAULT_CHARACTER_ID,
      name: "My Character",
      className: "Unassigned",
      role: "DPS",
      paragon: "",
      profiles: [{
        id: DEFAULT_PROFILE_ID,
        name: "Default",
        keyValues: sanitizeKeyValues(keyValues),
        personalBinds: sanitizePersonalBinds(personalBinds),
        personalSourceName: asString(personalSourceName),
        personalImportedAt: asString(personalImportedAt),
        updatedAt: "",
      }],
    }],
  };
}

/** @param {ProfileWorkspace | null | undefined} workspace */
export function getActiveCharacter(workspace) {
  return workspace?.characters?.find((character) => character.id === workspace.activeCharacterId) ?? null;
}

/** @param {ProfileWorkspace | null | undefined} workspace */
export function getActiveProfile(workspace) {
  const character = getActiveCharacter(workspace);
  return character?.profiles?.find((profile) => profile.id === workspace.activeProfileId) ?? null;
}

/**
 * @param {KeymapProfile} profile
 * @param {{ id: string, name: string }} identity
 * @returns {KeymapProfile}
 */
export function cloneProfile(profile, { id, name }) {
  return {
    id,
    name,
    keyValues: { ...profile.keyValues },
    personalBinds: profile.personalBinds.map(clonePersonalBind),
    personalSourceName: profile.personalSourceName,
    personalImportedAt: profile.personalImportedAt,
    updatedAt: profile.updatedAt ?? "",
  };
}

/**
 * @param {unknown} value
 * @returns {ProfileWorkspaceParseResult}
 */
export function parseProfileWorkspaceValue(value) {
  if (!isRecord(value) || value.version !== PROFILE_WORKSPACE_VERSION) {
    return { ok: false, error: "Unsupported My Setup backup version." };
  }
  if (!Array.isArray(value.characters) || !value.characters.length) {
    return { ok: false, error: "My Setup backup does not contain any characters." };
  }
  const characters = value.characters.map(sanitizeCharacter).filter(Boolean);
  if (characters.length !== value.characters.length) {
    return { ok: false, error: "My Setup backup contains invalid character or profile data." };
  }
  if (!hasUniqueIds(characters)) {
    return { ok: false, error: "My Setup backup contains duplicate character IDs." };
  }
  const workspace = {
    version: PROFILE_WORKSPACE_VERSION,
    activeCharacterId: asString(value.activeCharacterId),
    activeProfileId: asString(value.activeProfileId),
    characters,
  };
  if (!getActiveCharacter(workspace)) {
    return { ok: false, error: "My Setup backup references a missing active character." };
  }
  if (!getActiveProfile(workspace)) {
    return { ok: false, error: "My Setup backup references a missing active profile." };
  }
  return { ok: true, value: workspace };
}

/**
 * @param {string} text
 * @returns {ProfileWorkspaceParseResult}
 */
export function parseProfileWorkspaceJson(text) {
  try {
    return parseProfileWorkspaceValue(JSON.parse(text));
  } catch {
    return { ok: false, error: "My Setup backup is not valid JSON." };
  }
}
