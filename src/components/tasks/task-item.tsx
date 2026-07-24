"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, isPast, isToday } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRIORITY_BADGE_CLASS, PRIORITY_LABEL } from "@/lib/task-format";
import { setTaskStatus } from "@/server/actions/tasks";
import { AddTaskInline } from "@/components/tasks/add-task-inline";
import type { TaskWithProject } from "@/server/data/tasks";

function SubtaskRow({ subtask }: { subtask: TaskWithProject["subtasks"][number] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const done = subtask.status === "DONE";

  function toggle() {
    startTransition(async () => {
      await setTaskStatus(subtask.id, done ? "TODO" : "DONE");
      router.refresh();
    });
  }

  return (
    <div className={cn("flex items-center gap-2 py-1", isPending && "opacity-60")}>
      <Checkbox checked={done} onCheckedChange={toggle} className="size-3.5" />
      <span className={cn("text-xs leading-tight", done && "text-muted-foreground line-through")}>
        {subtask.title}
      </span>
    </div>
  );
}

export function TaskItem({
  task,
  dense = false,
  showSubtaskAdd = false,
}: {
  task: TaskWithProject;
  dense?: boolean;
  showSubtaskAdd?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const done = task.status === "DONE";

  function toggle() {
    startTransition(async () => {
      await setTaskStatus(task.id, done ? "TODO" : "DONE");
      router.refresh();
    });
  }

  const overdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && !done;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md px-2 py-2 transition-opacity hover:bg-muted/60",
        isPending && "opacity-60",
      )}
    >
      <Checkbox checked={done} onCheckedChange={toggle} className="mt-0.5" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={cn("text-sm font-medium leading-tight", done && "text-muted-foreground line-through")}>
          {task.title}
        </span>
        {!dense && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {task.project && (
              <Badge variant="outline" className="text-[10px]">
                {task.project.title}
              </Badge>
            )}
            {task.assignee && (
              <Badge variant="outline" className="text-[10px]">
                @{task.assignee}
              </Badge>
            )}
            <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", PRIORITY_BADGE_CLASS[task.priority])}>
              {PRIORITY_LABEL[task.priority]}
            </span>
            {task.dueDate && (
              <span className={cn(overdue && "font-medium text-destructive")}>
                {format(new Date(task.dueDate), "MMM d")}
              </span>
            )}
          </div>
        )}
        {task.subtasks.length > 0 && (
          <div className="mt-1 flex flex-col border-l pl-3">
            {task.subtasks.map((subtask) => (
              <SubtaskRow key={subtask.id} subtask={subtask} />
            ))}
          </div>
        )}
        {showSubtaskAdd && (
          <div className="mt-1 border-l pl-3">
            <AddTaskInline parentTaskId={task.id} placeholder="Add a subtask…" compact />
          </div>
        )}
      </div>
    </div>
  );
}
