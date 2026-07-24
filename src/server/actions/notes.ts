"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const noteInputSchema = z.object({
  entityType: z.enum(["PROJECT", "MILESTONE", "TASK", "CONTACT", "JOURNAL_ENTRY", "DAILY_PLAN", "NONE"]),
  entityId: z.string().uuid().nullable(),
  title: z.string().trim().max(200).optional().nullable(),
  body: z.string().trim().min(1).max(20000),
  revalidate: z.string(),
});

export async function createNote(input: z.infer<typeof noteInputSchema>) {
  const user = await requireUser();
  const data = noteInputSchema.parse(input);

  const note = await db.note.create({
    data: {
      userId: user.id,
      entityType: data.entityType,
      entityId: data.entityId,
      title: data.title ?? null,
      body: data.body,
    },
  });

  revalidatePath(data.revalidate);
  return note;
}

export async function deleteNote(id: string, revalidate: string) {
  const user = await requireUser();
  await db.note.delete({ where: { id, userId: user.id } });
  revalidatePath(revalidate);
}
