import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getTasks, type TaskFilter } from "@/server/data/tasks";
import { db } from "@/lib/db";
import { TaskFilterTabs } from "@/components/tasks/task-filter-tabs";
import { NewTaskForm } from "@/components/tasks/new-task-form";
import { TaskItem } from "@/components/tasks/task-item";

const VALID_FILTERS: TaskFilter[] = ["today", "overdue", "upcoming", "all", "completed"];

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: rawFilter } = await searchParams;
  const filter = (VALID_FILTERS.includes(rawFilter as TaskFilter) ? rawFilter : "today") as TaskFilter;

  const user = await requireUser();
  const [tasks, projects] = await Promise.all([
    getTasks(user.id, filter),
    db.project.findMany({
      where: { userId: user.id, status: { not: "ARCHIVED" } },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">Everything you need to do, in one place.</p>
      </div>

      <NewTaskForm projects={projects} />

      <TaskFilterTabs active={filter} />

      <Card>
        <CardContent className="py-2">
          {tasks.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nothing here. Nice work.</p>
          ) : (
            <div className="flex flex-col divide-y">
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} showSubtaskAdd />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
