import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/site/BrandMark";
import { SHOP_NAME } from "@/data/policies";

/**
 * Icon + wordmark lockup. One component so the header, footer and any
 * future surface can't drift apart on spacing or capitalisation.
 *
 * "Ready" is weighted normally and "Trackers" semibold, so the two halves
 * of the compound read as one word without needing a space.
 */
export function Logo({
  size = "md",
  withLink = true,
  className,
}: {
  size?: "sm" | "md";
  withLink?: boolean;
  className?: string;
}) {
  const markSize = size === "sm" ? 22 : 28;
  const textClass = size === "sm" ? "text-base" : "text-xl";

  const inner = (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <BrandMark size={markSize} />
      <span className={`font-display ${textClass} tracking-tight text-primary`}>
        <span className="font-medium">Ready</span>
        <span className="font-semibold">Trackers</span>
      </span>
    </span>
  );

  if (!withLink) return inner;

  return (
    <Link to="/" aria-label={`${SHOP_NAME} home`} className="inline-flex items-center">
      {inner}
    </Link>
  );
}
