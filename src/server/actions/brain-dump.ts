"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { categorizeBrainDumpText } from "@/lib/ai/categorize-brain-dump";

export async function categorizeItem(id: string) {
  const user = await requireUser();
  const item = await db.brainDumpItem.findUnique({ where: { id, userId: user.id } });
  if (!item) return;

  const suggestion = await categorizeBrainDumpText(item.rawText);

  await db.brainDumpItem.update({
    where: { id },
    data: {
      status: "CATEGORIZED",
      suggestedType: suggestion.type,
      suggestedTitle: suggestion.title,
      aiRationale: suggestion.rationale,
    },
  });

  revalidatePath("/brain-dump");
}

export async function categorizeAllPending() {
  const user = await requireUser();
  const pending = await db.brainDumpItem.findMany({
    where: { userId: user.id, status: "PENDING" },
    take: 25,
  });

  for (const item of pending) {
    const suggestion = await categorizeBrainDumpText(item.rawText);
    await db.brainDumpItem.update({
      where: { id: item.id },
      data: {
        status: "CATEGORIZED",
        suggestedType: suggestion.type,
        suggestedTitle: suggestion.title,
        aiRationale: suggestion.rationale,
      },
    });
  }

  revalidatePath("/brain-dump");
}

export async function convertToTask(id: string, title: string) {
  const user = await requireUser();
  const task = await db.task.create({ data: { userId: user.id, title } });
  await db.brainDumpItem.update({
    where: { id, userId: user.id },
    data: { status: "CONVERTED", convertedEntityType: "TASK", convertedEntityId: task.id },
  });
  revalidatePath("/brain-dump");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function convertToProject(id: string, title: string) {
  const user = await requireUser();
  const project = await db.project.create({ data: { userId: user.id, title } });
  await db.brainDumpItem.update({
    where: { id, userId: user.id },
    data: { status: "CONVERTED", convertedEntityType: "PROJECT", convertedEntityId: project.id },
  });
  revalidatePath("/brain-dump");
  revalidatePath("/projects");
}

export async function convertToNote(id: string, title: string) {
  const user = await requireUser();
  const item = await db.brainDumpItem.findUniqueOrThrow({ where: { id, userId: user.id } });
  const note = await db.note.create({
    data: { userId: user.id, entityType: "NONE", title, body: item.rawText },
  });
  await db.brainDumpItem.update({
    where: { id, userId: user.id },
    data: { status: "CONVERTED", convertedEntityType: "NONE", convertedEntityId: note.id },
  });
  revalidatePath("/brain-dump");
}

export async function dismissItem(id: string) {
  const user = await requireUser();
  await db.brainDumpItem.update({ where: { id, userId: user.id }, data: { status: "DISMISSED" } });
  revalidatePath("/brain-dump");
}
