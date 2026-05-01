import { PhoneFrame } from "@/components/phone-frame";
import { TabBar } from "@/components/ui/tab-bar";

export async function ScreenShell({ children }: { children: React.ReactNode }) {
  // TabBar utilise position: fixed pour s'ancrer au bas du viewport
  // de façon fiable sur mobile (où aucun container n'a d'overflow-auto).
  // Le pb-24 sur le scroll container de PhoneFrame réserve l'espace
  // pour qu'elle ne masque pas le contenu en bas de page.
  return (
    <PhoneFrame>
      <div id="main-content">{children}</div>
      <TabBar />
    </PhoneFrame>
  );
}
