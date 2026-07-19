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

function updateCommandPreview(card: HTMLElement, input: HTMLInputElement) {
  const output = card.querySelector<HTMLElement>(".bind-output");
  if (!output) return;

  const key = normalizeCombo(input.value);
  if (!key) return;

  card.dataset.normalizedKey = key;
  const current = output.textContent ?? "";
  const next = current.startsWith("/unbind ")
    ? current.replace(/^\/unbind\s+\S+/, `/unbind ${key}`)
    : current.replace(/^\/bind\s+\S+/, `/bind ${key}`);

  if (next !== current) output.textContent = next;
}

function findPresetInput(card: HTMLElement) {
  return card.querySelector<HTMLInputElement>(".key-field input");
}

export default function KeybindInputSync() {
  useEffect(() => {
    function syncCard(card: HTMLElement) {
      const input = findPresetInput(card);
      if (input) updateCommandPreview(card, input);
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

      const output = card.querySelector<HTMLElement>(".bind-output");
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

        const input = findPresetInput(card);
        if (input) updateCommandPreview(card, input);
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
