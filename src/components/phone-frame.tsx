// Cadre mobile pour la prévisualisation desktop. Sur mobile,
// l'écran prend toute la place. Cf. README — la cible production
// est une PWA mobile-first installable.

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-bg flex items-center justify-center md:p-8">
      <div
        className={[
          "relative w-full max-w-[420px] bg-bg",
          "min-h-screen md:min-h-[calc(100vh-4rem)] md:rounded-[28px] md:overflow-hidden",
          "md:shadow-[0_30px_80px_rgba(0,0,0,0.18)] md:border md:border-line-soft md:max-h-[900px]",
        ].join(" ")}
      >
        <div className="relative h-full overflow-y-auto pb-24 scrollbar-none">
          {children}
        </div>
      </div>
    </div>
  );
}
