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
  l