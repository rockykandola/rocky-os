import { subDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getHabitsWithRecentLogs } from "@/server/data/habits";
import { startOfToday } from "@/server/data/tasks";
import { HabitGrid } from "@/components/habits/habit-grid";
import { AddHabitDialog } from "@/components/habits/add-habit-dialog";

export default async function HabitsPage() {
  const user = await requireUser();
  const habits = await getHabitsWithRecentLogs(user.id);

  const today = startOfToday();
  const days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
          <p className="text-sm text-muted-foreground">The last 7 days, at a glance.</p>
        </div>
        <AddHabitDialog />
      </div>

      {habits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No habits yet. Add one to start tracking.</p>
          </CardContent>
        </Card>
      ) : (
        <HabitGrid habits={habits} days={days} />
      )}
    </div>
  );
}
