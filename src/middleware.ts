import { NextResponse, type NextRequest } from "next/server";

/**
 * Protège l'app derrière auth. Les routes publiques (auth, mentions
 * légales, cron interne, manifest, assets statiques) sont autorisées
 * sans cookie de session.
 *
 * Validation réelle de la session faite côté server components via
 * `getCurrentUser()` — le middleware ne fait que vérifier la présence
 * du cookie pour éviter les requêtes DB inutiles sur Edge.
 */
const PUBLIC_PREFIXES = [
  "/auth/",
  "/api/auth/",
  "/api/cron/",
  "/api/debug/",
  "/mentions-legales",
  "/confidentialite",
  "/accessibilite",
];

const SESSION_COOKIE = "trizac_session";

export function middleware(req: NextRequest) {
  // Mode démo : on désactive complètement la protection. Le RoleSwitcher
  // et le fallback u1 dans getCurrentUser prennent le relais pour
  // permettre la navigation sans login.
  if (process.env.DEMO_MODE === "true") {
    return NextResponse.next();
  }
  const { pathname } = req.nextUrl;
  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }
  const sid = req.cookies.get(SESSION_COOKIE)?.value;
  if (!sid) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt)$).*)",
  ],
};
