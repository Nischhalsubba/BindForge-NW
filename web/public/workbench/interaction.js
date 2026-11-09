import {
  captureKeyboard,
  captureMouse,
  captureWheel,
} from "./engine/workbench-capture.mjs";
const selector = ".keyfield,#builderKey,#commandKey,#sayKey";
export function installKeyCapture() {
  const field = (e) =>
    e.target instanceof HTMLInputElement && e.target.matches(selector)
      ? e.target
      : null;
  const update = (input, value) => {
    if (value === null) return;
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };
  document.addEventListener("focusin", (e) => {
    const input = field(e);
    if (input) {
      input.setAttribute(
        "aria-description",
        "Press a key or click a mouse button again to capture. Plus joins keys; Tab moves to the next control.",
      );
      input.classList.add("capture-active");
    }
  });
  document.addEventListener("focusout", (e) =>
    field(e)?.classList.remove("capture-active"),
  );
  document.addEventListener(
    "keydown",
    (e) => {
      const input = field(e);
      if (!input) return;
      const next = captureKeyboard(input.value, e);
      if (next === null) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      update(input, next);
    },
    true,
  );
  document.addEventListener(
    "mousedown",
    (e) => {
      const input = field(e);
      if (!input) return;
      const focused = document.activeElement === input;
      if (e.button === 0 && !focused && !e.ctrlKey && !e.altKey && !e.shiftKey)
        return;
      const next = captureMouse(input.value, e);
      if (next === null) return;
      e.preventDefault();
      input.focus({ preventScroll: true });
      update(input, next);
    },
    true,
  );
  document.addEventListener("contextmenu", (e) => {
    if (field(e)) e.preventDefault();
  });
  document.addEventListener("auxclick", (e) => {
    if (field(e)) e.preventDefault();
  });
  document.addEventListener(
    "wheel",
    (e) => {
      const input = field(e);
      if (!input || document.activeElement !== input) return;
      e.preventDefault();
      update(input, captureWheel(input.value, e.deltaY, e));
    },
    { passive: false },
  );
}
export function installGuide(switchView) {
  const $ = (id) => document.getElementById(id),
    key = "bindforge-nw:onboarding:v1";
  let step = 0;
  const steps = [
    [
      "Find a shortcut",
      "Search for what you want to do. Try “VIP bank”, “inventory” or your class name.",
      "library",
      "search",
    ],
    [
      "Choose your key",
      "Click a key field, then press a key or click again for a mouse button. Hold Ctrl / Alt / Shift, or press + between inputs to build a combination. Tab moves between controls.",
      "library",
      "key-capture",
    ],
    [
      "Copy and apply",
      "Use Copy bind, paste the command into Neverwinter chat and press Enter. Test it in game. Copy unbind removes the assignment; it does not restore an older command.",
      "library",
      "copy-bind",
    ],
    [
      "Keep your setup",
      "Add shortcuts to My setup, review conflicts and export a backup. Optional email accounts save approved workspaces across devices.",
      "setup",
      "personalBinds",
    ],
  ];
  function show() {
    const [title, text, view, target] = steps[step];
    $("guideTitle").textContent = title;
    $("guideText").textContent = text;
    $("guideProgress").textContent = `Step ${step + 1} of ${steps.length}`;
    $("guideBack").disabled = step === 0;
    $("guideNext").textContent =
      step === steps.length - 1 ? "Finish guide" : "Next";
    $("guideTry").onclick = () => {
      switchView(view);
      const control =
        target === "key-capture"
          ? document.querySelector(".keyfield")
          : target === "copy-bind"
            ? document.querySelector("[data-do=bind]")
            : document.getElementById(target);
      control?.focus({ preventScroll: true });
      control?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "center",
      });
    };
  }
  function open() {
    step = 0;
    $("guidePanel").classList.remove("hidden");
    $("welcomeGuide").classList.add("hidden");
    show();
    $("guideTitle").focus({ preventScroll: true });
  }
  function dismiss() {
    try {
      localStorage.setItem(key, "done");
    } catch {}
    $("guidePanel").classList.add("hidden");
    $("welcomeGuide").classList.add("hidden");
    $("openGuide").focus({ preventScroll: true });
  }
  $("openGuide").onclick = open;
  $("startGuide").onclick = open;
  $("skipGuide").onclick = dismiss;
  $("guideClose").onclick = dismiss;
  $("guideBack").onclick = () => {
    step = Math.max(0, step - 1);
    show();
  };
  $("guideNext").onclick = () => {
    if (step === steps.length - 1) dismiss();
    else {
      step++;
      show();
    }
  };
  try {
    if (!localStorage.getItem(key))
      $("welcomeGuide").classList.remove("hidden");
  } catch {
    $("welcomeGuide").classList.remove("hidden");
  }
}
