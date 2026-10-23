import Link from "next/link";

import { PublicSocialIcon } from "@/components/layout/PublicSocialIcon";
import {
  focusRingOnDark70IconClass,
  focusRingOnDark80TileClass,
} from "@/lib/primary-link-styles";
import type { PublicSocialLink } from "@/lib/site-content";

const topBarIconClass = `flex h-11 w-11 touch-manipulation items-center justify-center rounded-xl bg-white/20 text-white transition-all duration-300 hover:bg-white hover:text-[var(--section-dark)] active:scale-[0.96] motion-reduce:active:scale-100 sm:h-9 sm:w-9 sm:rounded-lg ${focusRingOnDark80TileClass}`;

const footerIconClass = `flex h-11 w-11 touch-manipulation items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-[var(--accent-warm)] sm:h-10 sm:w-10 ${focusRingOnDark70IconClass}`;

type Props = {
  links: PublicSocialLink[];
  variant: "topbar" | "footer";
  className?: string;
};

/** Shared Facebook / LinkedIn / X links for gold top bar and teal footer. */
export function PublicSocialLinks({ links, variant, className = "" }: Props) {
  const iconClass = variant === "topbar" ? topBarIconClass : footerIconClass;

  return (
    <div className={className}>
      {links.map(({ href, label, icon, external }) => {
        const inner = <PublicSocialIcon icon={icon} />;
        if (external) {
          return (
            <a
              key={icon}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={iconClass}
              aria-label={label}
            >
              {inner}
            </a>
          );
        }
        return (
          <Link key={icon} href={href} className={iconClass} aria-label={`${label} — contact us for links`}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
