import { ImageResponse } from "next/og";

// One icon.tsx serving 3 sizes: 32 for the browser tab favicon, 192/512 for
// the PWA manifest (Android/Chrome install prompts) — see admin.webmanifest.
const SIZES: Record<string, number> = { "32": 32, "192": 192, "512": 512 };

export function generateImageMetadata() {
  return Object.entries(SIZES).map(([id, px]) => ({
    id,
    size: { width: px, height: px },
    contentType: "image/png",
  }));
}

export default function Icon({ id }: { id: string }) {
  const px = SIZES[id] ?? 32;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e88aa2",
          fontSize: Math.round(px * 0.58),
          fontWeight: 700,
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        B
      </div>
    ),
    { width: px, height: px },
  );
}
