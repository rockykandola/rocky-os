"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const habitInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  area: z
    .enum(["BUSINESS", "HEALTH", "FAMILY", "FINANCE", "PERSONAL_GROWTH", "RELATIONSHIPS", "HOME", "OTHER"])
    .default("HEALTH"),
});

export async function createHabit(input: z.input<typeof habitInputSchema>) {
  const user = await requireUser();
  const data = habitInputSchema.parse(input);

  const habit = await db.habit.create({
    data: { userId: user.id, title: data.title, area: data.area, frequency: "DAILY", targetPerPeriod: 1 },
  });

  revalidatePath("/habits");
  return habit;
}

export async function toggleHabitLog(habitId: string, date: string) {
  const user = await requireUser();
  const logDate = new Date(date);

  const existing = await db.habitLog.findUnique({
    where: { habitId_logDate: { habitId, logDate } },
  });

  if (existing) {
    await db.habitLog.delete({ where: { id: existing.id } });
  } else {
    await db.habitLog.create({ data: { userId: user.id, habitId, logDate } });
  }

  revalidatePath("/habits");
}

export async function archiveHabit(id: string) {
  const user = await requireUser();
  await db.habit.update({ where: { id, userId: user.id }, data: { archivedAt: new Date() } });
  revalidatePath("/habits");
}
