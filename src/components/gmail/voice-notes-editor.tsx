"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function VoiceNotesEditor({
  initialNotes,
  onSave,
}: {
  initialNotes: string | null;
  onSave: (notes: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function save() {
    startTransition(async () => {
      await onSave(notes);
      toast.success("Saved — future drafts will use this.");
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          How Rocky writes — notes for AI drafts
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="flex flex-col gap-2 border-t p-3">
          <p className="text-xs text-muted-foreground">
            Drafts already learn your tone from your Sent folder automatically. Add anything extra here —
            phrases you always use, how you sign off, things to avoid.
          </p>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. I sign off with just 'Rocky', keep things casual and short, never use 'Best regards'…"
            rows={3}
          />
          <Button size="sm" className="self-end" disabled={isPending} onClick={save}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}
