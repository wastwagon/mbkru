import type { Transition } from "framer-motion";

/** Premium ease — matches `globals.css` `--ease-out-expo` intent */
export const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function sectionRevealTransition(reducedMotion: boolean, delay = 0): Transition {
  if (reducedMotion) return { duration: 0.01 };
  return { duration: 0.52, delay, ease: easeOutExpo };
}
