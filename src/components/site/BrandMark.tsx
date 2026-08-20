/**
 * The ReadyTrackers mark: a rounded tile holding a check whose right
 * stroke keeps rising past where a tick would normally stop, ending in a
 * data point.
 *
 * The idea is the two halves of the name in one shape — "ready" (it's
 * done, ticked off) and "tracker" (a line going up and to the right).
 * Drawn on a 32-unit grid with fat strokes and no fine detail, because it
 * has to survive being rendered as a 16px favicon.
 */
/**
 * Hard-coded rather than themed. --accent flips from green to amber in
 * dark mode, and a logo that changes hue with the colour scheme isn't a
 * logo. This is the same value baked into favicon.svg and favicon.ico, so
 * the tab icon and the header mark are always literally the same mark.
 */
const BRAND_GREEN = "#12B76A";

export function BrandMark({
  size = 28,
  className,
  /** Draws just the glyph in currentColor, no tile — for tight spaces. */
  bare = false,
}: {
  size?: number;
  className?: string;
  bare?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="ReadyTrackers"
      className={className}
    >
      {!bare && <rect width="32" height="32" rx="8" fill={BRAND_GREEN} />}
      <path
        d="M8 16.5 L13.5 22 L24 9"
        stroke={bare ? "currentColor" : "#ffffff"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="9" r="2.6" fill={bare ? "currentColor" : "#ffffff"} />
    </svg>
  );
}
