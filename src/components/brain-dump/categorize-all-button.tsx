"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categorizeAllPending } from "@/server/actions/brain-dump";

export function CategorizeAllButton({ disabled }: { disabled: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="secondary"
      className="gap-1.5"
      disabled={disabled || isPending}
      onClick={() =>
        startTransition(async () => {
          await categorizeAllPending();
          router.refresh();
        })
      }
    >
      <Sparkles className="h-4 w-4" />
      {isPending ? "Sorting…" : "Sort all with AI"}
    </Button>
  );
}
