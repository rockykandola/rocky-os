"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const projectInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().nullable(),
  area: z
    .enum(["BUSINESS", "HEALTH", "FAMILY", "FINANCE", "PERSONAL_GROWTH", "RELATIONSHIPS", "HOME", "OTHER"])
    .default("OTHER"),
  color: z.string().trim().max(20).optional().nullable(),
  targetDate: z.string().datetime().optional().nullable(),
});

export async function createProject(input: z.input<typeof projectInputSchema>) {
  const user = await requireUser();
  const data = projectInputSchema.parse(input);

  const project = await db.project.create({
    data: {
      userId: user.id,
      title: data.title,
      description: data.description ?? null,
      area: data.area,
      color: data.color ?? null,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
    },
  });

  revalidatePath("/projects");
  return project;
}

export async function updateProjectStatus(id: string, status: "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED") {
  const user = await requireUser();
  await db.project.update({
    where: { id, userId: user.id },
    data: { status, archivedAt: status === "ARCHIVED" ? new Date() : null },
  });
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
}

export async function deleteProject(id: string) {
  const user = await requireUser();
  await db.project.delete({ where: { id, userId: user.id } });
  revalidatePath("/projects");
  redirect("/projects");
}

const milestoneInputSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  dueDate: z.string().datetime().optional().nullable(),
});

export async function createMilestone(input: z.infer<typeof milestoneInputSchema>) {
  const user = await requireUser();
  const data = milestoneInputSchema.parse(input);

  const count = await db.milestone.count({ where: { projectId: data.projectId } });
  const milestone = await db.milestone.create({
    data: {
      userId: user.id,
      projectId: data.projectId,
      title: data.title,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      sortOrder: count,
    },
  });

  revalidatePath(`/projects/${data.projectId}`);
  return milestone;
}

export async function setMilestoneStatus(id: string, projectId: string, status: "NOT_STARTED" | "IN_PROGRESS" | "DONE") {
  const user = await requireUser();
  await db.milestone.update({ where: { id, userId: user.id }, data: { status } });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteMilestone(id: string, projectId: string) {
  const user = await requireUser();
  await db.milestone.delete({ where: { id, userId: user.id } });
  revalidatePath(`/projects/${projectId}`);
}
