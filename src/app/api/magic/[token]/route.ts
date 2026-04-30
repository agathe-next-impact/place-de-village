import { NextResponse } from "next/server";
import { consumeMagicLink } from "@/lib/actions/auth";

/**
 * GET /api/magic/{token}
 *
 * Consomme un magic link et redirige vers l'accueil. Si invalide /
 * expiré / déjà consommé, redirige vers /auth/login avec ?error=…
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  try {
    await consumeMagicLink(token);
    return NextResponse.redirect(new URL("/", _req.url));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lien invalide.";
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(msg)}`, _req.url));
  }
}
