"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTask } from "@/server/actions/tasks";
import { PRIORITY_LABEL } from "@/lib/task-format";

export function NewTaskForm({ projects }: { projects: { id: string; title: string }[] }) {
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<string>("none");
  const [priority, setPriority] = useState<string>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    startTransition(async () => {
      await createTask({
        title,
        projectId: projectId === "none" ? null : projectId,
        priority: priority as never,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      setTitle("");
      setDueDate("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 rounded-lg border bg-background p-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to get done?"
        className="min-w-48 flex-1"
      />
      <Select value={projectId} onValueChange={(value) => value && setProjectId(value)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No project</SelectItem>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={priority} onValueChange={(value) => value && setPriority(value)}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(PRIORITY_LABEL).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-40" />
      <Button type="submit" disabled={isPending || !title.trim()} className="gap-1.5">
        <Plus className="h-4 w-4" />
        Add task
      </Button>
    </form>
  );
}
