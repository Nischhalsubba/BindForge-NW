"use client";

import type { InputHTMLAttributes, KeyboardEvent } from "react";
import { comboFromKeyboardLike } from "../lib/key-capture.mjs";

type KeyCaptureInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  value: string;
  onValueChange: (value: string) => void;
  hint?: string;
};

const modifierKeys = new Set(["Control", "Shift", "Alt", "Meta"]);

export function KeyCaptureInput({ value, onValueChange, hint = "Press a key or Ctrl / Alt / Shift combo. Numpad keys are detected automatically.", ...props }: KeyCaptureInputProps) {
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

  return (
    <>
      <input
        {...props}
        data-key-capture="true"
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={capture}
        spellCheck={false}
        value={value}
      />
      <small className="key-capture-hint">{hint}</small>
    </>
  );
}
