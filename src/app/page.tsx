"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PhoneFrame } from "@/components/phone-frame";
import { TabBar, type TabId } from "@/components/ui/tab-bar";
import { HomeScreen } from "@/screens/home";
import { SignalScreen } from "@/screens/signal";
import { AgoraScreen } from "@/screens/agora";
import { MeScreen } from "@/screens/me";
import { AideScreen } from "@/screens/aide";

const VALID_TABS: TabId[] = ["home", "signal", "agora", "aide", "me"];

function TrizacApp() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("tab");
  const [tab, setTab] = useState<TabId>(
    VALID_TABS.includes(initial as TabId) ? (initial as TabId) : "home",
  );

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && VALID_TABS.includes(t as TabId)) setTab(t as TabId);
  }, [searchParams]);

  return (
    <PhoneFrame>
      <main aria-label={`Onglet ${tab}`}>
        {tab === "home" && <HomeScreen goTab={setTab} />}
        {tab === "signal" && <SignalScreen />}
        {tab === "agora" && <AgoraScreen />}
        {tab === "aide" && <AideScreen />}
        {tab === "me" && <MeScreen />}
      </main>
      <TabBar active={tab} onChange={setTab} />
    </PhoneFrame>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-ink-muted">
          Chargement…
        </div>
      }
    >
      <TrizacApp />
    </Suspense>
  );
}
