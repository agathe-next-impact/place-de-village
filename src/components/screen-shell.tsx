"use client";

import { useRouter } from "next/navigation";
import { PhoneFrame } from "@/components/phone-frame";
import { TabBar, type TabId } from "@/components/ui/tab-bar";

/**
 * Coque commune pour les pages détail / pages "hors tabs" : reprend le
 * cadre PhoneFrame et la TabBar du shell principal.
 */
export function ScreenShell({
  active = "home",
  children,
}: {
  active?: TabId;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <PhoneFrame>
      <div id="main-content">{children}</div>
      <TabBar
        active={active}
        onChange={(id) => router.push(id === "home" ? "/" : `/?tab=${id}`)}
      />
    </PhoneFrame>
  );
}
