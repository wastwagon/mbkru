import { NextResponse } from "next/server";

/** Matches CitizenReport.localArea max length after migration. */
const ADDRESS_LABEL_MAX = 512;

/**
 * Reverse geocode rounded coordinates → address-style label (OpenStreetMap Nominatim).
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
    const label = pickAddressLabel(data.address, data.display_name);
    return NextResponse.json({ label });
  } catch {
    return NextResponse.json({ label: null });
  }
}

function clampLabel(s: string): string {
  return s.trim().replace(/\s+/g, " ").slice(0, ADDRESS_LABEL_MAX);
}

/** Prefer full formatted address; fallback to structured OSM address components; last resort short locality. */
function pickAddressLabel(addr: Record<string, string> | undefined, displayName?: string): string | null {
  if (displayName?.trim()) {
    const t = clampLabel(displayName);
    if (t.length >= 3) return t;
  }

  if (addr) {
    const roadLine =
      addr.house_number && addr.road
        ? `${addr.house_number} ${addr.road}`.trim()
        : (addr.road || addr.pedestrian || addr.path || "").trim();
    const parts: string[] = [];
    if (roadLine) parts.push(roadLine);
    const locality =
      addr.suburb ||
      addr.neighbourhood ||
      addr.quarter ||
      addr.hamlet ||
      addr.village ||
      addr.town ||
      "";
    if (locality.trim()) parts.push(locality.trim());
    const city =
      addr.city_district ||
      addr.city ||
      addr.municipality ||
      addr.county ||
      addr.state_district ||
      "";
    if (city.trim()) parts.push(city.trim());
    const region = (addr.state || addr.region || "").trim();
    if (region) parts.push(region);
    const country = (addr.country || "").trim();
    if (country) parts.push(country);

    const joined = clampLabel(parts.filter(Boolean).join(", "));
    if (joined.length >= 3) return joined;
  }

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
      if (v && v.length >= 3) return clampLabel(v);
    }
  }
  if (displayName) {
    const first = displayName.split(",").map((s) => s.trim())[0];
    if (first && first.length >= 3) return clampLabel(first);
  }
  return null;
}
