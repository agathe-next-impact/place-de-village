// Couleur déterministe à partir du nom (palette : primary, accent, info, prune, ambre)
const PALETTE = ["#1f6e7a", "#e8a838", "#1f6e7a", "#5d4e8c", "#8a4a1f"];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  name,
  size = 32,
  color,
  ringClassName,
}: {
  name: string;
  size?: number;
  color?: string;
  ringClassName?: string;
}) {
  const c = color ?? PALETTE[name.charCodeAt(0) % PALETTE.length];
  return (
    <div
      aria-label={name}
      className={`flex items-center justify-center rounded-pill text-white font-semibold flex-shrink-0 ${ringClassName ?? ""}`}
      style={{
        width: size,
        height: size,
        backgroundColor: c,
        fontSize: Math.round(size * 0.38),
      }}
    >
      {initials(name)}
    </div>
  );
}
