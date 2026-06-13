import { requireUser } from "@/lib/auth";
import { getSectionContext } from "@/lib/section";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { PageTransition } from "@/components/page-transition";
import type { SectionKey } from "@/lib/constants";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();
  const { allowed, active } = await getSectionContext();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar
        session={session}
        sections={allowed as SectionKey[]}
        activeSection={active as SectionKey | null}
      />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 sm:pt-8 lg:px-8 lg:pb-8">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
      <MobileNav session={session} />
    </div>
  );
}
