import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/components/ui/toast";
import { PlausibleScript } from "@/components/plausible";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trizac · Place du village",
  description:
    "Plateforme citoyenne municipale — signalements, agora, bénévolat, entraide, vie locale, réservation.",
  manifest: "/manifest.webmanifest",
  applicationName: "Trizac",
  appleWebApp: { capable: true, title: "Trizac", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f4f1ec",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-surface focus:text-ink focus:px-3 focus:py-2 focus:rounded focus:border focus:border-line-soft focus:font-semibold"
        >
          Aller au contenu principal
        </a>
        <ToastProvider>{children}</ToastProvider>
        <PlausibleScript />
      </body>
    </html>
  );
}
