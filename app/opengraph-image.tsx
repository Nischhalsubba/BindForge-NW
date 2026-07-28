import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Neverwinter Keybind builder designed and developed by Archew";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#efe7d2",
          color: "#15140f",
          fontFamily: "Arial, sans-serif",
          padding: "54px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: "24px", border: "1px solid rgba(21,20,15,.18)" }} />
        <div style={{ display: "flex", width: "100%", gap: "48px", alignItems: "center", zIndex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", width: "58%", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#15140f",
                  color: "#efe7d2",
                  border: "3px solid #ed6f5c",
                  fontSize: "34px",
                  fontWeight: 900,
                  letterSpacing: "-0.06em",
                }}
              >
                NW
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "18px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#8b8676" }}>
                  Neverwinter utility
                </span>
                <span style={{ fontSize: "46px", fontWeight: 900, letterSpacing: "-0.04em" }}>Neverwinter Keybind</span>
              </div>
            </div>
            <div style={{ fontSize: "62px", fontWeight: 900, lineHeight: 0.98, letterSpacing: "-0.055em" }}>
              Build keybinds with clarity<span style={{ color: "#ed6f5c" }}>.</span>
            </div>
            <div style={{ fontSize: "24px", lineHeight: 1.45, color: "#5a5448" }}>
              Search presets, choose a safer key, review conflicts, and copy a ready-to-paste bind or unbind command.
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {["Preset library", "Conflict guidance", "Command lab", "Bind / Unbind"].map((label) => (
                <div
                  key={label}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "999px",
                    border: "1px solid rgba(21,20,15,.2)",
                    fontSize: "17px",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
            <div style={{ fontSize: "17px", color: "#8b8676", fontWeight: 700 }}>Designed and developed by Archew</div>
          </div>
          <div
            style={{
              width: "42%",
              minHeight: "470px",
              border: "1px solid rgba(21,20,15,.16)",
              background: "#ece4cf",
              padding: "30px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxShadow: "22px 22px 0 rgba(237,111,92,.18)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "15px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#8b8676" }}>
                Generated command
              </span>
              <span style={{ padding: "7px 11px", borderRadius: "999px", background: "#6e7448", color: "#f7f1de", fontSize: "14px" }}>
                Ready
              </span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "24px",
                background: "#15140f",
                fontFamily: "monospace",
                fontSize: "23px",
                lineHeight: 1.45,
                color: "#f7f1de",
              }}
            >
              /bind ctrl+b gensendmessage Vipaction_Bankvendor activate
            </div>
            {[
              ["Class", "All classes"],
              ["Type", "VIP Services"],
              ["Key", "Ctrl + B"],
              ["Mode", "Bind"],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 0",
                  borderBottom: "1px solid rgba(21,20,15,.12)",
                  fontSize: "18px",
                }}
              >
                <span style={{ color: "#8b8676" }}>{label}</span>
                <span style={{ fontWeight: 700 }}>{value}</span>
              </div>
            ))}
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                justifyContent: "center",
                padding: "16px",
                borderRadius: "999px",
                background: "#ed6f5c",
                color: "#ffffff",
                fontWeight: 900,
                fontSize: "19px",
              }}
            >
              Copy command
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
