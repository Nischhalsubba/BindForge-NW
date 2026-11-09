import {installKeyCapture,installGuide} from './interaction.js';
import {
  WORKBENCH_KEY,
  defaultWorkbench,
  parseWorkbench,
  serializeWorkbench,
  resolveCommandDraft,
} from "./engine/workbench-state.mjs";
import {
  COPY_HISTORY_KEY,
  parseCopyHistory,
  recordCopy,
  togglePin,
  pairedBindOutput,
} from "./engine/copy-workflow.mjs";
import {
  configureMotion,
  revealView,
  revealToast,
  copiedFeedback,
  captureChain,
  animateChain,
  loadMotion,
} from "./motion.js";
import {
  normalizeCombo,
  isCompleteCombo,
  parseBindText,
  resolveBindMap,
  buildSayLine,
} from "./engine/keybind-core.mjs";
import {
  buildCommandChain,
  validateCustomFragment,
} from "./engine/command-chain.mjs";
import {
  buildNativeBindFile,
  buildNativeRestoreFile,
  buildBindLoadCommand,
} from "./engine/native-bind-file.mjs";
import { buildCatalogPacks } from "./engine/catalog-packs.mjs";
import { scorePresetSearch } from "./engine/preset-search.mjs";
import { reconcileCmdlist } from "./engine/cmdlist-reconcile.mjs";
let cloudOwner = null;
try { cloudOwner = localStorage.getItem('bindforge-nw:cloud-owner'); } catch { /* Guests can work without browser storage. */ }
if (cloudOwner) {
  try {
    const cloud = await import('./cloud.bundle.js');
    await cloud.verifyWorkspaceOwner();
    cloud.startCloudSync(message => { const el = document.getElementById('cloudStatus'); if (el) el.textContent = message; });
  } catch (error) {
    const el = document.getElementById('loadState'); if (el) el.textContent = error.message;
    throw error;
  }
}
const replayGuide=location.hash==='#help';
const $ = (id) => document.getElementById(id),
  esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
let idCounter = 0;
const newId = () =>
  globalThis.crypto?.randomUUID?.() ||
  "bf-" + Date.now().toString(36) + "-" + ++idCounter;
const paths = {
  copy: '<rect x="8" y="8" width="12" height="13" rx="1"/><path d="M15 8V3H3v13h5"/>',
  save: '<path class="bookmark" d="M6 3h12v18l-6-4-6 4z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  arrow: '<path d="M4 12h16m-5-5 5 5-5 5"/>',
};
const icon = (n) =>
  '<svg viewBox="0 0 24 24" aria-hidden="true">' + paths[n] + "</svg>";
let catalog,
  selected = "",
  category = "All",
  savedOnly = false,
  limit = 18,
  selectedCommand = 0,
  packFilter = null;
let state = defaultWorkbench(),
  storageWritable = true;
try {
  const raw =
    localStorage.getItem(WORKBENCH_KEY) ||
    localStorage.getItem("bf-redesign-v3");
  if (raw) {
    const restored = parseWorkbench(raw);
    if (restored) state = restored.state;
    else storageWritable = false;
  } else {
    const legacy = JSON.parse(
      localStorage.getItem("bindforge-nw:settings:v2") || "null",
    );
    if (legacy?.keys) state.keys = { ...legacy.keys };
    const library = JSON.parse(
      localStorage.getItem("bindforge-nw:library:v1") || "null",
    );
    if (Array.isArray(library?.favourites)) state.saved = library.favourites;
    if (Array.isArray(library?.personalBinds))
      state.personal = library.personalBinds;
  }
} catch {
  storageWritable = false;
}
function persist() {
  if (!storageWritable) return;
  try {
    const snapshot = serializeWorkbench(state);
    if (!snapshot) {
      toast(
        "This workspace is too large to save. Export a backup, then remove unused combinations. Your previous saved copy is preserved.",
      );
      return;
    }
    state = snapshot.state;
    localStorage.setItem(WORKBENCH_KEY, JSON.stringify(snapshot));
    localStorage.removeItem("bf-redesign-v3");
    window.dispatchEvent(new Event("bindforge:workspace-change"));
  } catch {
    toast("Changes work for this session; browser storage is unavailable.");
  }
}
function checkpoint() {
  state.past = [...(state.past || []), structuredClone(state.chain)].slice(-50);
  state.future = [];
}
function renderCombinations() {
  const saved = state.combinations || [];
  $("savedCombinations").innerHTML = saved
    .map(
      (item, i) =>
        '<div class="buttonrow"><button class="btn" data-load-combo="' +
        i +
        '">Load ' +
        esc(item.name) +
        '</button><button class="btn" data-delete-combo="' +
        i +
        '">Remove ' +
        esc(item.name) +
        "</button></div>",
    )
    .join("");
  $("savedCombinations")
    .querySelectorAll("[data-load-combo]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          const item = saved[Number(b.dataset.loadCombo)];
          checkpoint();
          state.chain = structuredClone(item.chain).map((x) => ({
            ...x,
            id: newId(),
          }));
          state.builderKey = item.key;
          $("builderKey").value = item.key;
          persist();
          renderChain();
        }),
    );
  $("savedCombinations")
    .querySelectorAll("[data-delete-combo]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          state.combinations.splice(Number(b.dataset.deleteCombo), 1);
          persist();
          renderCombinations();
        }),
    );
}
function readCopies() {
  try { return parseCopyHistory(localStorage.getItem(COPY_HISTORY_KEY)); } catch { return parseCopyHistory(null); }
}
function saveCopies(next) {
  try {
    localStorage.setItem(COPY_HISTORY_KEY, JSON.stringify(next));
  } catch {
    toast("Copy succeeded, but history could not be saved.");
  }
  renderCopies();
}
function renderCopies() {
  let h;
  try {
    h = readCopies();
  } catch {
    return;
  }
  const items = [
    ...h.items.filter((x) => x.pinned),
    ...h.items.filter((x) => !x.pinned).slice(0, 8),
  ];
  $("repeatShortcut").checked = h.shortcutEnabled;
  $("repeatCopy").disabled = !h.items.length;
  $("recentCopies").innerHTML = items.length
    ? items
        .map(
          (item) =>
            '<section class="copy-entry"><strong>' +
            esc(item.label) +
            "</strong><code>" +
            esc(item.text) +
            '</code><div class="buttonrow"><button class="btn" data-recopy="' +
            esc(item.text) +
            '">Copy again</button><button class="btn" data-pin="' +
            esc(item.text) +
            '" aria-pressed="' +
            item.pinned +
            '">' +
            (item.pinned ? "Unpin" : "Pin") +
            "</button>" +
            (pairedBindOutput(item.text)
              ? '<button class="btn" data-pair="' +
                esc(item.text) +
                '">Copy bind + unbind reference</button>'
              : "") +
            "</div></section>",
        )
        .join("")
    : '<p class="hint">Copied commands will appear here.</p>';
  $("recentCopies")
    .querySelectorAll("[data-recopy]")
    .forEach(
      (b) => (b.onclick = () => copy(b.dataset.recopy, "Recent command", b)),
    );
  $("recentCopies")
    .querySelectorAll("[data-pin]")
    .forEach(
      (b) =>
        (b.onclick = () => saveCopies(togglePin(readCopies(), b.dataset.pin))),
    );
  $("recentCopies")
    .querySelectorAll("[data-pair]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          copy(
            pairedBindOutput(b.dataset.pair),
            "Reference: runs bind then unbind, leaving the key unbound",
            b,
            true,
          )),
    );
}

function toast(msg) {
  $("toast").textContent = msg;
  $("toast").classList.remove("hidden");
  revealToast($("toast"));
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(
    () => $("toast").classList.add("hidden"),
    4200,
  );
}
async function copy(text, label, button, reference = false) {
  if (!text) return;
  const previousFocus = document.activeElement;
  let success = false;
  try {
    await navigator.clipboard.writeText(text);
    success = true;
  } catch {
    const t = document.createElement("textarea");
    t.value = text;
    t.style.position = "fixed";
    t.style.top = "-10000px";
    document.body.append(t);
    t.select();
    try {
      success = document.execCommand("copy");
    } catch {}
    t.remove();
    previousFocus?.focus({ preventScroll: true });
  }
  if (!success) {
    toast("Clipboard unavailable. Select and copy the command preview.");
    return;
  }
  if (!reference) {
    try {
      saveCopies(recordCopy(readCopies(), { text, label }));
    } catch {}
  }
  toast(
    label +
      (label.toLowerCase().includes("unbind")
        ? " copied. This removes the key assignment; it does not restore an old bind."
        : " copied. Paste into Neverwinter chat and test."),
  );
  if (button) {
    const old = button.innerHTML;
    button.innerHTML = icon("check") + " Copied";
    copiedFeedback(button);
    setTimeout(() => {
      if (button.isConnected) button.innerHTML = old;
    }, 1600);
  }
}
const keyOf = (p) => state.keys[p.id] ?? p.defaultKey;
function validKey(key) {
  const k = normalizeCombo(key);
  return (
    isCompleteCombo(key) &&
    /^[a-z0-9]+(?:\+[a-z0-9]+)*$/.test(k) &&
    k.length <= 80 &&
    !["alt+f4", "alt+tab", "ctrl+alt+delete", "ctrl+shift+escape"].includes(k)
  );
}
function bindLine(p) {
  return "/bind " + normalizeCombo(keyOf(p)) + " " + p.command;
}
const unbindLine = (key) => "/unbind " + normalizeCombo(key);
const hasPlaceholder = (text) => /<[^>]+>/.test(text);
function keyWarning(key) {
  if (!validKey(key))
    return "Enter a complete key combination, for example ctrl+alt+f1. Reserved OS shortcuts are blocked.";
  const k = normalizeCombo(key),
    prior = state.personal.find((p) => p.key === k);
  if (prior) return "Imported key conflict: " + prior.command;
  if (/^(w|a|s|d|space|lbutton|rbutton|shift|[1-9])$/.test(k))
    return "Common game input. This may replace an existing movement or combat action.";
  return "";
}
function trust(p) {
  return p.confidence === "verified"
    ? "Verified in catalogue"
    : p.confidence === "experimental"
      ? "Experimental"
      : "Community tested";
}
function filtered() {
  let q = $("search").value.trim();
  return catalog.presets
    .map((p) => ({ p, score: q ? scorePresetSearch(p, q) : 1 }))
    .filter(
      ({ p, score }) =>
        score > 0 &&
        (category === "All" || p.type === category) &&
        ($("classFilter").value === "all" ||
          p.className === $("classFilter").value) &&
        ($("trustFilter").value === "all" ||
          p.confidence === $("trustFilter").value) &&
        (!savedOnly || state.saved.includes(p.id)) &&
        (!packFilter || packFilter.includes(p.id)),
    )
    .sort((a, b) => {
      if (q) return b.score - a.score;
      const popular = [
        "Summon VIP Bank Portal",
        "Summon VIP Mailbox",
        "Summon VIP Travel Post",
        "Invoke",
        "Attempt to Unstick Character",
        "Go to Character Selection",
      ];
      const rank = (p) =>
        popular.includes(p.title) ? popular.indexOf(p.title) : 100;
      return rank(a.p) - rank(b.p);
    })
    .map((x) => x.p);
}
function makeOptions(select, values, all) {
  select.innerHTML =
    '<option value="all">' +
    esc(all) +
    "</option>" +
    values
      .map((v) => '<option value="' + esc(v) + '">' + esc(v) + "</option>")
      .join("");
}
function renderCategories() {
  const types = ["All", ...new Set(catalog.presets.map((p) => p.type))];
  $("categoryList").innerHTML = types
    .map(
      (t) =>
        '<button class="category ' +
        (category === t ? "active" : "") +
        '" data-cat="' +
        esc(t) +
        '" aria-pressed="' +
        (category === t) +
        '"><span>' +
        esc(t === "All" ? "All keybinds" : t) +
        "</span><small>" +
        catalog.presets.filter((p) => t === "All" || p.type === t).length +
        "</small></button>",
    )
    .join("");
  $("categoryList")
    .querySelectorAll("button")
    .forEach(
      (b) =>
        (b.onclick = () => {
          category = b.dataset.cat;
          packFilter = null;
          limit = 18;
          renderLibrary();
        }),
    );
}
function refreshCounts() {
  $("savedCount").textContent = state.saved.length;
  $("packCount").textContent = state.pack.length;
  $("savedFilter").setAttribute("aria-pressed", savedOnly);
}
function renderLibrary() {
  const active = document.activeElement,
    focusCat = active?.dataset.cat,
    focusRow = active?.closest?.(".preset")?.dataset.id,
    focusAction = active?.dataset.do;
  renderCategories();
  refreshCounts();
  const presets = filtered();
  if (presets.length && !presets.some((p) => p.id === selected))
    selected = presets[0].id;
  $("resultCount").textContent =
    presets.length +
    " " +
    (presets.length === 1 ? "keybind" : "keybinds") +
    (packFilter ? " in selected class pack" : "");
  $("showMore").classList.toggle("hidden", presets.length <= limit);
  $("presetList").innerHTML = presets.length
    ? presets
        .slice(0, limit)
        .map((p) => {
          const key = keyOf(p),
            ready = validKey(key) && !hasPlaceholder(p.command);
          return (
            '<article class="preset ' +
            (p.id === selected ? "active" : "") +
            '" data-id="' +
            esc(p.id) +
            '"><div class="row-top"><button class="preset-title" data-do="inspect">' +
            esc(p.title) +
            '</button><div class="row-tools"><button data-do="save" aria-label="' +
            (state.saved.includes(p.id) ? "Unsave " : "Save ") +
            esc(p.title) +
            '" aria-pressed="' +
            state.saved.includes(p.id) +
            '">' +
            icon("save") +
            '</button><button data-do="pack" aria-label="Add ' +
            esc(p.title) +
            ' to setup" title="Add to setup">' +
            icon("plus") +
            '</button></div></div><div class="metadata"><span>' +
            esc(p.className) +
            "</span><span>" +
            esc(p.type) +
            '</span><span class="evidence ' +
            (p.confidence === "experimental" ? "risky" : "") +
            '">' +
            trust(p) +
            '</span></div><div class="row-actions"><input class="keyfield" aria-label="Key for ' +
            esc(p.title) +
            '" value="' +
            esc(key) +
            '" maxlength="80"><button class="btn primary" data-do="bind" ' +
            (!ready ? "disabled" : "") +
            ">" +
            icon("copy") +
            'Copy bind</button><button class="btn quiet" data-do="unbind" ' +
            (!validKey(key) ? "disabled" : "") +
            ">Copy unbind</button></div>" +
            (hasPlaceholder(p.command)
              ? '<div class="error">Needs parameters. Select the title to configure the command.</div>'
              : "") +
            '<details class="inline-details"><summary>Details &amp; evidence</summary><p>' +
            esc(p.plainEnglish) +
            '</p><div class="output"><code>' +
            esc(bindLine(p)) +
            '</code></div><p class="hint">' +
            esc(trust(p)) +
            " · Verification date: " +
            esc(p.verifiedAt || "not supplied") +
            "</p></details></article>"
          );
        })
        .join("")
    : '<div class="empty">No matching keybinds. Try a shorter search, reset filters, or turn off Saved presets.</div>';
  $("presetList")
    .querySelectorAll("article")
    .forEach((row) => {
      const p = catalog.presets.find((p) => p.id === row.dataset.id);
      row.querySelector("input").oninput = (e) => {
        state.keys[p.id] = e.target.value;
        persist();
        row.querySelector("[data-do=bind]").disabled =
          !validKey(e.target.value) || hasPlaceholder(p.command);
        row.querySelector("[data-do=unbind]").disabled = !validKey(
          e.target.value,
        );
        if (p.id === selected) renderInspector();
        renderSetup();
      };
      row.querySelectorAll("[data-do]").forEach(
        (b) =>
          (b.onclick = () => {
            const action = b.dataset.do;
            if (action === "bind") {
              selected = p.id;
              renderInspector();
              copy(bindLine(p), "Bind", b);
            }
            if (action === "unbind") copy(unbindLine(keyOf(p)), "Unbind", b);
            if (action === "inspect") {
              selected = p.id;
              renderInspector();
              document
                .querySelectorAll(".preset")
                .forEach((r) =>
                  r.classList.toggle("active", r.dataset.id === selected),
                );
              if (matchMedia("(max-width:1250px)").matches) {
                if (hasPlaceholder(p.command)) {
                  configurePreset(p);
                } else
                  row.querySelector(".inline-details").open =
                    !row.querySelector(".inline-details").open;
              }
            }
            if (action === "save") {
              const i = state.saved.indexOf(p.id);
              if (i >= 0) state.saved.splice(i, 1);
              else state.saved.push(p.id);
              persist();
              renderLibrary();
            }
            if (action === "pack") addPack(p.title, keyOf(p), p.command);
          }),
      );
    });
  renderInspector();
  if (focusCat !== undefined) {
    Array.from($("categoryList").querySelectorAll("button"))
      .find((b) => b.dataset.cat === focusCat)
      ?.focus({ preventScroll: true });
  } else if (focusRow && focusAction) {
    Array.from($("presetList").querySelectorAll("article"))
      .find((r) => r.dataset.id === focusRow)
      ?.querySelector("[data-do=" + focusAction + "]")
      ?.focus({ preventScroll: true });
  }
  decorateForms();
}
function configurePreset(p) {
  switchView("commands");
  $("commandSearch").value = "";
  selectedCommand = -1;
  $("commandName").textContent = p.title;
  $("commandParams").textContent =
    "Preset parameters: replace angle-bracket placeholders in the command.";
  $("commandKey").value = keyOf(p);
  $("commandArgs").value = p.command;
  state.customPreset = p;
  renderCommandOutput();
}
function renderInspector() {
  const p = catalog.presets.find((p) => p.id === selected);
  if (!p) {
    $("inspector").innerHTML = "";
    return;
  }
  const warning = keyWarning(keyOf(p));
  $("inspector").innerHTML =
    '<div class="inspect-head">PRESET DETAILS</div><div class="inspect-body"><h2>' +
    esc(p.title) +
    "</h2><p>" +
    esc(p.plainEnglish) +
    '</p><div class="output"><span>BIND</span><code>' +
    esc(bindLine(p)) +
    '</code><div class="mini">' +
    esc(unbindLine(keyOf(p))) +
    "</div></div>" +
    (warning ? '<div class="notice">' + esc(warning) + "</div>" : "") +
    '<div class="source">' +
    esc(trust(p)) +
    " · " +
    esc(p.sourceType || "community") +
    " source<br>Verification date: " +
    esc(p.verifiedAt || "not supplied") +
    "</div>" +
    (p.sourceUrl && /^https?:\/\//.test(p.sourceUrl)
      ? '<a id="sourceLink" href="' +
        esc(p.sourceUrl) +
        '" target="_blank" rel="noreferrer" style="font-size:12px">Read source evidence</a>'
      : "") +
    '<button class="btn" id="inspectPack">' +
    icon("plus") +
    "Add to setup</button>" +
    (hasPlaceholder(p.command)
      ? '<button class="btn" id="configurePreset">Configure parameters</button>'
      : "") +
    "<details><summary>What does unbind do?</summary><p>Removes this key’s assignment. It does not restore the previous action. Import your prior binds under My setup to export a restore file.</p></details></div>";
  $("inspectPack").onclick = () => addPack(p.title, keyOf(p), p.command);
  if ($("configurePreset"))
    $("configurePreset").onclick = () => configurePreset(p);
}
function addPack(title, key, command) {
  if (!validKey(key)) {
    toast("Choose a complete key combination first.");
    return;
  }
  if (!command || hasPlaceholder(command) || /[\r\n]/.test(command)) {
    toast("Replace command placeholders and remove line breaks first.");
    return;
  }
  const k = normalizeCombo(key);
  if (state.pack.some((p) => p.key === k && p.command === command)) {
    toast("That exact binding is already in your setup.");
    return;
  }
  state.pack.push({ id: newId(), title, key: k, command });
  persist();
  refreshCounts();
  renderSetup();
  toast("Added to My setup. Review conflicts before applying.");
}
function renderActions() {
  const q = $("actionSearch").value.toLowerCase();
  const list = catalog.actions.filter(
    (a) =>
      (a.label + " " + a.bindFragment).toLowerCase().includes(q) &&
      ($("actionCategory").value === "all" ||
        a.category === $("actionCategory").value),
  );
  $("actionCount").textContent = list.length + " actions";
  $("actionList").innerHTML = list.length
    ? list
        .map(
          (a) =>
            '<button class="action" data-action="' +
            esc(a.id) +
            '"><span><strong>' +
            esc(a.label) +
            "</strong><small>" +
            esc(a.bindFragment) +
            '</small></span><span class="add" aria-hidden="true">+</span></button>',
        )
        .join("")
    : '<div class="empty">No matching actions.</div>';
  $("actionList")
    .querySelectorAll("button")
    .forEach(
      (b) =>
        (b.onclick = () => {
          const a = catalog.actions.find((a) => a.id === b.dataset.action);
          if (state.chain.length >= 100) {
            toast("Use at most 100 actions per combination.");
            return;
          }
          checkpoint();
          state.chain.push({
            id: newId(),
            label: a.label,
            fragment: a.bindFragment,
            source: "Repository settings-screenshot evidence",
          });
          persist();
          renderChain();
        }),
    );
}
function renderChain() {
  const previous = captureChain();
  $("chainCount").textContent = state.chain.length + " actions";
  $("chain").innerHTML = state.chain.length
    ? state.chain
        .map(
          (a, i) =>
            '<div class="chain-row" data-flip-id="' +
            esc(a.id) +
            '"><span class="index">' +
            (i + 1) +
            '</span><div class="chain-info"><strong>' +
            esc(a.label) +
            "</strong><code>" +
            esc(a.fragment) +
            '</code></div><button data-index="' +
            i +
            '" data-move="-1" ' +
            (i === 0 ? "disabled" : "") +
            ' aria-label="Move ' +
            esc(a.label) +
            ' up">↑</button><button data-index="' +
            i +
            '" data-move="1" ' +
            (i === state.chain.length - 1 ? "disabled" : "") +
            ' aria-label="Move ' +
            esc(a.label) +
            ' down">↓</button><button data-index="' +
            i +
            '" data-duplicate aria-label="Duplicate ' +
            esc(a.label) +
            '">+</button><button data-index="' +
            i +
            '" data-remove aria-label="Remove ' +
            esc(a.label) +
            '">×</button></div>',
        )
        .join("")
    : '<div class="empty">Choose actions from the catalogue to combine them here.</div>';
  $("chain")
    .querySelectorAll("button")
    .forEach(
      (b) =>
        (b.onclick = () => {
          const i = Number(b.dataset.index);
          if (b.hasAttribute("data-duplicate")) {
            if (state.chain.length >= 100) return;
            checkpoint();
            state.chain.splice(i + 1, 0, { ...state.chain[i], id: newId() });
            persist();
            renderChain();
            return;
          }
          checkpoint();
          if (b.hasAttribute("data-remove")) state.chain.splice(i, 1);
          else {
            const n = i + Number(b.dataset.move);
            [state.chain[i], state.chain[n]] = [state.chain[n], state.chain[i]];
          }
          persist();
          renderChain();
          const focusIndex = Math.min(
            b.hasAttribute("data-remove") ? i : i + Number(b.dataset.move),
            state.chain.length - 1,
          );
          $("chain")
            .querySelectorAll(".chain-row")
            [focusIndex]?.querySelector("button:not(:disabled)")
            ?.focus({ preventScroll: true });
        }),
    );
  $("undoChain").disabled = !state.past.length;
  $("redoChain").disabled = !state.future.length;
  renderBuilderOutput();
  animateChain(previous);
}
function chainCommand() {
  return '"' + state.chain.map((x) => x.fragment).join("$$") + '"';
}
function renderBuilderOutput() {
  state.builderKey = $("builderKey").value;
  $("builderOutput").textContent = buildCommandChain(
    state.builderKey,
    state.chain.map((x) => x.fragment),
  );
  const valid = validKey(state.builderKey),
    hasActions = state.chain.length > 0,
    error = !valid
      ? "Enter a complete key combination."
      : !hasActions
        ? "Add at least one action to enable copying."
        : state.chain.some((a) => hasPlaceholder(a.fragment))
          ? "Replace placeholders in custom fragments first."
          : "";
  $("builderError").textContent = error;
  const warning = keyWarning(state.builderKey);
  $("builderKeyHint").textContent =
    warning ||
    "Use + between inputs: ctrl+rbutton or 5+6. Capture replaces the shortcut.";
  ["copyChain", "saveChain"].forEach((id) => ($(id).disabled = !!error));
  $("unbindChain").disabled = !valid;
  renderKeychips();
  persist();
}
function renderKeychips() {
  $("keychips").innerHTML = [
    "ctrl",
    "alt",
    "shift",
    "lbutton",
    "rbutton",
    "mbutton",
  ]
    .map(
      (k) =>
        '<button data-key="' +
        k +
        '" class="' +
        (normalizeCombo(state.builderKey).split("+").includes(k)
          ? "active"
          : "") +
        '">' +
        ({
          lbutton: "Left click",
          rbutton: "Right click",
          mbutton: "Middle click",
        }[k] || k) +
        "</button>",
    )
    .join("");
  $("keychips")
    .querySelectorAll("button")
    .forEach(
      (b) =>
        (b.onclick = () => {
          let parts = normalizeCombo($("builderKey").value)
            .split("+")
            .filter(Boolean);
          const k = b.dataset.key;
          if (["ctrl", "alt", "shift"].includes(k)) {
            parts = parts.includes(k)
              ? parts.filter((p) => p !== k)
              : [k, ...parts];
          } else
            parts = [
              ...parts.filter((p) => ["ctrl", "alt", "shift"].includes(p)),
              k,
            ];
          $("builderKey").value = normalizeCombo(parts.join("+"));
          renderBuilderOutput();
        }),
    );
}
function renderCommands() {
  const q = $("commandSearch").value.toLowerCase(),
    list = catalog.commands.filter(
      (c) =>
        (c.command + " " + c.aliases.join(" ") + " " + c.category)
          .toLowerCase()
          .includes(q) &&
        ($("commandCategory").value === "all" ||
          c.category === $("commandCategory").value),
    );
  $("commandCount").textContent = list.length + " references";
  $("commandList").innerHTML = list.length
    ? list
        .slice(0, 100)
        .map(
          (c) =>
            '<button class="action ' +
            (catalog.commands[selectedCommand]?.id === c.id ? "active" : "") +
            '" data-command="' +
            esc(c.id) +
            '"><span><strong>' +
            esc(c.command) +
            "</strong><small>" +
            esc(c.category) +
            "</small></span>" +
            icon("arrow") +
            "</button>",
        )
        .join("") +
      (list.length > 100
        ? '<div class="smallnote" style="padding:16px">Showing the first 100 matches. Search or filter to narrow the reference list.</div>'
        : "")
    : '<div class="empty">No command references match.</div>';
  $("commandList")
    .querySelectorAll("button")
    .forEach(
      (b) =>
        (b.onclick = () => {
          selectedCommand = catalog.commands.findIndex(
            (c) => c.id === b.dataset.command,
          );
          state.commandId = b.dataset.command;
          delete state.customPreset;
          $("commandArgs").value = "";
          renderCommandSelection();
          renderCommands();
          persist();
        }),
    );
}
function renderCommandSelection() {
  if (selectedCommand === -1 && state.customPreset) {
    $("commandName").textContent = state.customPreset.title;
    $("commandParams").textContent =
      "Preset parameters: replace angle-bracket placeholders in the command.";
    renderCommandOutput();
    return;
  }
  const c = catalog.commands[selectedCommand];
  if (!c) return;
  $("commandName").textContent = c.command;
  $("commandParams").textContent =
    "Catalogue arguments: " + (c.params || "none listed") + " · " + c.category;
  renderCommandOutput();
}
function commandParts() {
  if (selectedCommand === -1 && state.customPreset)
    return {
      command: $("commandArgs").value,
      raw: $("commandArgs").value.replace(/^"|"$/g, ""),
    };
  const c = catalog.commands[selectedCommand],
    args = $("commandArgs").value.trim();
  return {
    command: c.bindCommand + (args ? " " + args : ""),
    raw: c.command + (args ? " " + args : ""),
  };
}
function renderCommandOutput() {
  const key = $("commandKey").value,
    { command, raw } = commandParts();
  const error = !validKey(key)
    ? "Enter a complete key combination."
    : /[\r\n]/.test(command)
      ? "Use a single command line."
      : hasPlaceholder(command)
        ? "Replace the angle-bracket placeholders first."
        : "";
  $("commandOutput").textContent =
    "/bind " + normalizeCombo(key) + " " + command;
  $("commandError").textContent = error;
  ["copyCommand", "addCommandPack"].forEach((id) => ($(id).disabled = !!error));
  $("unbindCommand").disabled = !validKey(key);
  $("copyRaw").disabled =
    /[\r\n]/.test(raw) || hasPlaceholder(raw) || !raw.trim();
  state.commandKey = key;
  state.commandArgs = $("commandArgs").value;
  persist();
}
function renderSay() {
  state.sayKey = $("sayKey").value;
  state.sayMessage = $("sayMessage").value;
  const error = !validKey(state.sayKey)
    ? "Enter a complete key combination."
    : !state.sayMessage.trim()
      ? "Write a message first."
      : "";
  $("sayOutput").textContent = buildSayLine(state.sayKey, state.sayMessage);
  $("sayError").textContent = error;
  ["copySay", "addSay"].forEach((id) => ($(id).disabled = !!error));
  $("unbindSay").disabled = !validKey(state.sayKey);
  persist();
}
function conflicts(item) {
  const other = state.pack.filter(
    (p) => p.id !== item.id && p.key === item.key,
  );
  const prior = state.personal.find((p) => p.key === item.key);
  return [
    other.length
      ? "Pack conflict: " +
        other.length +
        " other assignment(s) use " +
        item.key +
        "."
      : "",
    prior && prior.command !== item.command
      ? "Imported key will be replaced: " + prior.command
      : "",
  ].filter(Boolean);
}
function renderSetup() {
  refreshCounts();
  $("setupCount").textContent = state.pack.length + " selected";
  $("setupItems").innerHTML = state.pack.length
    ? state.pack
        .map(
          (p) =>
            '<div class="packrow"><div class="packtop"><strong>' +
            esc(p.title) +
            '</strong><button class="textbutton" data-remove-pack="' +
            esc(p.id) +
            '">Remove</button></div><code>' +
            esc("/bind " + p.key + " " + p.command) +
            "</code>" +
            conflicts(p)
              .map((c) => '<p class="error">' + esc(c) + "</p>")
              .join("") +
            "</div>",
        )
        .join("")
    : '<div class="empty">Your pack is empty. Add presets or your own combinations to prepare a set of commands.</div>';
  $("setupItems")
    .querySelectorAll("button")
    .forEach(
      (b) =>
        (b.onclick = () => {
          state.pack = state.pack.filter((p) => p.id !== b.dataset.removePack);
          persist();
          renderSetup();
        }),
    );
  [
    "copyPack",
    "copyUnbindPack",
    "downloadPack",
    "nativeFile",
    "loadCommand",
  ].forEach((id) => ($(id).disabled = !state.pack.length));
  $("restoreFile").disabled = !state.pack.length || !state.personal.length;
}
function packOutput(unbind = false) {
  return state.pack
    .map((p) =>
      unbind ? unbindLine(p.key) : "/bind " + p.key + " " + p.command,
    )
    .join("\n");
}
function download(name, text) {
  if (!text) {
    toast("Nothing to export.");
    return;
  }
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Download prepared: " + name);
}
function switchView(v) {
  if (!catalog) return;
  capturing = false;
  $("captureKey").textContent = "Capture key";
  $("toolSelect").value = v;
  document
    .querySelectorAll(".view")
    .forEach((el) => el.classList.add("hidden"));
  $(v + "View").classList.remove("hidden");
  document.querySelectorAll("#nav button").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === v);
    if (b.dataset.view === v) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  const titles = {
    library: [
      "Find it. Copy it. Bind it.",
      "Your Neverwinter shortcuts, ready for the next adventure.",
    ],
    builder: [
      "One key. Your combination.",
      "Choose your inputs, order your actions, and copy the resulting bind.",
    ],
    commands: [
      "Build the command you need.",
      "Explore the repository’s console references and supply your arguments.",
    ],
    say: [
      "Give your words a shortcut.",
      "Prepare a custom say message for your party, guild, or next run.",
    ],
    setup: [
      "Your setup, ready to review.",
      "Check conflicts, copy a pack, and keep a recovery path.",
    ],
  };
  $("pageTitle").textContent = titles[v][0];
  $("pageDesc").textContent = titles[v][1];
  history.replaceState(null, "", "#" + v);
  if (v === "setup") renderSetup();
  revealView($(v + "View"));
  decorateForms();
}
function analyze() {
  const input = $("personalBinds").value;
  if (input.length > 524288) {
    $("importResult").textContent = "Choose a file or text under 512 KB.";
    return;
  }
  const parsed = parseBindText(input);
  state.personal = resolveBindMap(parsed.entries);
  persist();
  $("importResult").textContent =
    state.personal.length +
    " active binds imported; " +
    parsed.ignored.length +
    " lines ignored. Only these supplied keys can be checked.";
  renderSetup();
  renderInspector();
}
let capturing = false;
function capture(e) {
  if (!capturing) return;
  e.preventDefault();
  if (e.key === "Escape") {
    capturing = false;
    $("captureKey").textContent = "Capture key";
    renderBuilderOutput();
    return;
  }
  if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) return;
  const map = {
    Space: "space",
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    Backspace: "backspace",
    Enter: "enter",
    Tab: "tab",
    Delete: "delete",
  };
  let key = e.code.startsWith("Numpad")
    ? "numpad" + e.code.slice(6).toLowerCase()
    : map[e.code] || e.key.toLowerCase();
  if (key === "+") {
    toast("Plus separates inputs. Enter the component keys in the field.");
    return;
  }
  const parts = [
    e.ctrlKey ? "ctrl" : "",
    e.altKey ? "alt" : "",
    e.shiftKey ? "shift" : "",
    key,
  ].filter(Boolean);
  $("builderKey").value = normalizeCombo(parts.join("+"));
  capturing = false;
  $("captureKey").textContent = "Capture key";
  renderBuilderOutput();
}
async function init() {
  try {
    const response = await fetch("/workbench/catalogue.json");
    if (!response.ok) throw Error();
    catalog = await response.json();
    state.saved = state.saved.filter(
      (id) =>
        typeof id === "string" && catalog.presets.some((p) => p.id === id),
    );
    state.pack = state.pack.filter(
      (p) =>
        p &&
        typeof p.id === "string" &&
        typeof p.title === "string" &&
        validKey(p.key) &&
        typeof p.command === "string",
    );
    state.chain = state.chain.filter(
      (a) =>
        a &&
        typeof a.id === "string" &&
        typeof a.label === "string" &&
        typeof a.fragment === "string" &&
        validateCustomFragment(a.fragment).ok,
    );
    state.personal = state.personal.filter(
      (p) => p && validKey(p.key) && typeof p.command === "string",
    );
    selected =
      catalog.presets.find((p) => p.title === "Summon VIP Bank Portal")?.id ||
      catalog.presets[0].id;
    makeOptions(
      $("classFilter"),
      [...new Set(catalog.presets.map((p) => p.className))],
      "All classes",
    );
    makeOptions(
      $("actionCategory"),
      [...new Set(catalog.actions.map((a) => a.category))],
      "All action categories",
    );
    makeOptions(
      $("commandCategory"),
      [...new Set(catalog.commands.map((c) => c.category))],
      "All command categories",
    );
    const packs = buildCatalogPacks(catalog.presets);
    $("quickPacks").innerHTML = packs
      .map(
        (p) =>
          '<button class="category" data-pack="' +
          esc(p.id) +
          '">' +
          esc(p.title) +
          " <small>" +
          p.count +
          "</small></button>",
      )
      .join("");
    $("quickPacks")
      .querySelectorAll("button")
      .forEach(
        (b) =>
          (b.onclick = () => {
            packFilter = packs.find((p) => p.id === b.dataset.pack).presetIds;
            category = "All";
            $("search").value = "";
            $("classFilter").value = "all";
            $("trustFilter").value = "all";
            savedOnly = false;
            renderLibrary();
          }),
      );
    $("builderKey").value = state.builderKey;
    $("sayKey").value = state.sayKey;
    $("sayMessage").value = state.sayMessage;
    $("commandKey").value = state.commandKey;
    $("commandArgs").value = state.commandArgs;
    const draft = resolveCommandDraft(state, catalog.commands, catalog.presets);
    selectedCommand = draft.index;
    if (draft.preset) state.customPreset = draft.preset;
    else {
      delete state.customPreset;
      if (draft.clearArguments) {
        $("commandArgs").value = "";
        state.commandArgs = "";
      }
    }
    $("loadState").classList.add("hidden");
    renderLibrary();
    renderActions();
    renderChain();
    renderCombinations();
    renderCopies();
    renderCommands();
    renderCommandSelection();
    renderSay();
    renderSetup();
    if (!storageWritable)
      toast(
        "Stored workbench data is unreadable and has been preserved. Export it from Advanced tools recovery before replacing it.",
      );
    const hash = location.hash.slice(1);
    switchView(
      ["library", "builder", "commands", "say", "setup"].includes(hash)
        ? hash
        : "library",
    );
  } catch (e) {
    $("loadState").textContent =
      "The catalogue could not load. Reload to try again.";
    console.error(e);
  }
}
document
  .querySelectorAll("#nav button")
  .forEach((b) => (b.onclick = () => switchView(b.dataset.view)));
$("search").oninput = () => {
  limit = 18;
  renderLibrary();
};
$("classFilter").onchange = () => {
  limit = 18;
  renderLibrary();
};
$("trustFilter").onchange = () => {
  limit = 18;
  renderLibrary();
};
$("savedFilter").onclick = () => {
  savedOnly = !savedOnly;
  renderLibrary();
};
$("showMore").onclick = () => {
  limit += 18;
  renderLibrary();
};
$("resetSearch").onclick = () => {
  $("search").value = "";
  $("classFilter").value = "all";
  $("trustFilter").value = "all";
  category = "All";
  savedOnly = false;
  packFilter = null;
  limit = 18;
  renderLibrary();
};
$("actionSearch").oninput = renderActions;
$("actionCategory").onchange = renderActions;
$("builderKey").oninput = renderBuilderOutput;
$("captureKey").onclick = ()=>{$("builderKey").focus();toast("Press a key or click the field again for a mouse button. + joins inputs.");};
$("clearChain").onclick = () => {
  checkpoint();
  state.chain = [];
  persist();
  renderChain();
};
$("addFragment").onclick = () => {
  if ($("fragment").value.length > 2000 || state.chain.length >= 100) {
    $("fragmentError").textContent =
      "Use at most 2,000 characters and 100 actions.";
    return;
  }
  const result = validateCustomFragment($("fragment").value);
  $("fragmentError").textContent = result.message;
  if (!result.ok) return;
  checkpoint();
  state.chain.push({
    id: newId(),
    label: "Custom fragment",
    fragment: $("fragment").value.trim().replace(/^\//, ""),
    source: "User input — unverified",
  });
  $("fragment").value = "";
  persist();
  renderChain();
};
$("copyChain").onclick = (e) =>
  copy($("builderOutput").textContent, "Combined bind", e.currentTarget);
$("unbindChain").onclick = (e) =>
  copy(unbindLine(state.builderKey), "Unbind", e.currentTarget);
$("saveChain").onclick = () =>
  addPack("Custom action combination", state.builderKey, chainCommand());
$("commandSearch").oninput = renderCommands;
$("commandCategory").onchange = renderCommands;
$("commandKey").oninput = renderCommandOutput;
$("commandArgs").oninput = renderCommandOutput;
$("copyCommand").onclick = (e) =>
  copy($("commandOutput").textContent, "Bind", e.currentTarget);
$("unbindCommand").onclick = (e) =>
  copy(unbindLine($("commandKey").value), "Unbind", e.currentTarget);
$("copyRaw").onclick = (e) =>
  copy(commandParts().raw, "Console command", e.currentTarget);
$("addCommandPack").onclick = () =>
  addPack(
    $("commandName").textContent,
    $("commandKey").value,
    commandParts().command,
  );
$("reconcile").onclick = () => {
  if ($("cmdlist").value.length > 524288) {
    $("reconcileResult").textContent = "Use text under 512 KB.";
    return;
  }
  const r = reconcileCmdlist($("cmdlist").value, catalog.commands);
  $("reconcileResult").textContent =
    r.pastedCount +
    " names parsed; " +
    r.matched.length +
    " catalogue matches; " +
    r.missingFromBindForge.length +
    " research candidates. Candidates: " +
    (r.missingFromBindForge.slice(0, 15).join(", ") || "none") +
    ". Absence here does not prove a command is unsupported.";
};
$("sayKey").oninput = renderSay;
$("sayMessage").oninput = renderSay;
$("copySay").onclick = (e) =>
  copy($("sayOutput").textContent, "Chat bind", e.currentTarget);
$("unbindSay").onclick = (e) =>
  copy(unbindLine(state.sayKey), "Unbind", e.currentTarget);
$("addSay").onclick = () => {
  const line = buildSayLine(state.sayKey, state.sayMessage);
  addPack(
    "Custom say message",
    state.sayKey,
    line.slice(("/bind " + normalizeCombo(state.sayKey) + " ").length),
  );
};
$("copyPack").onclick = (e) => copy(packOutput(), "Bind pack", e.currentTarget);
$("copyUnbindPack").onclick = (e) =>
  copy(packOutput(true), "Unbind pack", e.currentTarget);
$("downloadPack").onclick = () =>
  download("bindforge-commands.txt", packOutput());
$("nativeFile").onclick = () => {
  const f = buildNativeBindFile(state.pack);
  download("bindforge-setup.txt", f.content);
  $("nativeStatus").textContent =
    f.skipped.length +
    " entries skipped; test the exported file in your client.";
};
$("loadCommand").onclick = (e) =>
  copy(
    buildBindLoadCommand("bindforge-setup.txt"),
    "Load command",
    e.currentTarget,
  );
$("restoreFile").onclick = () => {
  const f = buildNativeRestoreFile(
    state.pack.map((p) => p.key),
    state.personal,
  );
  if (f.content) download("bindforge-imported-restore.txt", f.content);
  $("nativeStatus").textContent =
    f.unresolvedKeys.length +
    " requested keys lack imported history; " +
    f.skipped.length +
    " entries skipped. Only evidenced bindings are exported.";
};
$("analyzeBinds").onclick = analyze;
$("importKeymap").onchange = async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  if (f.size > 524288) {
    $("importResult").textContent = "Choose a text file under 512 KB.";
    return;
  }
  try {
    $("personalBinds").value = await f.text();
    analyze();
  } catch {
    $("importResult").textContent =
      "Could not read that file. Try a plain-text export.";
  }
};
$("backup").onclick = () =>
  download(
    "bindforge-workbench-backup.json",
    storageWritable
      ? JSON.stringify({ version: 3, state }, null, 2)
      : localStorage.getItem(WORKBENCH_KEY) ||
          localStorage.getItem("bf-redesign-v3") ||
          "",
  );
let settingsTrigger = null;
function openSettings(e) {
  capturing = false;
  $("captureKey").textContent = "Capture key";
  settingsTrigger = e.currentTarget;
  $("settings").showModal();
}
$("openSettings").onclick = openSettings;
$("readingSettings").onclick = openSettings;
$("closeSettings").onclick = () => $("settings").close();
$("settings").addEventListener("close", () => settingsTrigger?.focus());
for (const [id, cls] of [
  ["largeText", "large-text"],
  ["highContrast", "high-contrast"],
]) {
  $(id).checked = state[id];
  document.body.classList.toggle(cls, state[id]);
  $(id).onchange = () => {
    state[id] = $(id).checked;
    document.body.classList.toggle(cls, state[id]);
    persist();
  };
}
document.addEventListener("keydown", (e) => {
  if (capturing) {
    capture(e);
    return;
  }
  if (
    e.key === "/" &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName) &&
    !$("settings").open
  ) {
    e.preventDefault();
    switchView("library");
    $("search").focus();
  }
});
$("toolSelect").onchange = () => switchView($("toolSelect").value);
$("themeSelect").value = state.theme;
document.documentElement.dataset.theme = state.theme;
$("themeSelect").onchange = () => {
  state.theme = $("themeSelect").value;
  document.documentElement.dataset.theme = state.theme;
  persist();
};
$("reduceMotion").checked = state.reduceMotion;
configureMotion(state.reduceMotion);
$("reduceMotion").onchange = () => {
  state.reduceMotion = $("reduceMotion").checked;
  document.body.classList.toggle("reduce-motion", state.reduceMotion);
  configureMotion(state.reduceMotion);
  persist();
};
document.body.classList.toggle("reduce-motion", state.reduceMotion);
function decorateForms() {
  document
    .querySelectorAll("input:not([type=checkbox]):not([type=file]),textarea")
    .forEach((el) => el.classList.add("form-control"));
  document
    .querySelectorAll("select")
    .forEach((el) => el.classList.add("form-select"));
  document
    .querySelectorAll(".btn.primary")
    .forEach((el) => el.classList.add("btn-primary"));
  document
    .querySelectorAll(".btn.quiet")
    .forEach((el) => el.classList.add("btn-outline-secondary"));
  document.querySelectorAll(".row-actions").forEach((row) => {
    const title = row
      .closest("article")
      ?.querySelector(".preset-title")?.textContent;
    row
      .querySelector("[data-do=bind]")
      ?.setAttribute("aria-label", "Copy bind for " + title);
    row
      .querySelector("[data-do=unbind]")
      ?.setAttribute("aria-label", "Copy unbind for " + title);
  });
}
installKeyCapture();
init().then(()=>{installGuide(switchView);if(replayGuide)document.getElementById("openGuide").click();loadMotion();});

$("undoChain").onclick = () => {
  if (!state.past.length) return;
  state.future = [structuredClone(state.chain), ...state.future].slice(0, 50);
  state.chain = state.past.pop();
  persist();
  renderChain();
};
$("redoChain").onclick = () => {
  if (!state.future.length) return;
  state.past = [...state.past, structuredClone(state.chain)].slice(-50);
  state.chain = state.future.shift();
  persist();
  renderChain();
};
$("saveCombination").onclick = () => {
  const name = $("combinationName").value.trim();
  if (!name || !state.chain.length) {
    toast("Name the combination and add at least one action.");
    return;
  }
  if (state.combinations.length >= 30) {
    toast("Remove a saved combination before adding another. Limit: 30.");
    return;
  }
  state.combinations.push({
    name,
    key: state.builderKey,
    chain: structuredClone(state.chain),
  });
  $("combinationName").value = "";
  persist();
  renderCombinations();
};
$("repeatCopy").onclick = (e) => {
  const item = readCopies().items[0];
  if (item) copy(item.text, item.label, e.currentTarget);
};
$("repeatShortcut").onchange = () =>
  saveCopies({ ...readCopies(), shortcutEnabled: $("repeatShortcut").checked });
document.addEventListener("keydown", (e) => {
  if (
    e.altKey &&
    e.shiftKey &&
    !e.ctrlKey &&
    !e.metaKey &&
    e.code === "KeyR" &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName) &&
    !e.target.isContentEditable &&
    !document.querySelector("dialog[open]")
  ) {
    const h = readCopies();
    if (h.shortcutEnabled && h.items.length) {
      e.preventDefault();
      copy(h.items[0].text, h.items[0].label);
    }
  }
});
window.addEventListener("storage", (event) => {
  if (event.key === WORKBENCH_KEY) {
    toast("Workspace changed in another tab. Reload to use that version.");
    storageWritable = false;
  }
  if (event.key === COPY_HISTORY_KEY) renderCopies();
});
