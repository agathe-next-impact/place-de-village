import Link from "next/link";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { NewEntraideForm } from "@/components/interactive/new-entraide";

export default function Page() {
  return (
    <ScreenShell>
      <PageHeader
        subtitle="Entraide"
        title="Publier une annonce"
        action={<Link href="/aide" className="text-[12px] text-primary font-semibold underline">Retour</Link>}
      />
      <div className="px-[18px] pb-4">
        <NewEntraideForm />
      </div>
    </ScreenShell>
  );
}
