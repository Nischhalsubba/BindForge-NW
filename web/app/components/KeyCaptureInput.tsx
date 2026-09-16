"use client";

import { useId } from "react";
import type { InputHTMLAttributes, KeyboardEvent, MouseEvent } from "react";
import {
  appendComboToken,
  armComboSeparator,
  comboAwaitingNext,
  comboFromKeyboardLike,
  comboFromMouseLike,
  comboTokens,
  removeLastComboToken,
  sanitizeComboInput,
} from "../lib/key-capture.mjs";

type KeyCaptureInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: string;
  onValueChange: (value: string) => void;
  hint?: string;
};

const modifierKeys = new Set(["Control", "Shift", "Alt", "Meta"]);
const tokenLabels: Record<string, string> = {
  ctrl: "Ctrl",
  alt: "Alt",
  shift: "Shift",
  lbutton: "Left Click",
  rbutton: "Right Click",
  mbutton: "Middle Click",
  escape: "Esc",
  backspace: "Backspace",
  enter: "Enter",
  space: "Space",
  tab: "Tab",
  insert: "Insert",
  delete: "Delete",
  home: "Home",
  end: "End",
  pageup: "Page Up",
  pagedown: "Page Down",
  up: "Up",
  down: "Down",
  left: "Left",
  right: "Right",
  capslock: "Caps Lock",
  numlock: "Num Lock",
  scrolllock: "Scroll Lock",
  printscreen: "Print Screen",
  minus: "-",
  equals: "=",
  lbracket: "[",
  rbracket: "]",
  backslash: "\\",
  semicolon: ";",
  apostrophe: "'",
  grave: "`",
  comma: ",",
  period: ".",
  slash: "/",
  numpaddecimal: "Numpad .",
  numpaddivide: "Numpad /",
  numpadmultiply: "Numpad *",
  numpadsubtract: "Numpad -",
  numpadenter: "Numpad Enter",
};

function displayToken(token: string) {
  const clean = token.trim().toLowerCase();
  if (tokenLabels[clean]) return tokenLabels[clean];
  const numpadDigit = /^numpad([0-9])$/.exec(clean);
  if (numpadDigit) return `Numpad ${numpadDigit[1]}`;
  if (/^f([1-9]|1[0-9]|2[0-4])$/.test(clean)) return clean.toUpperCase();
  if (clean.length === 1) return clean.toUpperCase();
  return token;
}

export function KeyCaptureInput({
  value,
  onValueChange,
  hint = "Press a key or mouse button. Use either + key to add another key. Hold Ctrl / Alt / Shift with another input to merge them automatically. Backspace removes the last captured part.",
  className,
  placeholder,
  ...props
}: KeyCaptureInputProps) {
  const hintId = useId();
  const cleanValue = sanitizeComboInput(value);
  const tokens = comboTokens(cleanValue);
  const awaitingNext = comboAwaitingNext(cleanValue);

  function capture(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || event.repeat) return;
    if (event.key === "Tab") return;

    // Modifier-only presses arm a modified key/mouse capture without replacing the current value.
    if (modifierKeys.has(event.key)) {
      event.preventDefault();
      return;
    }

    // When a combination already exists, Backspace edits the structured sequence instead of
    // becoming a new binding. Backspace remains capturable when the field itself is empty.
    if (event.key === "Backspace" && cleanValue) {
      event.preventDefault();
      event.stopPropagation();
      onValueChange(removeLastComboToken(cleanValue));
      return;
    }

    // Both physical + keys are syntax, not bindable keys. They put the builder into a visible
    // "waiting for next key" state while preserving everything already captured.
    const isPlusSeparator = event.key === "+" || event.code === "NumpadAdd";
    if (isPlusSeparator) {
      event.preventDefault();
      event.stopPropagation();
      onValueChange(armComboSeparator(cleanValue));
      return;
    }

    const combo = comboFromKeyboardLike({
      code: event.code,
      key: event.key,
      location: event.location,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
    });

    if (!combo) return;
    event.preventDefault();
    event.stopPropagation();
    onValueChange(appendComboToken(cleanValue, combo));
  }

  function captureMouse(event: MouseEvent<HTMLInputElement>) {
    const alreadyFocused = document.activeElement === event.currentTarget;
    const hasModifier = event.ctrlKey || event.altKey || event.shiftKey;

    // A normal first left-click focuses the builder. Once focused, the next click is a deliberate
    // mouse binding. Modified clicks are explicit enough to capture immediately.
    if (event.button === 0 && !alreadyFocused && !hasModifier) return;

    const combo = comboFromMouseLike({
      button: event.button,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
    });

    if (!combo) return;
    event.preventDefault();
    event.stopPropagation();
    if (!alreadyFocused) event.currentTarget.focus({ preventScroll: true });
    onValueChange(appendComboToken(cleanValue, combo));
  }

  const spokenCombination = tokens.map(displayToken).join(" plus ");

  return (
    <>
      <div
        className={`key-combination-builder${awaitingNext ? " is-awaiting" : ""}`}
        data-key-combination-builder="true"
        data-waiting-for-key={awaitingNext ? "true" : "false"}
      >
        <div aria-hidden="true" className="key-combination-tokens">
          {tokens.length ? tokens.map((token, index) => (
            <span className="key-combination-part" key={`${token}-${index}`}>
              {index ? <span className="key-combination-plus">+</span> : null}
              <kbd className="key-combination-keycap" data-key-token={token}>{displayToken(token)}</kbd>
            </span>
          )) : <span className="key-combination-placeholder">{placeholder || "Press a key or mouse button"}</span>}
          {awaitingNext ? (
            <span className="key-combination-part key-combination-pending">
              <span className="key-combination-plus">+</span>
              <span className="key-combination-next">Next key…</span>
            </span>
          ) : null}
        </div>
        <input
          {...props}
          aria-describedby={[props["aria-describedby"], hintId].filter(Boolean).join(" ")}
          className={["key-combination-capture", className].filter(Boolean).join(" ")}
          data-key-capture="true"
          onChange={(event) => onValueChange(sanitizeComboInput(event.target.value))}
          onContextMenu={(event) => {
            if (document.activeElement === event.currentTarget) event.preventDefault();
          }}
          onKeyDown={capture}
          onMouseDown={captureMouse}
          spellCheck={false}
          value={cleanValue}
        />
      </div>
      <small className="key-capture-hint" id={hintId}>{hint}</small>
      <span aria-live="polite" className="sr-only">
        {spokenCombination ? `Key combination: ${spokenCombination}${awaitingNext ? ". Waiting for the next key." : "."}` : "Key combination empty."}
      </span>
    </>
  );
}
