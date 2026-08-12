import { assertCatalogIntegrity } from "../lib/catalog-integrity.mjs";
import { consoleCommands } from "./commands";
import { keyCombos } from "./keyCombos";
import { keybindPresets } from "./keybindPresets";

assertCatalogIntegrity({
  presets: keybindPresets,
  commands: consoleCommands,
  keyCombos,
});
