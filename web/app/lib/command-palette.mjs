export const DEFAULT_COMMAND_ACTIONS = [
  { id: "search", label: "Focus keybind search", keywords: "find keybind browse", hash: "#search-keybinds" },
  { id: "setup", label: "Open My Setup", keywords: "profile character import conflicts", hash: "#my-setup" },
  { id: "build", label: "Open Build", keywords: "compose command say", hash: "#compose-keybind" },
  { id: "settings", label: "Open local data & backup", keywords: "settings accessibility theme backup", action: "settings" },
];

function normalize(value) {
  return String(value ?? "").toLowerCase().trim();
}

export function filterCommandActions(actions = DEFAULT_COMMAND_ACTIONS, query = "") {
  const needle = normalize(query);
  if (!needle) return [...actions];
  return actions.filter((action) => normalize(`${action.label} ${action.keywords ?? ""}`).includes(needle));
}
