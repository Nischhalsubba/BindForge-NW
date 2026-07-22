const PRESET_DIFFICULTIES = new Set(["Easy", "Advanced", "Risky"]);
const COMBO_STATUSES = new Set(["core", "candidate", "avoid"]);
const MODIFIERS = new Set(["ctrl", "alt", "shift"]);

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function duplicateValues(items, select) {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of items) {
    const value = select(item);
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function validatePresets(presets, errors) {
  if (!Array.isArray(presets) || presets.length === 0) {
    errors.push("Preset catalog must contain at least one entry.");
    return;
  }

  for (const duplicate of duplicateValues(presets, (item) => item?.id)) {
    errors.push(`Duplicate preset id: ${duplicate}`);
  }

  presets.forEach((preset, index) => {
    const label = `Preset ${preset?.id || index}`;
    if (!nonEmpty(preset?.id)) errors.push(`${label} has no id.`);
    if (!nonEmpty(preset?.type)) errors.push(`${label} has no type.`);
    if (!nonEmpty(preset?.className)) errors.push(`${label} has no class.`);
    if (!nonEmpty(preset?.title)) errors.push(`${label} has no title.`);
    if (!nonEmpty(preset?.plainEnglish)) errors.push(`${label} has no plain-English description.`);
    if (!nonEmpty(preset?.defaultKey)) errors.push(`${label} has no default key.`);
    if (!nonEmpty(preset?.command)) errors.push(`${label} has no command.`);
    if (!PRESET_DIFFICULTIES.has(preset?.difficulty)) errors.push(`${label} has an unsupported difficulty.`);
    if (!Array.isArray(preset?.searchTerms) || preset.searchTerms.some((term) => !nonEmpty(term))) {
      errors.push(`${label} has invalid search terms.`);
    }
  });
}

function commandSignature(command) {
  return [command?.id, command?.category, command?.params].join(" | ");
}

function validateCommands(commands, errors) {
  if (!Array.isArray(commands) || commands.length === 0) {
    errors.push("Command catalog must contain at least one entry.");
    return;
  }

  for (const duplicate of duplicateValues(commands, commandSignature)) {
    errors.push(`Duplicate command entry: ${duplicate}`);
  }

  commands.forEach((command, index) => {
    const label = `Command ${command?.id || index}`;
    if (!nonEmpty(command?.id)) errors.push(`${label} has no id.`);
    if (!nonEmpty(command?.command) || !command.command.startsWith("/")) {
      errors.push(`${label} must expose a slash-prefixed command.`);
    }
    if (!nonEmpty(command?.bindCommand) || command.bindCommand.startsWith("/")) {
      errors.push(`${label} has an invalid bind command.`);
    }
    if (!Array.isArray(command?.aliases) || command.aliases.some((alias) => !nonEmpty(alias))) {
      errors.push(`${label} has invalid aliases.`);
    }
    if (typeof command?.params !== "string") errors.push(`${label} has invalid params.`);
    if (!nonEmpty(command?.category)) errors.push(`${label} has no category.`);
  });
}

function validateCombos(combos, errors) {
  if (!Array.isArray(combos) || combos.length === 0) {
    errors.push("Key-combination catalog must contain at least one entry.");
    return;
  }

  for (const duplicate of duplicateValues(combos, (item) => item?.combo)) {
    errors.push(`Duplicate key combination: ${duplicate}`);
  }

  combos.forEach((combo, index) => {
    const label = `Key combination ${combo?.combo || index}`;
    if (!nonEmpty(combo?.combo)) errors.push(`${label} has no combo.`);
    if (!nonEmpty(combo?.baseKey)) errors.push(`${label} has no base key.`);
    if (!nonEmpty(combo?.category)) errors.push(`${label} has no category.`);
    if (!COMBO_STATUSES.has(combo?.status)) errors.push(`${label} has an unsupported status.`);
    if (!Array.isArray(combo?.modifiers) || combo.modifiers.some((modifier) => !MODIFIERS.has(modifier))) {
      errors.push(`${label} has invalid modifiers.`);
    }

    if (nonEmpty(combo?.combo) && nonEmpty(combo?.baseKey)) {
      const parts = combo.combo.split("+");
      if (parts.at(-1) !== combo.baseKey) errors.push(`${label} does not end with its base key.`);
      const comboModifiers = parts.slice(0, -1);
      if (JSON.stringify(comboModifiers) !== JSON.stringify(combo.modifiers)) {
        errors.push(`${label} modifiers do not match the combo string.`);
      }
    }
  });
}

export function catalogIntegrityErrors({ presets, commands, keyCombos }) {
  const errors = [];
  validatePresets(presets, errors);
  validateCommands(commands, errors);
  validateCombos(keyCombos, errors);
  return errors;
}

export function assertCatalogIntegrity(catalogs) {
  const errors = catalogIntegrityErrors(catalogs);
  if (errors.length) {
    throw new Error(`BindForge catalog integrity failed:\n- ${errors.join("\n- ")}`);
  }
  return true;
}
