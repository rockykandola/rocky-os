"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getValidAccessToken } from "@/lib/google/tokens";
import { getMessageDetail, getThreadMessages, listSentSamples, stripQuotedReply } from "@/lib/google/gmail-client";
import { generateEmailDraftReply } from "@/lib/ai/email-draft";

function emailAddressOf(headerValue: string): string {
  const match = headerValue.match(/<([^>]+)>/);
  return (match ? match[1] : headerValue).trim().toLowerCase();
}

export async function draftEmailReply(connectionId: string, messageId: string) {
  const user = await requireUser();
  const connection = await db.googleAccountConnection.findUniqueOrThrow({
    where: { id: connectionId, userId: user.id },
  });

  const accessToken = await getValidAccessToken(connection);
  const message = await getMessageDetail(accessToken, messageId);

  const [threadMessages, writingSamples, projects] = await Promise.all([
    getThreadMessages(accessToken, message.threadId),
    listSentSamples(accessToken, 5),
    db.project.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      select: { title: true },
      take: 15,
    }),
  ]);

  const myAddress = emailAddressOf(connection.email);
  const threadHistory = threadMessages
    .filter((m) => m.id !== message.id && m.body.trim().length > 0)
    .map((m) => ({
      from: m.from,
      date: m.date,
      body: stripQuotedReply(m.body),
      isFromMe: emailAddressOf(m.from) === myAddress,
    }));

  const draftBody = await generateEmailDraftReply({
    subject: message.subject,
    latestFrom: message.from,
    latestBody: stripQuotedReply(message.body),
    threadHistory,
    voiceNotes: user.voiceNotes,
    writingSamples,
    businessNames: projects.map((p) => p.title),
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

const voiceNotesSchema = z.string().trim().max(4000);

export async function updateVoiceNotes(notes: string) {
  const user = await requireUser();
  const parsed = voiceNotesSchema.parse(notes);
  await db.user.update({ where: { id: user.id }, data: { voiceNotes: parsed || null } });
  revalidatePath("/gmail");
}
