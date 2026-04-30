import { cn } from "@/lib/cn";

type ChipProps = {
  children: React.ReactNode;
  size?: "sm" | "md";
  /** CSS color value applied to text and used to derive background */
  color?: string;
  background?: string;
  className?: string;
  prefixDot?: boolean;
};

/**
 * Chip carrée (sobre). La couleur n'est jamais le seul vecteur d'info :
 * `prefixDot` ajoute un point coloré pour redondance non-couleur.
 */
export function Chip({
  children,
  size = "md",
  color,
  background,
  className,
  prefixDot,
}: ChipProps) {
  const style: React.CSSProperties = {
    color,
    backgroundColor: background ?? (color ? `${color}1a` : undefined),
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded font-medium leading-tight whitespace-nowrap",
        size === "sm" ? "text-[11px] px-2 py-0.5" : "text-[12.5px] px-2.5 py-1",
        !color && !background && "bg-surface-alt text-ink-soft",
        className,
      )}
      style={style}
    >
      {prefixDot && (
        <span
          aria-hidden
          className="inline-block w-1.5 h-1.5 rounded-pill"
          style={{ backgroundColor: color ?? "currentColor" }}
        />
      )}
      {children}
    </span>
  );
}
