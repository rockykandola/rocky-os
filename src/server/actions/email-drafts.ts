"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getValidAccessToken } from "@/lib/google/tokens";
import { getMessageDetail } from "@/lib/google/gmail-client";
import { generateEmailDraftReply } from "@/lib/ai/email-draft";

export async function draftEmailReply(connectionId: string, messageId: string) {
  const user = await requireUser();
  const connection = await db.googleAccountConnection.findUniqueOrThrow({
    where: { id: connectionId, userId: user.id },
  });

  const accessToken = await getValidAccessToken(connection);
  const message = await getMessageDetail(accessToken, messageId);
  const draftBody = await generateEmailDraftReply({
    subject: message.subject,
    from: message.from,
    body: message.body,
  });

  const draft = await db.emailDraft.upsert({
    where: { userId_gmailMessageId: { userId: user.id, gmailMessageId: message.id } },
    update: { draftBody, originalBody: message.body, subject: message.subject, fromAddress: message.from },
    create: {
      userId: user.id,
      connectionId: connection.id,
      gmailMessageId: message.id,
      gmailThreadId: message.threadId,
      subject: message.subject,
      fromAddress: message.from,
      originalBody: message.body,
      draftBody,
    },
  });

  revalidatePath("/gmail");
  revalidatePath("/gmail/drafts");
  return draft;
}

export async function deleteEmailDraft(id: string) {
  const user = await requireUser();
  await db.emailDraft.delete({ where: { id, userId: user.id } });
  revalidatePath("/gmail/drafts");
}
