import { ScreenShell } from "@/components/screen-shell";
import { HomeScreen } from "@/screens/home";

export default async function Page() {
  return (
    <ScreenShell>
      <HomeScreen />
    </ScreenShell>
  );
}
