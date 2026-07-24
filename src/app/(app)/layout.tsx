import { requireUser } from "@/lib/auth";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { AppTopbar } from "@/components/layout/app-topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-svh flex-1">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-muted/20 p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-1 text-lg font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm">
            R
          </span>
          Rocky OS
        </div>
        <SidebarNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar user={user} />
        <main className="flex-1 overflow-y-auto bg-muted/10 p-6">{children}</main>
      </div>
    </div>
  );
}
