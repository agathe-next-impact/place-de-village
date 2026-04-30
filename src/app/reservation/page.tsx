"use client";

import { useRouter } from "next/navigation";
import { PhoneFrame } from "@/components/phone-frame";
import { TabBar } from "@/components/ui/tab-bar";
import { ReservScreen } from "@/screens/reserv";

export default function Page() {
  const router = useRouter();
  return (
    <PhoneFrame>
      <ReservScreen />
      <TabBar
        active="home"
        onChange={(id) => router.push(id === "home" ? "/" : `/?tab=${id}`)}
      />
    </PhoneFrame>
  );
}
