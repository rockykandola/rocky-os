"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getValidAccessToken } from "@/lib/google/tokens";
import { listAddressCandidates } from "@/lib/google/gmail-client";
import { parseVCards } from "@/lib/vcard";

const RELATIONSHIPS = ["FAMILY", "FRIEND", "COLLEAGUE", "CLIENT", "PARTNER", "ACQUAINTANCE", "OTHER"] as const;

const contactInputSchema = z.object({
  fullName: z.string().trim().min(1).max(200),
  relationship: z.enum(RELATIONSHIPS).default("OTHER"),
  email: z.string().trim().max(300).optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  company: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
});

export async function createContact(input: z.input<typeof contactInputSchema>) {
  const user = await requireUser();
  const data = contactInputSchema.parse(input);

  const contact = await db.contact.create({
    data: {
      userId: user.id,
      fullName: data.fullName,
      relationship: data.relationship,
      email: data.email ?? null,
      phone: data.phone ?? null,
      company: data.company ?? null,
      notes: data.notes ?? null,
    },
  });

  revalidatePath("/contacts");
  return contact;
}

export async function importContactsFromGmail() {
  const user = await requireUser();
  const connections = await db.googleAccountConnection.findMany({ where: { userId: user.id } });
  if (connections.length === 0) return { imported: 0, seen: 0 };

  const myAddresses = new Set(connections.map((c) => c.email.toLowerCase()));
  const byEmail = new Map<string, string>();

  for (const connection of connections) {
    const accessToken = await getValidAccessToken(connection);
    const candidates = await listAddressCandidates(accessToken, 60);
    for (const { name, email } of candidates) {
      if (myAddresses.has(email)) continue;
      const cleanName = name.trim();
      const current = byEmail.get(email);
      // Prefer a real display name over a bare email-as-name.
      if (!current || (current === email && cleanName && cleanName !== email)) {
        byEmail.set(email, cleanName || email);
      }
    }
  }

  const existing = await db.contact.findMany({
    where: { userId: user.id, email: { in: [...byEmail.keys()] } },
    select: { email: true },
  });
  const existingEmails = new Set(existing.map((c) => c.email!));

  const toCreate = [...byEmail.entries()].filter(([email]) => !existingEmails.has(email));

  if (toCreate.length > 0) {
    await db.contact.createMany({
      data: toCreate.map(([email, name]) => ({
        userId: user.id,
        fullName: name,
        email,
        relationship: "OTHER" as const,
      })),
    });
  }

  revalidatePath("/contacts");
  return { imported: toCreate.length, seen: byEmail.size };
}

export async function importContactsFromVCard(vcardText: string) {
  const user = await requireUser();
  const parsed = parseVCards(vcardText).filter((e) => e.fullName || e.email || e.phone);

  const existing = await db.contact.findMany({
    where: { userId: user.id },
    select: { email: true, phone: true },
  });
  const existingEmails = new Set(existing.filter((c) => c.email).map((c) => c.email!.toLowerCase()));
  const existingPhones = new Set(existing.filter((c) => c.phone).map((c) => c.phone!));

  const seenEmails = new Set<string>();
  const seenPhones = new Set<string>();
  const toCreate: typeof parsed = [];

  for (const entry of parsed) {
    const emailKey = entry.email?.toLowerCase();
    if (emailKey) {
      if (existingEmails.has(emailKey) || seenEmails.has(emailKey)) continue;
      seenEmails.add(emailKey);
    } else if (entry.phone) {
      if (existingPhones.has(entry.phone) || seenPhones.has(entry.phone)) continue;
      seenPhones.add(entry.phone);
    }
    toCreate.push(entry);
  }

  if (toCreate.length > 0) {
    await db.contact.createMany({
      data: toCreate.map((e) => ({
        userId: user.id,
        fullName: e.fullName || e.email || e.phone || "Unknown",
        email: e.email,
        phone: e.phone,
        company: e.company,
        birthday: e.birthday,
        relationship: "OTHER" as const,
      })),
    });
  }

  revalidatePath("/contacts");
  return { imported: toCreate.length, seen: parsed.length };
}

export async function deleteContact(id: string) {
  const user = await requireUser();
  await db.contact.delete({ where: { id, userId: user.id } });
  revalidatePath("/contacts");
  redirect("/contacts");
}

const INTERACTION_TYPES = ["CALL", "MEETING", "MESSAGE", "EMAIL", "EVENT", "NOTE"] as const;

const interactionInputSchema = z.object({
  contactId: z.string().uuid(),
  type: z.enum(INTERACTION_TYPES).default("NOTE"),
  summary: z.string().trim().min(1).max(2000),
});

export async function logInteraction(input: z.input<typeof interactionInputSchema>) {
  const user = await requireUser();
  const data = interactionInputSchema.parse(input);

  await db.$transaction([
    db.interaction.create({
      data: { userId: user.id, contactId: data.contactId, type: data.type, summary: data.summary },
    }),
    db.contact.update({ where: { id: data.contactId, userId: user.id }, data: { lastContactedAt: new Date() } }),
  ]);

  revalidatePath(`/contacts/${data.contactId}`);
}
