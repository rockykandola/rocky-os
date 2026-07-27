"use client";

import { useRef, useTransition } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { importContactsFromVCard } from "@/server/actions/contacts";

export function ImportVCardButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const text = await file.text();
    startTransition(async () => {
      try {
        const { imported, seen } = await importContactsFromVCard(text);
        toast.success(
          imported === 0
            ? `No new contacts — all ${seen} were already in Rocky OS.`
            : `Imported ${imported} new contact${imported === 1 ? "" : "s"} from your file.`,
        );
      } catch {
        toast.error("Couldn't read that file — make sure it's a .vcf contacts export.");
      }
    });
  }

  return (
    <>
      <input ref={inputRef} type="file" accept=".vcf,text/vcard" className="hidden" onChange={handleFile} />
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        {isPending ? "Importing…" : "Upload contacts file"}
      </Button>
    </>
  );
}
