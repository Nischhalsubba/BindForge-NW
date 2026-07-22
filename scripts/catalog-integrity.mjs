import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const PRESET_TYPES = new Set([
  "VIP Services",
  "Invocation / Character",
  "Targeting",
  "Bard Songs",
  "Combat",
  "Animation Cancel",
  "Utility",
  "Inventory / Buffs",
  "Companion",
  "Loot / Interact",
  "Camera / Screenshot",
  "Risky / Testing",
  "Social",
]);
const PRESET_CLASSES = new Set(["Any Class", "Bard", "Paladin", "Fighter / Cleric"]);
const DIFFICULTIES = new Set(["Easy", "Advanced", "Risky"]);
const COMBO_STATUSES = new Set(["core", "candidate", "avoid"]);
const MODIFIER_ORDER = ["ctrl", "alt", "shift"];

function issue(level, source, record, message) {
  return { level, source, record, message };
}

function unwrap(node) {
  let current = node;
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isSatisfiesExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function evaluateLiteral(node, filePath) {
  const value = unwrap(node);
  if (ts.isStringLiteralLike(value)) return value.text;
  if (ts.isNumericLiteral(value)) return Number(value.text);
  if (value.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (value.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (value.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(value) && ts.isNumericLiteral(value.operand)) {
    return value.operator === ts.SyntaxKind.MinusToken ? -Number(value.operand.text) : Number(value.operand.text);
  }
  if (ts.isArrayLiteralExpression(value)) {
    return value.elements.map((element) => evaluateLiteral(element, filePath));
  }
  if (ts.isObjectLiteralExpression(value)) {
    const result = {};
    for (const property of value.properties) {
      if (!ts.isPropertyAssignment(property)) {
        throw new Error(`${filePath}: unsupported object property in generated catalog.`);
      }
      const name = property.name;
      const key = ts.isIdentifier(name) || ts.isStringLiteralLike(name) ? name.text : null;
      if (!key) throw new Error(`${filePath}: unsupported property name in generated catalog.`);
      result[key] = evaluateLiteral(property.initializer, filePath);
    }
    return result;
  }
  throw new Error(`${filePath}: catalog contains a non-literal expression that cannot be validated safely.`);
}

async function exportedArrays(filePath, expectedName = null) {
  const sourceText = await fs.readFile(filePath, "utf8");
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const arrays = [];

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const isExported = statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    if (!isExported) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      if (expectedName && declaration.name.text !== expectedName) continue;
      const initializer = unwrap(declaration.initializer);
      if (!ts.isArrayLiteralExpression(initializer)) continue;
      arrays.push({ name: declaration.name.text, values: evaluateLiteral(initializer, filePath) });
    }
  }

  if (expectedName && arrays.length !== 1) {
    throw new Error(`${filePath}: expected one exported array named ${expectedName}.`);
  }
  return arrays;
}

async function listTypeScriptFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listTypeScriptFiles(fullPath)));
    if (entry.isFile() && entry.name.endsWith(".ts")) files.push(fullPath);
  }
  return files.sort();
}

function requiredText(record, field, source, label, issues) {
  if (typeof record[field] !== "string" || !record[field].trim()) {
    issues.push(issue("error", source, label, `${field} must be non-empty text.`));
    return "";
  }
  return record[field];
}

function balancedDoubleQuotes(value) {
  let count = 0;
  let escaped = false;
  for (const character of value) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === "\\") {
      escaped = true;
      continue;
    }
    if (character === '"') count += 1;
  }
  return count % 2 === 0;
}

function normalizedCombo(value) {
  return value
    .split("+")
    .map((part) => part.trim().toLowerCase().replace(/\s+/g, ""))
    .filter(Boolean)
    .join("+");
}

function validKeySyntax(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  if (/["'\/]/.test(value)) return false;
  const parts = normalizedCombo(value).split("+");
  if (!parts.length || parts.length > 4 || parts.some((part) => !part)) return false;
  const baseKeys = parts.filter((part) => !MODIFIER_ORDER.includes(part));
  return baseKeys.length === 1 && new Set(parts).size === parts.length;
}

function validatePresets(presets, issues) {
  const ids = new Map();
  const semanticRecords = new Map();

  for (const { source, value: preset } of presets) {
    const label = typeof preset.id === "string" && preset.id ? preset.id : "unknown preset";
    const id = requiredText(preset, "id", source, label, issues);
    const type = requiredText(preset, "type", source, label, issues);
    const className = requiredText(preset, "className", source, label, issues);
    const title = requiredText(preset, "title", source, label, issues);
    requiredText(preset, "plainEnglish", source, label, issues);
    const defaultKey = requiredText(preset, "defaultKey", source, label, issues);
    const command = requiredText(preset, "command", source, label, issues);
    const difficulty = requiredText(preset, "difficulty", source, label, issues);

    if (id) {
      if (ids.has(id)) issues.push(issue("error", source, label, `Duplicate preset id; first seen in ${ids.get(id)}.`));
      else ids.set(id, source);
    }
    if (type && !PRESET_TYPES.has(type)) issues.push(issue("error", source, label, `Unknown preset type: ${type}.`));
    if (className && !PRESET_CLASSES.has(className)) issues.push(issue("error", source, label, `Unknown class: ${className}.`));
    if (difficulty && !DIFFICULTIES.has(difficulty)) issues.push(issue("error", source, label, `Unknown difficulty: ${difficulty}.`));
    if (defaultKey && !validKeySyntax(defaultKey)) issues.push(issue("error", source, label, `Invalid default key syntax: ${defaultKey}.`));
    if (command && !balancedDoubleQuotes(command)) issues.push(issue("error", source, label, "Command contains unbalanced double quotes."));
    if (!Array.isArray(preset.searchTerms) || preset.searchTerms.some((term) => typeof term !== "string" || !term.trim())) {
      issues.push(issue("error", source, label, "searchTerms must be an array of non-empty strings."));
    }

    const semanticKey = `${type}\u0000${className}\u0000${title}\u0000${command}`.toLowerCase();
    if (title && command) {
      if (semanticRecords.has(semanticKey)) {
        issues.push(issue("error", source, label, `Duplicate preset title/command; first seen in ${semanticRecords.get(semanticKey)}.`));
      } else semanticRecords.set(semanticKey, source);
    }

    if (command && /<[^>]+>/.test(command)) {
      issues.push(issue("warning", source, label, "Command contains an unresolved placeholder; ensure the UI clearly requires editing before copy."));
    }
  }
}

function validateCommands(commands, issues) {
  const ids = new Map();
  const signatures = new Map();

  for (const { source, value: command } of commands) {
    const label = typeof command.id === "string" && command.id ? command.id : "unknown command";
    const id = requiredText(command, "id", source, label, issues);
    const slashCommand = requiredText(command, "command", source, label, issues);
    const bindCommand = requiredText(command, "bindCommand", source, label, issues);
    const category = requiredText(command, "category", source, label, issues);

    if (id) {
      if (ids.has(id)) issues.push(issue("error", source, label, `Duplicate command id; first seen in ${ids.get(id)}.`));
      else ids.set(id, source);
    }
    if (slashCommand && !slashCommand.startsWith("/")) issues.push(issue("error", source, label, "command must start with /."));
    if (bindCommand && bindCommand.startsWith("/")) issues.push(issue("error", source, label, "bindCommand must not start with /."));
    if (slashCommand && bindCommand && slashCommand.slice(1).toLowerCase() !== bindCommand.toLowerCase()) {
      issues.push(issue("warning", source, label, "command and bindCommand differ beyond the leading slash or letter case."));
    }
    if (!Array.isArray(command.aliases) || command.aliases.some((alias) => typeof alias !== "string" || !alias.startsWith("/"))) {
      issues.push(issue("error", source, label, "aliases must be an array of slash-prefixed strings."));
    }
    if (typeof command.params !== "string") issues.push(issue("error", source, label, "params must be text, including an empty string when unused."));
    if (slashCommand && !balancedDoubleQuotes(`${slashCommand} ${command.params ?? ""}`)) {
      issues.push(issue("error", source, label, "Command metadata contains unbalanced double quotes."));
    }

    const signature = `${slashCommand}\u0000${command.params ?? ""}`.toLowerCase();
    if (slashCommand && category) {
      if (signatures.has(signature)) {
        issues.push(issue("warning", source, label, `Duplicate command signature; first seen in ${signatures.get(signature)}.`));
      } else signatures.set(signature, source);
    }
  }
}

function validateKeyCombos(combos, issues) {
  const seen = new Map();

  for (const { source, value: comboRecord } of combos) {
    const label = typeof comboRecord.combo === "string" && comboRecord.combo ? comboRecord.combo : "unknown combo";
    const combo = requiredText(comboRecord, "combo", source, label, issues);
    const baseKey = requiredText(comboRecord, "baseKey", source, label, issues);
    const category = requiredText(comboRecord, "category", source, label, issues);
    const status = requiredText(comboRecord, "status", source, label, issues);

    if (combo) {
      const canonical = normalizedCombo(combo);
      if (canonical !== combo) issues.push(issue("error", source, label, `Combo must use canonical lowercase syntax: ${canonical}.`));
      if (!validKeySyntax(combo)) issues.push(issue("error", source, label, "Combo syntax is invalid."));
      if (seen.has(combo)) issues.push(issue("error", source, label, `Duplicate combo; first seen in ${seen.get(combo)}.`));
      else seen.set(combo, source);
    }
    if (status && !COMBO_STATUSES.has(status)) issues.push(issue("error", source, label, `Unknown combo status: ${status}.`));
    if (!Array.isArray(comboRecord.modifiers) || comboRecord.modifiers.some((modifier) => !MODIFIER_ORDER.includes(modifier))) {
      issues.push(issue("error", source, label, "modifiers must contain only ctrl, alt, and shift."));
    } else if (combo) {
      const parts = combo.split("+");
      const expectedModifiers = parts.slice(0, -1);
      if (JSON.stringify(comboRecord.modifiers) !== JSON.stringify(expectedModifiers)) {
        issues.push(issue("error", source, label, `modifiers must match combo prefix: ${expectedModifiers.join(", ") || "none"}.`));
      }
      const ordered = MODIFIER_ORDER.filter((modifier) => expectedModifiers.includes(modifier));
      if (JSON.stringify(expectedModifiers) !== JSON.stringify(ordered)) {
        issues.push(issue("error", source, label, "Modifiers must use ctrl, alt, shift order."));
      }
      if (baseKey && parts.at(-1) !== baseKey) issues.push(issue("error", source, label, `baseKey must equal ${parts.at(-1)}.`));
    }
    if (comboRecord.note !== undefined && typeof comboRecord.note !== "string") {
      issues.push(issue("error", source, label, "note must be text when present."));
    }
    void category;
  }
}

export function validateCatalogData({ presets, commands, keyCombos }) {
  const issues = [];
  validatePresets(presets.map((value) => ({ source: "fixture:presets", value })), issues);
  validateCommands(commands.map((value) => ({ source: "fixture:commands", value })), issues);
  validateKeyCombos(keyCombos.map((value) => ({ source: "fixture:keyCombos", value })), issues);
  return {
    issues,
    errors: issues.filter((item) => item.level === "error"),
    warnings: issues.filter((item) => item.level === "warning"),
  };
}

export async function loadRepositoryCatalog(rootDirectory) {
  const dataDirectory = path.join(rootDirectory, "app", "data");
  const presetDirectory = path.join(dataDirectory, "keybindPresetSections");
  const presetFiles = await listTypeScriptFiles(presetDirectory);
  const presets = [];
  for (const filePath of presetFiles) {
    for (const exported of await exportedArrays(filePath)) {
      for (const value of exported.values) presets.push({ source: path.relative(rootDirectory, filePath), value });
    }
  }

  const commandsPath = path.join(dataDirectory, "commands.ts");
  const combosPath = path.join(dataDirectory, "keyCombos.ts");
  const commandArray = (await exportedArrays(commandsPath, "consoleCommands"))[0];
  const comboArray = (await exportedArrays(combosPath, "keyCombos"))[0];

  return {
    presets,
    commands: commandArray.values.map((value) => ({ source: path.relative(rootDirectory, commandsPath), value })),
    keyCombos: comboArray.values.map((value) => ({ source: path.relative(rootDirectory, combosPath), value })),
  };
}

export async function validateRepositoryCatalog(rootDirectory) {
  const catalog = await loadRepositoryCatalog(rootDirectory);
  const issues = [];
  validatePresets(catalog.presets, issues);
  validateCommands(catalog.commands, issues);
  validateKeyCombos(catalog.keyCombos, issues);
  return {
    counts: {
      presets: catalog.presets.length,
      commands: catalog.commands.length,
      keyCombos: catalog.keyCombos.length,
    },
    issues,
    errors: issues.filter((item) => item.level === "error"),
    warnings: issues.filter((item) => item.level === "warning"),
  };
}

function printIssues(items) {
  for (const item of items) {
    const marker = item.level === "error" ? "ERROR" : "WARN";
    console.log(`[${marker}] ${item.source} :: ${item.record} :: ${item.message}`);
  }
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  const rootDirectory = path.resolve(path.dirname(currentFile), "..");
  try {
    const result = await validateRepositoryCatalog(rootDirectory);
    printIssues(result.issues);
    console.log(
      `Catalog checked: ${result.counts.presets} presets, ${result.counts.commands} commands, ${result.counts.keyCombos} key combinations.`,
    );
    console.log(`Result: ${result.errors.length} errors, ${result.warnings.length} warnings.`);
    if (result.errors.length) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
