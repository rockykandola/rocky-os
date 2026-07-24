import "server-only";
import { db } from "@/lib/db";
import { startOfToday } from "@/server/data/tasks";

export async function getTodaysPlans(userId: string, date = startOfToday()) {
  const [morning, evening] = await Promise.all([
    db.dailyPlan.findUnique({ where: { userId_planDate_kind: { userId, planDate: date, kind: "MORNING" } } }),
    db.dailyPlan.findUnique({ where: { userId_planDate_kind: { userId, planDate: date, kind: "EVENING" } } }),
  ]);
  return { morning, evening };
}
