"use client";

import type { InputHTMLAttributes, KeyboardEvent, MouseEvent } from "react";
import { comboFromKeyboardLike, comboFromMouseLike } from "../lib/key-capture.mjs";

type KeyCaptureInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: string;
  onValueChange: (value: string) => void;
  hint?: string;
};

const modifierKeys = new Set(["Control", "Shift", "Alt", "Meta"]);
const separatorOnly = /^\s*\++\s*$/;

function sanitizeTypedCombo(value: string) {
  const compactSeparators = value.replace(/\s*\+\s*/g, "+").replace(/\+{2,}/g, "+");
  return separatorOnly.test(compactSeparators) ? "" : compactSeparators;
}

function appendCapturedToken(currentValue: string, token: string) {
  const current = sanitizeTypedCombo(currentValue).trim();
  if (!current.endsWith("+")) return token;
  const prefix = current.slice(0, -1).trim();
  return prefix ? `${prefix}+${token}` : token;
}

export function KeyCaptureInput({ value, onValueChange, hint = "Click once to focus, then press a key or mouse button. To merge keys, press the first key, then either + key, then the next key. Ctrl / Alt / Shift held with another key are merged automatically too. + is only a separator and is never assigned by itself.", ...props }: KeyCaptureInputProps) {
  function capture(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || event.repeat) return;
    if (event.key === "Tab") return;

    // On most keyboards the regular + character is Shift+=. Ignore the Shift keydown itself so
    // the current capture stays intact, then use either physical + key to arm the next merge.
    if (modifierKeys.has(event.key)) {
      event.preventDefault();
      return;
    }

    // Both the number-row + and numpad + are syntax used to join captured keys. Pressing either
    // after an existing key leaves a visible trailing separator (for example "5+") so the next
    // keyboard or mouse input is appended instead of replacing the first key.
    const isPlusSeparator = event.key === "+" || event.code === "NumpadAdd";
    if (isPlusSeparator) {
      event.preventDefault();
      event.stopPropagation();
      const current = sanitizeTypedCombo(value).trim();
      if (current && !current.endsWith("+")) onValueChange(`${current}+`);
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
    onValueChange(appendCapturedToken(value, combo));
  }

  function captureMouse(event: MouseEvent<HTMLInputElement>) {
    const alreadyFocused = document.activeElement === event.currentTarget;
    const hasModifier = event.ctrlKey || event.altKey || event.shiftKey;

    // A normal first left-click should focus the field instead of immediately binding lbutton.
    // Once focused, the next left-click is an intentional mouse capture. Modified clicks are
    // explicit enough to capture immediately.
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
    onValueChange(appendCapturedToken(value, combo));
  }

  return (
    <>
      <input
        {...props}
        data-key-capture="true"
        onChange={(event) => onValueChange(sanitizeTypedCombo(event.target.value))}
        onContextMenu={(event) => {
          if (document.activeElement === event.currentTarget) event.preventDefault();
        }}
        onKeyDown={capture}
        onMouseDown={captureMouse}
        spellCheck={false}
        value={sanitizeTypedCombo(value)}
      />
      <small className="key-capture-hint">{hint}</small>
    </>
  );
}
