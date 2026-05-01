import { PhoneFrame } from "@/components/phone-frame";
import { TabBar } from "@/components/ui/tab-bar";

export async function ScreenShell({ children }: { children: React.ReactNode }) {
  // Le wrapper flex-column avec min-h-screen + flex-1 sur le contenu
  // garantit que la TabBar (sticky bottom-0) est poussée au bas du
  // viewport même sur les pages courtes. Sur les pages longues, le
  // sticky positioning prend le relais pour la maintenir collée au
  // bas pendant le scroll.
  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-screen md:min-h-[calc(100vh-4rem)]">
        <div id="main-content" className="flex-1">
          {children}
        </div>
        <TabBar />
      </div>
    </PhoneFrame>
  );
}
