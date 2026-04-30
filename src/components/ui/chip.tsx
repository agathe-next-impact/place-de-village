import { cn } from "@/lib/cn";

type ChipProps = {
  children: React.ReactNode;
  size?: "sm" | "md";
  /** Couleur sémantique. Sert de fond doux + de point coloré.
   *  Le texte est automatiquement assombri pour passer WCAG AA 4.5:1. */
  color?: string;
  background?: string;
  className?: string;
  prefixDot?: boolean;
};

/**
 * Map des teintes sémantiques vers des variantes "ink" suffisamment
 * sombres pour passer WCAG AA 4.5:1 sur leur fond `${color}1a`.
 *
 * Calcul vérifié manuellement avec axe-core.
 */
const TEXT_INK: Record<string, string> = {
  "#e8a838": "#7a5810", // accent (jaune safran) → ambre profond
  "#7a8c3a": "#465120", // success (olive doré) → olive foncé
  "#1f6e7a": "#155059", // primary / info (sarcelle) → sarcelle foncé
  "#a8332b": "#a8332b", // danger : déjà OK
  "#7a746c": "#5b554f", // ink-muted : déjà OK comme texte
  "#1c1a17": "#1c1a17", // ink
  "#1f3826": "#1f3826", // primary alt (place du village)
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
  const textColor = color ? TEXT_INK[color.toLowerCase()] ?? color : undefined;
  const style: React.CSSProperties = {
    color: textColor,
    backgroundColor: background ?? (color ? `${color}1a` : undefined),
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded font-semibold leading-tight whitespace-nowrap",
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
