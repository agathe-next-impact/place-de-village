import { PhoneFrame } from "@/components/phone-frame";
import { TabBar } from "@/components/ui/tab-bar";

export async function ScreenShell({ children }: { children: React.ReactNode }) {
  return (
    <PhoneFrame>
      <div id="main-content">{children}</div>
      <TabBar />
    </PhoneFrame>
  );
}
