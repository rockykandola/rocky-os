"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfToday } from "@/server/data/tasks";

const taskInputSchema = z.object({
  title: z.string().trim().min(1).max(300),
  notes: z.string().trim().max(5000).optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
  milestoneId: z.string().uuid().optional().nullable(),
  parentTaskId: z.string().uuid().optional().nullable(),
  assignee: z.string().trim().max(100).optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().datetime().optional().nullable(),
});

export async function createTask(input: z.input<typeof taskInputSchema>) {
  const user = await requireUser();
  const data = taskInputSchema.parse(input);

  const task = await db.task.create({
    data: {
      userId: user.id,
      title: data.title,
      notes: data.notes ?? null,
      projectId: data.projectId ?? null,
      milestoneId: data.milestoneId ?? null,
      parentTaskId: data.parentTaskId ?? null,
      assignee: data.assignee ?? null,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  return task;
}

export async function updateTask(id: string, input: Partial<z.input<typeof taskInputSchema>>) {
  const user = await requireUser();
  const data = taskInputSchema.partial().parse(input);

  const task = await db.task.update({
    where: { id, userId: user.id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.projectId !== undefined ? { projectId: data.projectId } : {}),
      ...(data.milestoneId !== undefined ? { milestoneId: data.milestoneId } : {}),
      ...(data.assignee !== undefined ? { assignee: data.assignee } : {}),
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
      ...(data.dueDate !== undefined ? { dueDate: data.dueDate ? new Date(data.dueDate) : null } : {}),
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  return task;
}

export async function setTaskStatus(id: string, status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELED") {
  const user = await requireUser();

  const task = await db.task.update({
    where: { id, userId: user.id },
    data: { status, completedAt: status === "DONE" ? new Date() : null },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  return task;
}

export async function deleteTask(id: string) {
  const user = await requireUser();
  await db.task.delete({ where: { id, userId: user.id } });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
}

export async function setTopThree(taskIds: string[]) {
  const user = await requireUser();
  const today = startOfToday();

  if (taskIds.length > 3) {
    throw new Error("Pick at most 3 priorities for today");
  }

  await db.$transaction([
    db.task.updateMany({
      where: { userId: user.id, isTopThree: true, topThreeDate: today },
      data: { isTopThree: false, topThreeDate: null },
    }),
    ...taskIds.map((id, index) =>
      db.task.update({
        where: { id, userId: user.id },
        data: { isTopThree: true, topThreeDate: today, sortOrder: index },
      }),
    ),
  ]);

  revalidatePath("/dashboard");
}
