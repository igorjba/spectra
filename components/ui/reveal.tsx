import { cn } from "@/lib/utils";

type RevealTag =
  | "div"
  | "section"
  | "article"
  | "ul"
  | "ol"
  | "li"
  | "span";

type RevealProps = React.HTMLAttributes<HTMLElement> & {
  as?: RevealTag;
};

/**
 * Scroll-driven entrance. The animation lives in CSS (`.reveal` in globals.css)
 * via `animation-timeline: view()`, so it needs no JS and the content stays
 * visible where scroll timelines or motion aren't available.
 */
export function Reveal({ as = "div", className, children, ...props }: RevealProps) {
  const Tag = as as React.ElementType;
  return (
    <Tag className={cn("reveal", className)} {...props}>
      {children}
    </Tag>
  );
}

/**
 * Container for a set of reveals. Each child animates as it enters the
 * viewport, which reads as a natural stagger without any coordination.
 */
export function RevealGroup({
  as = "div",
  className,
  children,
  ...props
}: RevealProps) {
  const Tag = as as React.ElementType;
  return (
    <Tag className={className} {...props}>
      {children}
    </Tag>
  );
}
