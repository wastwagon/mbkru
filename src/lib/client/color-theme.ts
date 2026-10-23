export type ColorThemePreference = "system" | "light" | "dark";

export const colorThemeStorageKey = "mbkru-color-theme";

const listeners = new Set<() => void>();

function parseStored(raw: string | null): ColorThemePreference {
  if (raw === "light" || raw === "dark") return raw;
  return "system";
}

/** Apply `data-color-theme` on `<html>` (omit attribute when following the OS). */
export function applyColorThemeToDocument(pref: ColorThemePreference) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (pref === "system") {
    root.removeAttribute("data-color-theme");
    return;
  }
  root.dataset.colorTheme = pref;
}

export function getColorThemePreference(): ColorThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    return parseStored(window.localStorage.getItem(colorThemeStorageKey));
  } catch {
    return "system";
  }
}

export function setColorThemePreference(pref: ColorThemePreference) {
  if (typeof window === "undefined") return;
  try {
    if (pref === "system") {
      window.localStorage.removeItem(colorThemeStorageKey);
    } else {
      window.localStorage.setItem(colorThemeStorageKey, pref);
    }
  } catch {
    // ignore quota / private mode
  }
  applyColorThemeToDocument(pref);
  listeners.forEach((fn) => fn());
}

export function subscribeColorTheme(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** Inline boot script — runs before paint (see root layout). */
export const colorThemeBootScript = `(function(){try{var v=localStorage.getItem("${colorThemeStorageKey}");if(v==="light"||v==="dark")document.documentElement.setAttribute("data-color-theme",v);}catch(e){}})();`;
