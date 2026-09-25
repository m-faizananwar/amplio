import type { CSSProperties, SVGProps } from "react";

type Props = SVGProps<SVGPathElement> & { delay?: number; duration?: number };

// A stroke that draws itself in once: pathLength normalises every path to 1,
// so the dash maths is the same for all of them. Final frame under reduced motion.
export function DrawOnPath({ delay = 0, duration = 420, style, ...props }: Props) {
  return (
    <path
      pathLength={1}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="g-draw"
      style={{ "--g-delay": `${delay}ms`, "--g-dur": `${duration}ms`, ...style } as CSSProperties}
      {...props}
    />
  );
}
