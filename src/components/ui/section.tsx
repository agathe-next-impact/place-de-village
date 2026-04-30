import { cn } from "@/lib/cn";

type SectionProps = {
  title?: string;
  action?: React.ReactNode;
  dense?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function Section({
  title,
  action,
  dense,
  children,
  className,
}: SectionProps) {
  return (
    <section className={cn(dense ? "px-[18px] py-2" : "px-[18px] py-3.5", className)}>
      {title && (
        <div className="flex items-baseline justify-between mb-2.5">
          <h2 className="m-0 text-[17px] font-bold tracking-title text-ink flex-1 min-w-0 truncate">
            {title}
          </h2>
          {action && (
            <span className="text-[13px] font-semibold text-primary">{action}</span>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2.5">{children}</div>
    </section>
  );
}
