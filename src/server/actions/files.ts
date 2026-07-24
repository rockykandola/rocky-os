"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export const ATTACHMENTS_BUCKET = "attachments";

const attachInputSchema = z.object({
  entityType: z.enum(["PROJECT", "MILESTONE", "TASK", "CONTACT", "JOURNAL_ENTRY", "DAILY_PLAN", "NONE"]),
  entityId: z.string().uuid().nullable(),
  fileName: z.string().trim().min(1).max(300),
  storagePath: z.string().trim().min(1),
  mimeType: z.string().trim().max(200).optional().nullable(),
  sizeBytes: z.number().int().nonnegative().optional().nullable(),
  revalidate: z.string(),
});

/** Records metadata for a file already uploaded to Supabase Storage by the client. */
export async function attachFile(input: z.infer<typeof attachInputSchema>) {
  const user = await requireUser();
  const data = attachInputSchema.parse(input);

  const file = await db.fileAsset.create({
    data: {
      userId: user.id,
      entityType: data.entityType,
      entityId: data.entityId,
      fileName: data.fileName,
      storagePath: data.storagePath,
      mimeType: data.mimeType ?? null,
      sizeBytes: data.sizeBytes ?? null,
    },
  });

  revalidatePath(data.revalidate);
  return file;
}

export async function deleteFile(id: string, revalidate: string) {
  const user = await requireUser();
  const file = await db.fileAsset.findUnique({ where: { id, userId: user.id } });
  if (!file) return;

  const supabase = await createClient();
  await supabase.storage.from(ATTACHMENTS_BUCKET).remove([file.storagePath]);
  await db.fileAsset.delete({ where: { id, userId: user.id } });

  revalidatePath(revalidate);
}
