import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "BindForge NW Neverwinter keybind builder and command generator";
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
          background: "linear-gradient(135deg, #07111f 0%, #12263f 55%, #173a55 100%)",
          color: "#f8fbff",
          fontFamily: "Arial, sans-serif",
          padding: "54px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "360px",
            height: "360px",
            borderRadius: "999px",
            background: "rgba(73, 172, 255, 0.12)",
            right: "-80px",
            top: "-90px",
          }}
        />
        <div style={{ display: "flex", width: "100%", gap: "48px", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", width: "57%", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#56b4ff",
                  color: "#06111e",
                  fontSize: "26px",
                  fontWeight: 900,
                }}
              >
                BF
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "20px", letterSpacing: "0.22em", textTransform: "uppercase", color: "#8fd0ff" }}>
                  Neverwinter utility
                </span>
                <span style={{ fontSize: "48px", fontWeight: 900, letterSpacing: "-0.04em" }}>BindForge NW</span>
              </div>
            </div>
            <div style={{ fontSize: "54px", fontWeight: 900, lineHeight: 1.03, letterSpacing: "-0.05em" }}>
              Build a keybind without memorizing commands.
            </div>
            <div style={{ fontSize: "24px", lineHeight: 1.45, color: "#c8d9e8" }}>
              Search presets, choose a key, review safety warnings, and copy a ready-to-paste bind or unbind line.
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {["Class presets", "Console commands", "Safe key combos", "Bind / Unbind"].map((label) => (
                <div
                  key={label}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    fontSize: "17px",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              width: "43%",
              minHeight: "470px",
              borderRadius: "26px",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(4, 12, 22, 0.76)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              boxShadow: "0 30px 70px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "15px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#8fd0ff" }}>
                Generated command
              </span>
              <span style={{ padding: "7px 11px", borderRadius: "999px", background: "#143d2c", color: "#9cf1bd", fontSize: "14px" }}>
                Safe
              </span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "22px",
                borderRadius: "16px",
                background: "#07101b",
                border: "1px solid #2b506e",
                fontFamily: "monospace",
                fontSize: "24px",
                lineHeight: 1.4,
                color: "#dff3ff",
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
                  padding: "14px 16px",
                  borderRadius: "14px",
                  background: "rgba(255,255,255,0.05)",
                  fontSize: "18px",
                }}
              >
                <span style={{ color: "#91a8bb" }}>{label}</span>
                <span style={{ fontWeight: 700 }}>{value}</span>
              </div>
            ))}
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                justifyContent: "center",
                padding: "16px",
                borderRadius: "14px",
                background: "#56b4ff",
                color: "#06111e",
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
