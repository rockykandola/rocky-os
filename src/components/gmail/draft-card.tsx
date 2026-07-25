"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Download, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteEmailDraft, draftEmailReply } from "@/server/actions/email-drafts";
import type { EmailDraft } from "@/generated/prisma/client";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export function DraftCard({
  draft,
}: {
  draft: EmailDraft & { connection: { email: string } };
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function copyDraft() {
    navigator.clipboard.writeText(draft.draftBody);
    toast.success("Draft copied.");
  }

  function downloadDraft() {
    const content = `Original email\n---------------\nFrom: ${draft.fromAddress}\nSubject: ${draft.subject}\n\n${draft.originalBody}\n\n\nDraft reply\n-----------\n${draft.draftBody}\n`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(draft.subject) || "draft"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function remove() {
    startTransition(async () => {
      await deleteEmailDraft(draft.id);
      router.refresh();
    });
  }

  function regenerate() {
    startTransition(async () => {
      try {
        await draftEmailReply(draft.connectionId, draft.gmailMessageId);
        toast.success("Draft regenerated.");
        router.refresh();
      } catch {
        toast.error("Couldn't regenerate this one. Try again in a moment.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{draft.subject}</p>
          <p className="truncate text-xs text-muted-foreground">
            {draft.fromAddress} · via {draft.connection.email}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground" disabled={isPending} onClick={remove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Badge variant="outline" className="w-fit text-[10px]">
            Original
          </Badge>
          <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
            {draft.originalBody}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Badge variant="outline" className="w-fit text-[10px]">
            AI draft reply
          </Badge>
          <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md bg-primary/5 p-2 text-xs">
            {draft.draftBody}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {format(new Date(draft.createdAt), "MMM d, yyyy · h:mm a")}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" disabled={isPending} onClick={regenerate}>
            <RefreshCw className={isPending ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
            Regenerate
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={copyDraft}>
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadDraft}>
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
