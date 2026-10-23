"use client";

import { useSyncExternalStore } from "react";

import {
  getColorThemePreference,
  setColorThemePreference,
  subscribeColorTheme,
  type ColorThemePreference,
} from "@/lib/client/color-theme";
import { focusRingSmClass } from "@/lib/primary-link-styles";
import type { AccessibilityVoiceStrings } from "@/lib/voice-ui-i18n";
import { selectControlClass } from "@/lib/ui/field-styles";

type Props = {
  strings: Pick<
    AccessibilityVoiceStrings,
    | "displayThemeLabel"
    | "displayThemeSystem"
    | "displayThemeLight"
    | "displayThemeDark"
    | "displayThemeNote"
  >;
};

export function ColorThemePreferenceSelect({ strings }: Props) {
  const preference = useSyncExternalStore(subscribeColorTheme, getColorThemePreference, () => "system" as ColorThemePreference);

  const options: { value: ColorThemePreference; label: string }[] = [
    { value: "system", label: strings.displayThemeSystem },
    { value: "light", label: strings.displayThemeLight },
    { value: "dark", label: strings.displayThemeDark },
  ];

  return (
    <div className="mt-3 grid gap-2 border-t border-[var(--border)]/80 pt-3">
      <label className="text-xs font-semibold text-[var(--foreground)]" htmlFor="color-theme-select">
        {strings.displayThemeLabel}
      </label>
      <select
        id="color-theme-select"
        value={preference}
        onChange={(event) => setColorThemePreference(event.target.value as ColorThemePreference)}
        className={`h-11 ${selectControlClass({ density: "compact" }).replace("mt-1 ", "")} ${focusRingSmClass}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <p className="text-[11px] leading-snug text-[var(--foreground-secondary)]">{strings.displayThemeNote}</p>
    </div>
  );
}
