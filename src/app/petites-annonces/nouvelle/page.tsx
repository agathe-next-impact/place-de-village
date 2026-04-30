import Link from "next/link";
import { ScreenShell } from "@/components/screen-shell";
import { PageHeader } from "@/components/ui/page-header";
import { NewPetiteAnnonceForm } from "@/components/interactive/new-petite-annonce";

export default function Page() {
  return (
    <ScreenShell>
      <PageHeader
        subtitle="Petites annonces"
        title="Publier une annonce"
        action={<Link href="/petites-annonces" className="text-[12px] text-primary font-semibold underline">Retour</Link>}
      />
      <div className="px-[18px] pb-4">
        <NewPetiteAnnonceForm />
      </div>
    </ScreenShell>
  );
}
