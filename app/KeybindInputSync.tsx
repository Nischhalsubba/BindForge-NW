"use client";

import { useEffect } from "react";

const modifierAliases: Record<string, "ctrl" | "alt" | "shift"> = {
  ctrl: "ctrl",
  control: "ctrl",
  lctrl: "ctrl",
  leftctrl: "ctrl",
  leftcontrol: "ctrl",
  rctrl: "ctrl",
  rightctrl: "ctrl",
  rightcontrol: "ctrl",
  alt: "alt",
  lalt: "alt",
  leftalt: "alt",
  ralt: "alt",
  rightalt: "alt",
  shift: "shift",
  lshift: "shift",
  leftshift: "shift",
  rshift: "shift",
  rightshift: "shift",
};

function normalizeKeyPart(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function normalizeCombo(value: string) {
  const parts = value
    .split("+")
    .map(normalizeKeyPart)
    .filter(Boolean);

  const modifiers: Array<"ctrl" | "alt" | "shift"> = [];
  const keys: string[] = [];

  for (const part of parts) {
    const modifier = modifierAliases[part];
    if (modifier) {
      if (!modifiers.includes(modifier)) modifiers.push(modifier);
    } else {
      keys.push(part);
    }
  }

  const orderedModifiers = (["ctrl", "alt", "shift"] as const).filter((modifier) =>
    modifiers.includes(modifier),
  );

  return [...orderedModifiers, ...keys].join("+");
}

function findPresetInput(card: HTMLElement) {
  return card.querySelector<HTMLInputElement>(".key-field input");
}

function findOutput(card: HTMLElement) {
  return card.querySelector<HTMLElement>(".bind-output");
}

function commandWithKey(command: string, key: string) {
  return command.replace(/^\/(?:un)?bind\s+\S+/, `/bind ${key}`);
}

function applyCardMode(card: HTMLElement) {
  const output = findOutput(card);
  const input = findPresetInput(card);
  if (!output || !input) return;

  const key = normalizeCombo(input.value);
  if (!key) return;

  const current = output.textContent ?? "";
  const bindCommand = commandWithKey(current, key);
  const isUnbind = card.dataset.unbind === "true";

  card.dataset.normalizedKey = key;
  card.dataset.bindCommand = bindCommand;

  const next = isUnbind ? bindCommand.replace(/^\/bind\b/, "/unbind") : bindCommand;
  if (next !== current) output.textContent = next;

  const copyButton = card.querySelector<HTMLButtonElement>(".copy-button");
  if (copyButton) copyButton.textContent = isUnbind ? "Copy unbind" : "Copy bind";
}

function createToggle(card: HTMLElement) {
  if (card.querySelector(".card-unbind-toggle")) return;

  const output = findOutput(card);
  if (!output) return;

  const row = document.createElement("label");
  row.className = "card-unbind-toggle";
  row.style.display = "flex";
  row.style.alignItems = "center";
  row.style.justifyContent = "space-between";
  row.style.gap = "12px";
  row.style.margin = "12px 0 8px";
  row.style.fontSize = "14px";
  row.style.fontWeight = "700";
  row.style.cursor = "pointer";

  const text = document.createElement("span");
  text.textContent = "Unbind";

  const switchTrack = document.createElement("span");
  switchTrack.style.position = "relative";
  switchTrack.style.display = "inline-flex";
  switchTrack.style.width = "44px";
  switchTrack.style.height = "24px";
  switchTrack.style.flexShrink = "0";
  switchTrack.style.borderRadius = "999px";
  switchTrack.style.background = "#c9c4ba";
  switchTrack.style.transition = "background 160ms ease";

  const knob = document.createElement("span");
  knob.style.position = "absolute";
  knob.style.top = "3px";
  knob.style.left = "3px";
  knob.style.width = "18px";
  knob.style.height = "18px";
  knob.style.borderRadius = "50%";
  knob.style.background = "#ffffff";
  knob.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.28)";
  knob.style.transition = "transform 160ms ease";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "card-unbind-checkbox";
  checkbox.setAttribute("aria-label", "Generate unbind command for this keybind");
  checkbox.style.position = "absolute";
  checkbox.style.inlineSize = "1px";
  checkbox.style.blockSize = "1px";
  checkbox.style.opacity = "0";

  checkbox.addEventListener("change", () => {
    card.dataset.unbind = checkbox.checked ? "true" : "false";
    switchTrack.style.background = checkbox.checked ? "#2f654f" : "#c9c4ba";
    knob.style.transform = checkbox.checked ? "translateX(20px)" : "translateX(0)";
    applyCardMode(card);
  });

  switchTrack.append(checkbox, knob);
  row.append(text, switchTrack);
  output.before(row);
}

export default function KeybindInputSync() {
  useEffect(() => {
    function syncCard(card: HTMLElement) {
      createToggle(card);
      applyCardMode(card);
    }

    function handleInput(event: Event) {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;

      const card = input.closest<HTMLElement>(".bind-card");
      if (!card || !input.matches(".key-field input")) return;

      window.requestAnimationFrame(() => syncCard(card));
    }

    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const card = target.closest<HTMLElement>(".bind-card");
      if (!card) return;

      if (target.closest(".reset-button")) {
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => syncCard(card)));
        return;
      }

      if (!target.closest(".copy-button")) return;

      const output = findOutput(card);
      if (!output?.textContent) return;

      event.preventDefault();
      event.stopPropagation();

      void navigator.clipboard.writeText(output.textContent);

      const title = card.querySelector("h4")?.textContent ?? "keybind";
      const status = document.querySelector<HTMLElement>('[role="status"]');
      if (status) {
        status.textContent = `Copied ${title}.`;
        window.setTimeout(() => {
          if (status.textContent === `Copied ${title}.`) status.textContent = "";
        }, 1800);
      }
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const output =
          mutation.target instanceof Element
            ? mutation.target.closest<HTMLElement>(".bind-output")
            : mutation.target.parentElement?.closest<HTMLElement>(".bind-output");
        const card = output?.closest<HTMLElement>(".bind-card");
        if (!card || !card.dataset.normalizedKey) continue;

        applyCardMode(card);
      }
    });

    document.addEventListener("input", handleInput, true);
    document.addEventListener("click", handleClick, true);
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });

    document.querySelectorAll<HTMLElement>(".bind-card").forEach(syncCard);

    return () => {
      document.removeEventListener("input", handleInput, true);
      document.removeEventListener("click", handleClick, true);
      observer.disconnect();
    };
  }, []);

  return null;
}
