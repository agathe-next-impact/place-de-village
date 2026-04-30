import Link from "next/link";
import { notFound } from "next/navigation";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { NewMissionForm } from "@/components/interactive/new-mission";
import { getCurrentUserPub } from "@/lib/queries";

export default async function Page() {
  const me = await getCurrentUserPub();
  if (me.role === "habitant") notFound();
  return (
    <ScreenShell>
      <PageHeader
        subtitle="Nouvelle mission"
        title="Proposer une mission de bénévolat"
        action={<Link href="/moi" className="text-[12px] text-primary font-semibold underline">Retour</Link>}
      />
      <div className="px-[18px] pb-4">
        <NewMissionForm />
      </div>
    </ScreenShell>
  );
}
