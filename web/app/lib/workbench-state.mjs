import { validateCustomFragment } from "./command-chain.mjs";
export const WORKBENCH_KEY = "bindforge-nw:workbench:v1";
const object = (v) => v && typeof v === "object" && !Array.isArray(v);
export function defaultWorkbench() {
  return {
    keys: {},
    saved: [],
    pack: [],
    chain: [],
    builderKey: "lbutton",
    personal: [],
    sayKey: "ctrl+alt+f2",
    sayMessage: "Thanks for the run, everyone!",
    commandKey: "ctrl+alt+f1",
    commandArgs: "1",
    commandId: "netgraph",
    largeText: false,
    highContrast: false,
    reduceMotion: false,
    theme: "dark",
    combinations: [],
    past: [],
    future: [],
  };
}
export function parseWorkbench(raw) {
  try {
    if (
      typeof raw !== "string" ||
      new TextEncoder().encode(raw).length > 1500000
    )
      return null;
    const value = JSON.parse(raw),
      s = value?.state;
    if (
      value?.version !== 3 ||
      !object(s) ||
      !object(s.keys) ||
      !Object.values(s.keys).every(
        (x) => typeof x === "string" && x.length <= 120,
      )
    )
      return null;
    const chain = (items) =>
      Array.isArray(items) &&
      items.length <= 100 &&
      items.every(
        (x) =>
          object(x) &&
          typeof x.id === "string" &&
          typeof x.label === "string" &&
          typeof x.source === "string" &&
          typeof x.fragment === "string" &&
          x.fragment.length <= 2000 &&
          validateCustomFragment(x.fragment).ok,
      );
    if (
      !Array.isArray(s.saved) ||
      !s.saved.every((x) => typeof x === "string") ||
      !chain(s.chain) ||
      !Array.isArray(s.pack) ||
      !s.pack.every(
        (x) =>
          object(x) &&
          ["id", "title", "key", "command"].every(
            (k) => typeof x[k] === "string",
          ),
      ) ||
      !Array.isArray(s.personal) ||
      !s.personal.every(
        (x) =>
          object(x) &&
          typeof x.key === "string" &&
          typeof x.command === "string",
      )
    )
      return null;
    if (
      ![
        "builderKey",
        "sayKey",
        "sayMessage",
        "commandKey",
        "commandArgs",
        "commandId",
      ].every((k) => typeof s[k] === "string") ||
      !["largeText", "highContrast", "reduceMotion"].every(
        (k) => typeof s[k] === "boolean",
      ) ||
      !["dark", "light"].includes(s.theme)
    )
      return null;
    for (const key of ["past", "future"])
      if (
        s[key] !== undefined &&
        (!Array.isArray(s[key]) || s[key].length > 50 || !s[key].every(chain))
      )
        return null;
    if (
      s.combinations !== undefined &&
      (!Array.isArray(s.combinations) ||
        s.combinations.length > 30 ||
        !s.combinations.every(
          (x) =>
            object(x) &&
            typeof x.name === "string" &&
            x.name.length <= 80 &&
            typeof x.key === "string" &&
            chain(x.chain),
        ))
    )
      return null;
    return { version: 3, state: { ...defaultWorkbench(), ...s } };
  } catch {
    return null;
  }
}
export function serializeWorkbench(state) {
  const next = {
    ...state,
    past: [...(state.past || [])].slice(-50),
    future: [...(state.future || [])].slice(0, 50),
  };
  let raw = JSON.stringify({ version: 3, state: next });
  while (
    new TextEncoder().encode(raw).length > 1500000 &&
    (next.past.length || next.future.length)
  ) {
    if (next.past.length >= next.future.length) next.past.shift();
    else next.future.pop();
    raw = JSON.stringify({ version: 3, state: next });
  }
  return parseWorkbench(raw);
}
