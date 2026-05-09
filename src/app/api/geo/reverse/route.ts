import { NextResponse } from "next/server";

/**
 * Reverse geocode rounded coordinates → short locality label (OpenStreetMap Nominatim).
 * Proxied server-side with a proper User-Agent per Nominatim usage policy.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "Out of range" }, { status: 400 });
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}&format=json`;
    const res = await fetch(nominatimUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "MBKRU-Website/1.0 (voice intake; https://mbkruadvocates.org)",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ label: null });
    }
    const data = (await res.json()) as {
      address?: Record<string, string>;
      display_name?: string;
    };
    const label = pickLocalityLabel(data.address, data.display_name);
    return NextResponse.json({ label });
  } catch {
    return NextResponse.json({ label: null });
  }
}

function pickLocalityLabel(addr: Record<string, string> | undefined, displayName?: string): string | null {
  if (addr) {
    const keys = [
      "suburb",
      "neighbourhood",
      "quarter",
      "village",
      "town",
      "city_district",
      "city",
      "municipality",
      "county",
      "state_district",
    ];
    for (const k of keys) {
      const v = addr[k]?.trim();
      if (v && v.length >= 3 && v.length <= 240) return v.slice(0, 240);
    }
  }
  if (displayName) {
    const first = displayName.split(",").map((s) => s.trim())[0];
    if (first && first.length >= 3 && first.length <= 240) return first;
  }
  return null;
}
