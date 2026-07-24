"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { importGoogleTasks } from "@/server/actions/integrations";

export function ImportTasksButton({ connectionId }: { connectionId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function run() {
    startTransition(async () => {
      try {
        const { importedProjects, importedTasks } = await importGoogleTasks(connectionId);
        toast.success(`Imported ${importedTasks} tasks across ${importedProjects} lists.`);
        router.refresh();
      } catch {
        toast.error("Import failed. Try reconnecting this account.");
      }
    });
  }

  return (
    <Button size="sm" variant="secondary" className="gap-1.5" disabled={isPending} onClick={run}>
      <RefreshCw className={isPending ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
      {isPending ? "Importing…" : "Import tasks"}
    </Button>
  );
}
