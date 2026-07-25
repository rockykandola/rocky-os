"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfToday } from "@/server/data/tasks";
import { generateJournalSummary } from "@/lib/ai/journal";

const journalInputSchema = z.object({
  title: z.string().trim().max(200).optional().nullable(),
  body: z.string().trim().min(1).max(20000),
  mood: z.number().int().min(1).max(5).optional().nullable(),
});

export async function saveTodaysJournalEntry(input: z.input<typeof journalInputSchema>) {
  const user = await requireUser();
  const data = journalInputSchema.parse(input);
  const entryDate = startOfToday();

  const aiSummary = await generateJournalSummary(data.body, data.mood ?? null);

  const entry = await db.journalEntry.upsert({
    where: { userId_entryDate: { userId: user.id, entryDate } },
    update: { title: data.title ?? null, body: data.body, mood: data.mood ?? null, aiSummary },
    create: {
      userId: user.id,
      entryDate,
      title: data.title ?? null,
      body: data.body,
      mood: data.mood ?? null,
      aiSummary,
    },
  });

  revalidatePath("/journal");
  return entry;
}
