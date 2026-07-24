import { MobileSidebar } from "./mobile-sidebar";
import { CommandPalette } from "./command-palette";
import { QuickCaptureDialog } from "./quick-capture-dialog";
import { UserMenu } from "./user-menu";
import type { User } from "@/generated/prisma/client";

export function AppTopbar({ user }: { user: User }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
      <MobileSidebar />
      <div className="flex-1" />
      <CommandPalette />
      <QuickCaptureDialog />
      <UserMenu name={user.fullName ?? ""} email={user.email} avatarUrl={user.avatarUrl} />
    </header>
  );
}
