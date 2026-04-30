import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "accent";
type Size = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  icon?: React.ReactNode;
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-ink border-transparent hover:bg-primary/90 active:bg-primary/85",
  secondary:
    "bg-surface-alt text-ink border-line hover:bg-surface-alt/80",
  ghost: "bg-transparent text-ink border-line hover:bg-surface-alt",
  accent: "bg-accent text-white border-transparent hover:bg-accent/90",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[13px] min-h-[36px]",
  md: "px-4 py-2.5 text-[14.5px] min-h-[44px]",
  lg: "px-[18px] py-3.5 text-[16px] min-h-[48px]",
};

export function Button({
  variant = "primary",
  size = "md",
  full,
  icon,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold rounded border transition-colors",
        "tracking-[0.005em]",
        VARIANTS[variant],
        SIZES[size],
        full && "w-full",
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
