"use client";

import { forwardRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** True when the widget should render (build-time public key present). */
export const isTurnstileWidgetEnabled = Boolean(siteKey);

type Props = {
  onTokenChange: (token: string | null) => void;
  /** Passed to Turnstile for analytics (e.g. `contact`, `newsletter`). */
  action?: string;
  className?: string;
};

export const FormTurnstile = forwardRef<TurnstileInstance | undefined, Props>(
  function FormTurnstile({ onTokenChange, action, className }, ref) {
    if (!siteKey) return null;

    return (
      <div className={className}>
        <Turnstile
          ref={ref}
          siteKey={siteKey}
          onSuccess={(t) => onTokenChange(t)}
          onExpire={() => onTokenChange(null)}
          onError={() => onTokenChange(null)}
          options={action ? { action } : undefined}
        />
      </div>
    );
  },
);
