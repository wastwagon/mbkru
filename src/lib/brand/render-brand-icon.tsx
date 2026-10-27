import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

let cachedPngDataUrl: string | null = null;

/** Same master artwork as PWA launcher icons (`public/icons/icon-512.png`). */
async function brandIconPngDataUrl(): Promise<string> {
  if (cachedPngDataUrl) return cachedPngDataUrl;
  const png = await readFile(path.join(process.cwd(), "public/icons/icon-512.png"));
  cachedPngDataUrl = `data:image/png;base64,${png.toString("base64")}`;
  return cachedPngDataUrl;
}

/** Rasterize shared brand PNG for Next `icon` / `apple-icon` routes. */
export async function brandIconImageResponse(width: number, height: number) {
  const src = await brandIconPngDataUrl();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e8ecef",
        }}
      >
        <img src={src} width={width} height={height} alt="" style={{ objectFit: "contain" }} />
      </div>
    ),
    { width, height },
  );
}
