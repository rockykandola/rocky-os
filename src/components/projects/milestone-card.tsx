"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskItem } from "@/components/tasks/task-item";
import { AddTaskInline } from "@/components/tasks/add-task-inline";
import { setMilestoneStatus, deleteMilestone } from "@/server/actions/projects";
import { cn } from "@/lib/utils";
import type { ProjectDetail } from "@/server/data/projects";

const STATUS_CYCLE = ["NOT_STARTED", "IN_PROGRESS", "DONE"] as const;
const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};
const STATUS_CLASS: Record<string, string> = {
  NOT_STARTED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export function MilestoneCard({
  milestone,
  projectId,
}: {
  milestone: ProjectDetail["milestones"][number];
  projectId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function cycleStatus() {
    const idx = STATUS_CYCLE.indexOf(milestone.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    startTransition(async () => {
      await setMilestoneStatus(milestone.id, projectId, next);
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteMilestone(milestone.id, projectId);
      router.refresh();
    });
  }

  return (
    <div className={cn("rounded-lg border p-4", isPending && "opacity-60")}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cycleStatus}
            className={cn("rounded px-2 py-0.5 text-xs font-medium", STATUS_CLASS[milestone.status])}
          >
            {STATUS_LABEL[milestone.status]}
          </button>
          <span className="text-sm font-medium">{milestone.title}</span>
          {milestone.dueDate && (
            <Badge variant="outline" className="text-[10px]">
              {format(new Date(milestone.dueDate), "MMM d")}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={remove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex flex-col divide-y pl-1">
        {milestone.tasks.map((task) => (
          <TaskItem key={task.id} task={{ ...task, project: null }} dense showSubtaskAdd />
        ))}
      </div>
      <div className="mt-1 pl-1">
        <AddTaskInline projectId={projectId} milestoneId={milestone.id} placeholder="Add a task to this milestone…" />
      </div>
    </div>
  );
}
