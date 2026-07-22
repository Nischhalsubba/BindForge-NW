export type CopyResult = {
  ok: boolean;
  method: "clipboard" | "fallback" | "none";
};

function fallbackCopy(text: string): boolean {
  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "-9999px auto auto -9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

export async function copyTextSafely(text: string): Promise<CopyResult> {
  if (!text) return { ok: false, method: "none" };

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return { ok: true, method: "clipboard" };
    }
  } catch {
    // Continue to the DOM fallback below.
  }

  const copied = fallbackCopy(text);
  return { ok: copied, method: copied ? "fallback" : "none" };
}
