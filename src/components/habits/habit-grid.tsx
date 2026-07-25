"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, isSameDay } from "date-fns";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleHabitLog, archiveHabit } from "@/server/actions/habits";
import type { HabitWithLogs } from "@/server/data/habits";

export function HabitGrid({ habits, days }: { habits: HabitWithLogs[]; days: Date[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle(habitId: string, date: Date) {
    startTransition(async () => {
      await toggleHabitLog(habitId, date.toISOString());
      router.refresh();
    });
  }

  function remove(habitId: string) {
    startTransition(async () => {
      await archiveHabit(habitId);
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="p-3 text-left font-medium">Habit</th>
            {days.map((day) => (
              <th key={day.toISOString()} className="w-12 p-2 text-center text-xs font-medium text-muted-foreground">
                {format(day, "EEE")}
                <br />
                {format(day, "d")}
              </th>
            ))}
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {habits.map((habit) => (
            <tr key={habit.id} className={cn("border-b last:border-0", isPending && "opacity-60")}>
              <td className="p-3 font-medium">{habit.title}</td>
              {days.map((day) => {
                const logged = habit.logs.some((log) => isSameDay(new Date(log.logDate), day));
                return (
                  <td key={day.toISOString()} className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => toggle(habit.id, day)}
                      className={cn(
                        "mx-auto flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
                        logged ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      {logged && <Check className="h-3.5 w-3.5" />}
                    </button>
                  </td>
                );
              })}
              <td>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => remove(habit.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
