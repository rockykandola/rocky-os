"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { importContactsFromGmail } from "@/server/actions/contacts";

export function ImportContactsButton() {
  const [isPending, startTransition] = useTransition();

  function run() {
    startTransition(async () => {
      try {
        const { imported, seen } = await importContactsFromGmail();
        if (imported === 0) {
          toast.success(seen > 0 ? "Already up to date — no new contacts found." : "No Gmail connections to scan.");
        } else {
          toast.success(`Imported ${imported} new contact${imported === 1 ? "" : "s"} from Gmail.`);
        }
      } catch {
        toast.error("Couldn't import contacts from Gmail.");
      }
    });
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" disabled={isPending} onClick={run}>
      <Download className="h-4 w-4" />
      {isPending ? "Importing…" : "Import from Gmail"}
    </Button>
  );
}
