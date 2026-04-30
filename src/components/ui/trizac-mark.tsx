export function TrizacMark({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <circle cx="16" cy="16" r="15" fill="#1f6e7a" />
        <path
          d="M8 22 L12 12 L16 18 L20 10 L24 22 Z"
          fill="#fff"
          stroke="#fff"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="6" r="1.5" fill="#e8a838" />
      </svg>
      <div className="font-bold text-[17px] tracking-title leading-none text-ink">
        Trizac
        <div className="font-medium text-[9px] tracking-[0.1em] uppercase text-ink-muted mt-0.5">
          place du village
        </div>
      </div>
    </div>
  );
}
