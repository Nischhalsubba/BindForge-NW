function norm(value) { return String(value ?? "").trim().toLowerCase().replace(/\s+/g, ""); }
function command(value) { return String(value ?? "").replace(/\s+/g, " ").trim(); }
function bindMap(rows = []) { return new Map(rows.map((entry) => [norm(entry?.key), entry]).filter(([key]) => key)); }

export function recommendUnusedKeys({ hasImportedEvidence = false, personalBinds = [], currentAssignments = [], candidates = [], limit = 6 } = {}) {
  if (!hasImportedEvidence) return [];
  const occupied = new Set([
    ...personalBinds.map((entry) => norm(entry?.key)),
    ...currentAssignments.map((entry) => norm(entry?.key)),
  ].filter(Boolean));
  const seen = new Set();
  return candidates.flatMap((candidate) => {
    const key = norm(candidate);
    if (!key || occupied.has(key) || seen.has(key)) return [];
    seen.add(key);
    return [key];
  }).slice(0, Math.max(0, limit));
}

export function buildChangePreview({ presetId = "", title = "", currentKey = "", proposedKey = "", proposedCommand = "", personalBinds = [], currentAssignments = [] } = {}) {
  const current = norm(currentKey);
  const proposed = norm(proposedKey);
  const imported = bindMap(personalBinds);
  const overwritten = imported.get(proposed) ?? null;
  const conflicts = currentAssignments
    .filter((entry) => entry?.presetId !== presetId && norm(entry?.key) === proposed)
    .map((entry) => ({
      presetId: String(entry.presetId ?? ""),
      title: String(entry.title ?? entry.presetId ?? "Other assignment"),
      command: command(entry.command),
    }));
  const previous = imported.get(current) ?? null;
  return {
    presetId,
    title,
    currentKey: current,
    proposedKey: proposed,
    proposedCommand: command(proposedCommand),
    overwrittenImportedCommand: overwritten?.command ? command(overwritten.command) : null,
    currentImportedCommand: previous?.command ? command(previous.command) : null,
    conflicts,
    rollback: overwritten?.command
      ? { key: proposed, command: command(overwritten.command), source: "imported" }
      : { key: proposed, command: null, source: "none" },
  };
}

export function compareProfiles(left = {}, right = {}) {
  const leftKeys = left.keyValues ?? {};
  const rightKeys = right.keyValues ?? {};
  const ids = [...new Set([...Object.keys(leftKeys), ...Object.keys(rightKeys)])].sort();
  const keyChanges = ids.flatMap((presetId) => {
    const leftKey = norm(leftKeys[presetId]);
    const rightKey = norm(rightKeys[presetId]);
    return leftKey === rightKey ? [] : [{ presetId, left: leftKey, right: rightKey }];
  });

  const leftBinds = bindMap(left.personalBinds ?? []);
  const rightBinds = bindMap(right.personalBinds ?? []);
  const combos = [...new Set([...leftBinds.keys(), ...rightBinds.keys()])].sort();
  const importedChanges = combos.flatMap((key) => {
    const leftCommand = command(leftBinds.get(key)?.command);
    const rightCommand = command(rightBinds.get(key)?.command);
    return leftCommand === rightCommand ? [] : [{ key, left: leftCommand || null, right: rightCommand || null }];
  });

  return {
    left: { id: left.id ?? "", name: left.name ?? "" },
    right: { id: right.id ?? "", name: right.name ?? "" },
    keyChanges,
    importedChanges,
    changeCount: keyChanges.length + importedChanges.length,
  };
}

export function analyzeRawKeymap(value = "") {
  const entries = [];
  const ignored = [];
  String(value ?? "").replace(/^\uFEFF/, "").split(/\r?\n/).forEach((rawLine, index) => {
    const raw = rawLine.trim();
    if (!raw || raw.startsWith("#") || raw.startsWith("//") || raw.startsWith(";")) return;
    const match = raw.match(/^\/?(bind|unbind)\s+(\S+)(?:\s+([\s\S]*))?$/i);
    if (!match) {
      ignored.push({ lineNumber: index + 1, raw: rawLine });
      return;
    }
    const mode = match[1].toLowerCase();
    const key = norm(match[2]);
    const commandText = command(match[3]);
    if (!key || (mode === "bind" && !commandText)) {
      ignored.push({ lineNumber: index + 1, raw: rawLine });
      return;
    }
    entries.push({ mode, key, command: commandText, raw: rawLine, lineNumber: index + 1 });
  });

  const active = new Map();
  const overwrites = [];
  const orphanUnbinds = [];
  for (const entry of entries) {
    if (entry.mode === "unbind") {
      if (!active.has(entry.key)) orphanUnbinds.push(entry);
      active.delete(entry.key);
      continue;
    }
    if (active.has(entry.key)) overwrites.push({ key: entry.key, previous: active.get(entry.key), next: entry });
    active.set(entry.key, { ...entry, mode: "bind" });
  }

  return {
    entries,
    activeBinds: [...active.values()],
    overwrites,
    orphanUnbinds,
    ignored,
    hasBlockingErrors: entries.length === 0 && ignored.length > 0,
  };
}
