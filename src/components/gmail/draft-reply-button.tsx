"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { draftEmailReply } from "@/server/actions/email-drafts";

export function DraftReplyButton({ connectionId, messageId }: { connectionId: string; messageId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function run(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      try {
        await draftEmailReply(connectionId, messageId);
        toast.success("Draft ready.", {
          action: { label: "View", onClick: () => router.push("/gmail/drafts") },
        });
      } catch {
        toast.error("Couldn't draft a reply for this one.");
      }
    });
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 shrink-0 gap-1.5 text-xs"
      disabled={isPending}
      onClick={run}
    >
      <Sparkles className="h-3 w-3" />
      {isPending ? "Drafting…" : "Draft reply"}
    </Button>
  );
}
