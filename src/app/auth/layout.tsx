import { TrizacMark } from "@/components/ui/trizac-mark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-bg flex items-center justify-center px-4 py-8">
      <main
        id="main-content"
        className="w-full max-w-[400px] bg-surface border border-line-soft rounded-lg p-6 md:p-8"
      >
        <div className="mb-6">
          <TrizacMark />
        </div>
        {children}
      </main>
    </div>
  );
}
