"use client";

import type { InputHTMLAttributes, KeyboardEvent, MouseEvent } from "react";
import { comboFromKeyboardLike, comboFromMouseLike } from "../lib/key-capture.mjs";

type KeyCaptureInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: string;
  onValueChange: (value: string) => void;
  hint?: string;
};

const modifierKeys = new Set(["Control", "Shift", "Alt", "Meta"]);

export function KeyCaptureInput({ value, onValueChange, hint = "Click once to focus, then press a keyboard key or mouse button. Ctrl / Alt / Shift combinations are merged automatically, for example Ctrl+5 or Ctrl+Left Click.", ...props }: KeyCaptureInputProps) {
  function capture(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || event.repeat) return;
    if (event.key === "Tab") return;
    if (modifierKeys.has(event.key)) {
      event.preventDefault();
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
    onValueChange(combo);
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
    onValueChange(combo);
  }

  return (
    <>
      <input
        {...props}
        data-key-capture="true"
        onChange={(event) => onValueChange(event.target.value)}
        onContextMenu={(event) => {
          if (document.activeElement === event.currentTarget) event.preventDefault();
        }}
        onKeyDown={capture}
        onMouseDown={captureMouse}
        spellCheck={false}
        value={value}
      />
      <small className="key-capture-hint">{hint}</small>
    </>
  );
}
