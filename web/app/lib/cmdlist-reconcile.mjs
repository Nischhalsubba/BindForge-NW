function normalizeCommandName(value) {
  return String(value ?? "").trim().replace(/^\/+/, "").toLowerCase();
}

function commandFromLine(rawLine) {
  const line = String(rawLine ?? "").trim();
  if (!line) return null;

  const slashMatch = line.match(/(?:^|\s)\/([A-Za-z][A-Za-z0-9_]*)\b/);
  if (slashMatch) return normalizeCommandName(slashMatch[1]);

  const first = line.split(/\s+/, 1)[0];
  if (/^[A-Za-z][A-Za-z0-9_]*$/.test(first) && /\s/.test(line)) return normalizeCommandName(first);
  return null;
}

export function parseCmdlist(value) {
  const commands = [];
  const seen = new Set();
  const ignored = [];

  String(value ?? "").replace(/^\uFEFF/, "").split(/\r?\n/).forEach((rawLine, index) => {
    const command = commandFromLine(rawLine);
    if (!command) {
      if (String(rawLine ?? "").trim()) ignored.push({ lineNumber: index + 1, raw: rawLine });
      return;
    }
    if (!seen.has(command)) {
      seen.add(command);
      commands.push(command);
    }
  });

  return { commands, ignored };
}

function catalogNames(catalogCommands) {
  const names = new Set();
  for (const record of Array.isArray(catalogCommands) ? catalogCommands : []) {
    if (typeof record === "string") {
      const normalized = normalizeCommandName(record);
      if (normalized) names.add(normalized);
      continue;
    }
    for (const candidate of [record?.command, record?.bindCommand]) {
      const normalized = normalizeCommandName(candidate);
      if (normalized) names.add(normalized);
    }
  }
  return [...names].sort();
}

export function reconcileCmdlist(value, catalogCommands = []) {
  const parsed = parseCmdlist(value);
  const pasted = new Set(parsed.commands);
  const catalog = catalogNames(catalogCommands);
  const catalogSet = new Set(catalog);

  return {
    pastedCount: parsed.commands.length,
    catalogCount: catalog.length,
    matched: parsed.commands.filter((command) => catalogSet.has(command)).sort(),
    missingFromBindForge: parsed.commands.filter((command) => !catalogSet.has(command)).sort(),
    notSeenInPastedList: catalog.filter((command) => !pasted.has(command)),
    ignored: parsed.ignored,
  };
}
