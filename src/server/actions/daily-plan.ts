"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfToday } from "@/server/data/tasks";
import { generateMorningSummary, generateEveningSummary } from "@/lib/ai/daily-plan";

const morningInputSchema = z.object({
  intentions: z.string().trim().max(2000).optional().nullable(),
  taskIds: z.array(z.string().uuid()).max(10).default([]),
});

export async function saveMorningPlan(input: z.infer<typeof morningInputSchema>) {
  const user = await requireUser();
  const data = morningInputSchema.parse(input);
  const planDate = startOfToday();

  const tasks = data.taskIds.length
    ? await db.task.findMany({ where: { id: { in: data.taskIds }, userId: user.id }, select: { title: true } })
    : [];

  const aiSummary = await generateMorningSummary({
    intentions: data.intentions ?? null,
    taskTitles: tasks.map((t) => t.title),
  });

  const plan = await db.dailyPlan.upsert({
    where: { userId_planDate_kind: { userId: user.id, planDate, kind: "MORNING" } },
    update: { intentions: data.intentions ?? null, taskIds: data.taskIds, aiSummary, completedAt: new Date() },
    create: {
      userId: user.id,
      planDate,
      kind: "MORNING",
      intentions: data.intentions ?? null,
      taskIds: data.taskIds,
      aiSummary,
      completedAt: new Date(),
    },
  });

  revalidatePath("/planner");
  return plan;
}

const eveningInputSchema = z.object({
  wins: z.string().trim().max(2000).optional().nullable(),
  challenges: z.string().trim().max(2000).optional().nullable(),
  gratitude: z.string().trim().max(2000).optional().nullable(),
});

export async function saveEveningReview(input: z.infer<typeof eveningInputSchema>) {
  const user = await requireUser();
  const data = eveningInputSchema.parse(input);
  const planDate = startOfToday();

  const aiSummary = await generateEveningSummary({
    wins: data.wins ?? null,
    challenges: data.challenges ?? null,
    gratitude: data.gratitude ?? null,
  });

  const plan = await db.dailyPlan.upsert({
    where: { userId_planDate_kind: { userId: user.id, planDate, kind: "EVENING" } },
    update: { ...data, aiSummary, completedAt: new Date() },
    create: { userId: user.id, planDate, kind: "EVENING", ...data, aiSummary, completedAt: new Date() },
  });

  revalidatePath("/planner");
  return plan;
}
