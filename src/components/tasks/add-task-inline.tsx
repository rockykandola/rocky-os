"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTask } from "@/server/actions/tasks";

export function AddTaskInline({
  projectId,
  milestoneId,
  parentTaskId,
  placeholder = "Add a task…",
  compact = false,
}: {
  projectId?: string;
  milestoneId?: string;
  parentTaskId?: string;
  placeholder?: string;
  compact?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    startTransition(async () => {
      await createTask({
        title,
        projectId: projectId ?? null,
        milestoneId: milestoneId ?? null,
        parentTaskId: parentTaskId ?? null,
      });
      setTitle("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        className={compact ? "h-7 border-none bg-transparent px-1 text-sm shadow-none focus-visible:ring-0" : "h-8 border-none bg-transparent px-1 shadow-none focus-visible:ring-0"}
      />
      <Button type="submit" size="sm" variant="ghost" disabled={isPending || !title.trim()} className="h-7 shrink-0">
        Add
      </Button>
    </form>
  );
}
