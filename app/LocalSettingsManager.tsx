"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const STORAGE_KEY = "bindforge-nw:settings:v1";

type SavedSettings = {
  version: 1;
  savedAt: string;
  keys: Record<string, string>;
  filters: {
    className: string;
    actionType: string;
    difficulty: string;
    search: string;
    mode: "bind" | "unbind";
  };
  commandLab: {
    key: string;
    extraText: string;
    keySearch: string;
    keyCategory: string;
    commandSearch: string;
    commandCategory: string;
    showRisky: boolean;
  };
};

const emptySettings: SavedSettings = {
  version: 1,
  savedAt