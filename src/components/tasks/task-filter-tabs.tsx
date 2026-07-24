import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TaskFilter } from "@/server/data/tasks";

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "overdue", label: "Overdue" },
  { value: "upcoming", label: "Upcoming" },
  { value: "all", label: "All open" },
  { value: "completed", label: "Completed" },
];

export function TaskFilterTabs({ active }: { active: TaskFilter }) {
  return (
    <div className="flex w-fit gap-1 rounded-lg border bg-muted/40 p-1">
      {FILTERS.map((f) => (
        <Link
          key={f.value}
          href={`/tasks?filter=${f.value}`}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            active === f.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {f.label}
        </Link>
      ))}
    </div>
  );
}
