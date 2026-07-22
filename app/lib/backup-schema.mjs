export const BACKUP_VERSION = 2;
export const MAX_BACKUP_BYTES = 256 * 1024;

const LIMITS = {
  savedKeys: 1000,
  keyName: 160,
  keyValue: 120,
  shortText: 160,
  searchText: 500,
  extraText: 2000,
  customMessage: 240,
};

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function fail(error) {
  return { ok: false, error };
}

function readString(value, fallback, label, maxLength) {
  if (value === undefined) return { ok: true, value: fallback };
  if (typeof value !== "string") return fail(`${label} must be text.`);
  if (value.length > maxLength) return fail(`${label} is too long.`);
  return { ok: true, value };
}

function readBoolean(value, fallback, label) {
  if (value === undefined) return { ok: true, value: fallback };
  if (typeof value !== "boolean") return fail(`${label} must be true or false.`);
  return { ok: true, value };
}

function readMode(value, fallback) {
  if (value === undefined) return { ok: true, value: fallback };
  if (value !== "bind" && value !== "unbind") return fail("Output mode must be bind or unbind.");
  return { ok: true, value };
}

function readSavedAt(value, fallback) {
  if (value === undefined || value === "") return { ok: true, value: fallback };
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    return fail("Saved date is invalid.");
  }
  return { ok: true, value };
}

function readKeys(value) {
  if (value === undefined) return { ok: true, value: {} };
  if (!isRecord(value)) return fail("Saved keys must be an object.");

  const entries = Object.entries(value);
  if (entries.length > LIMITS.savedKeys) return fail("Backup contains too many saved keys.");

  const keys = {};
  for (const [id, keyValue] of entries) {
    if (!id || id.length > LIMITS.keyName) return fail("A saved key identifier is invalid.");
    if (typeof keyValue !== "string" || keyValue.length > LIMITS.keyValue) {
      return fail(`Saved key ${id} is invalid.`);
    }
    keys[id] = keyValue;
  }

  return { ok: true, value: keys };
}

export function createDefaultBackup(savedAt = new Date(0).toISOString()) {
  return {
    version: BACKUP_VERSION,
    savedAt,
    keys: {},
    filters: {
      className: "All classes",
      actionType: "All actions",
      difficulty: "All",
      search: "",
      mode: "bind",
    },
    commandLab: {
      key: "",
      extraText: "",
      keySearch: "",
      keyCategory: "All",
      commandSearch: "",
      commandCategory: "All",
      showRisky: false,
    },
    customSay: {
      key: "f1",
      message: "ARTIFACTS NOW",
    },
  };
}

function readFilters(value, defaults) {
  if (value === undefined) return { ok: true, value: { ...defaults } };
  if (!isRecord(value)) return fail("Filters must be an object.");

  const className = readString(value.className, defaults.className, "Class filter", LIMITS.shortText);
  if (!className.ok) return className;
  const actionType = readString(value.actionType, defaults.actionType, "Action filter", LIMITS.shortText);
  if (!actionType.ok) return actionType;
  const difficulty = readString(value.difficulty, defaults.difficulty, "Difficulty filter", LIMITS.shortText);
  if (!difficulty.ok) return difficulty;
  const search = readString(value.search, defaults.search, "Preset search", LIMITS.searchText);
  if (!search.ok) return search;
  const mode = readMode(value.mode, defaults.mode);
  if (!mode.ok) return mode;

  return {
    ok: true,
    value: {
      className: className.value,
      actionType: actionType.value,
      difficulty: difficulty.value,
      search: search.value,
      mode: mode.value,
    },
  };
}

function readCommandLab(value, defaults) {
  if (value === undefined) return { ok: true, value: { ...defaults } };
  if (!isRecord(value)) return fail("Command Lab settings must be an object.");

  const fields = [
    ["key", "Command Lab key", LIMITS.keyValue],
    ["extraText", "Command Lab extra text", LIMITS.extraText],
    ["keySearch", "Key search", LIMITS.searchText],
    ["keyCategory", "Key category", LIMITS.shortText],
    ["commandSearch", "Command search", LIMITS.searchText],
    ["commandCategory", "Command category", LIMITS.shortText],
  ];

  const result = {};
  for (const [field, label, maxLength] of fields) {
    const parsed = readString(value[field], defaults[field], label, maxLength);
    if (!parsed.ok) return parsed;
    result[field] = parsed.value;
  }

  const showRisky = readBoolean(value.showRisky, defaults.showRisky, "Show risky keys");
  if (!showRisky.ok) return showRisky;
  result.showRisky = showRisky.value;

  return { ok: true, value: result };
}

function readCustomSay(value, defaults) {
  if (value === undefined) return { ok: true, value: { ...defaults } };
  if (!isRecord(value)) return fail("Custom say settings must be an object.");

  const key = readString(value.key, defaults.key, "Custom say key", LIMITS.keyValue);
  if (!key.ok) return key;
  const message = readString(value.message, defaults.message, "Custom say message", LIMITS.customMessage);
  if (!message.ok) return message;

  return { ok: true, value: { key: key.value, message: message.value } };
}

export function parseBackupValue(input, options = {}) {
  if (!isRecord(input)) return fail("Backup must contain a JSON object.");

  const version = input.version;
  if (version !== 1 && version !== BACKUP_VERSION) {
    return fail("Unsupported BindForge backup version.");
  }

  const now = options.now ?? new Date().toISOString();
  const defaults = createDefaultBackup(new Date(0).toISOString());
  const savedAt = readSavedAt(input.savedAt, now);
  if (!savedAt.ok) return savedAt;
  const keys = readKeys(input.keys);
  if (!keys.ok) return keys;
  const filters = readFilters(input.filters, defaults.filters);
  if (!filters.ok) return filters;
  const commandLab = readCommandLab(input.commandLab, defaults.commandLab);
  if (!commandLab.ok) return commandLab;
  const customSay = readCustomSay(version === 1 ? undefined : input.customSay, defaults.customSay);
  if (!customSay.ok) return customSay;

  return {
    ok: true,
    value: {
      version: BACKUP_VERSION,
      savedAt: savedAt.value,
      keys: keys.value,
      filters: filters.value,
      commandLab: commandLab.value,
      customSay: customSay.value,
    },
    migratedFrom: version === 1 ? 1 : null,
  };
}

export function parseBackupJson(text, options = {}) {
  if (typeof text !== "string") return fail("Backup content must be text.");
  const byteLength = new TextEncoder().encode(text).byteLength;
  if (byteLength > MAX_BACKUP_BYTES) return fail("Backup file is larger than 256 KB.");

  try {
    return parseBackupValue(JSON.parse(text), options);
  } catch {
    return fail("Backup is not valid JSON.");
  }
}
