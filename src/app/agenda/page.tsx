"use client";

import { useRouter } from "next/navigation";
import { PhoneFrame } from "@/components/phone-frame";
import { TabBar } from "@/components/ui/tab-bar";
import { AgendaScreen } from "@/screens/agenda";

export default function Page() {
  const router = useRouter();
  return (
    <PhoneFrame>
      <AgendaScreen />
      <TabBar
        active="home"
        onChange={(id) => router.push(id === "home" ? "/" : `/?tab=${id}`)}
      />
    </PhoneFrame>
  );
}
