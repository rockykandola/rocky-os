import "server-only";
import { db } from "@/lib/db";
import { subDays } from "date-fns";
import { startOfToday } from "@/server/data/tasks";

export async function getHabitsWithRecentLogs(userId: string, days = 7) {
  const today = startOfToday();
  const since = subDays(today, days - 1);

  const habits = await db.habit.findMany({
    where: { userId, archivedAt: null },
    orderBy: { createdAt: "asc" },
    include: { logs: { where: { logDate: { gte: since } } } },
  });

  return habits;
}

export type HabitWithLogs = Awaited<ReturnType<typeof getHabitsWithRecentLogs>>[number];
