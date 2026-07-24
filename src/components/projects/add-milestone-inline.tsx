"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createMilestone } from "@/server/actions/projects";

export function AddMilestoneInline({ projectId }: { projectId: string }) {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    startTransition(async () => {
      await createMilestone({ projectId, title });
      setTitle("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <Flag className="h-4 w-4 shrink-0 text-muted-foreground" />
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a milestone…"
        className="h-8"
      />
      <Button type="submit" size="sm" variant="secondary" disabled={isPending || !title.trim()}>
        Add
      </Button>
    </form>
  );
}
