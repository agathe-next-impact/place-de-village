import { cn } from "@/lib/cn";

type SurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: "div" | "button" | "article" | "section";
  padded?: boolean;
};

export function Surface({
  as: Tag = "div",
  className,
  padded = true,
  children,
  ...rest
}: SurfaceProps) {
  return (
    <Tag
      className={cn(
        "block w-full text-left bg-surface border border-line-soft rounded-lg",
        padded && "p-3.5",
        className,
      )}
      {...(rest as React.HTMLAttributes<HTMLElement>)}
    >
      {children}
    </Tag>
  );
}
