"use client";

import { useRef, useTransition } from "react";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { importContactsFromHubSpotCSV } from "@/server/actions/contacts";

export function ImportHubSpotCSVButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const text = await file.text();
    startTransition(async () => {
      try {
        const { newContacts, matchedContacts, dealsImported } = await importContactsFromHubSpotCSV(text);
        toast.success(
          `Imported ${newContacts} new client${newContacts === 1 ? "" : "s"}, matched ${matchedContacts} existing, logged ${dealsImported} deal${dealsImported === 1 ? "" : "s"} to their history.`,
        );
      } catch {
        toast.error("Couldn't read that file — make sure it's the HubSpot deals CSV export.");
      }
    });
  }

  return (
    <>
      <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
      >
        <FileSpreadsheet className="h-4 w-4" />
        {isPending ? "Importing…" : "Upload HubSpot CSV"}
      </Button>
    </>
  );
}
