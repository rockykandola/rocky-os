"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getValidAccessToken } from "@/lib/google/tokens";
import { listAddressCandidates } from "@/lib/google/gmail-client";
import { parseVCards } from "@/lib/vcard";
import { parseHubspotDealsCSV } from "@/lib/hubspot-deals-csv";

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

export async function importContactsFromHubSpotCSV(csvText: string) {
  const user = await requireUser();
  const { clients, deals } = parseHubspotDealsCSV(csvText);
  if (clients.length === 0) return { newContacts: 0, matchedContacts: 0, dealsImported: 0 };

  const existing = await db.contact.findMany({
    where: { userId: user.id },
    select: { id: true, email: true, phone: true },
  });
  const existingByPhone = new Map(existing.filter((c) => c.phone).map((c) => [c.phone!, c.id]));
  const existingByEmail = new Map(existing.filter((c) => c.email).map((c) => [c.email!.toLowerCase(), c.id]));

  const keyToContactId = new Map<string, string>();
  const toCreate: typeof clients = [];
  // A client can appear under multiple keys (phone changed over the years but email stayed
  // the same) — redirect later duplicates to the first-seen key for that email so they
  // resolve to one contact instead of violating the (userId, email) unique constraint.
  const emailToRepresentativeKey = new Map<string, string>();
  const redirectKeyTo = new Map<string, string>();

  for (const client of clients) {
    const existingId = (client.phone && existingByPhone.get(client.phone)) || (client.email && existingByEmail.get(client.email));
    if (existingId) {
      keyToContactId.set(client.key, existingId);
      continue;
    }
    const representativeKey = client.email && emailToRepresentativeKey.get(client.email);
    if (representativeKey) {
      redirectKeyTo.set(client.key, representativeKey);
      continue;
    }
    if (client.email) emailToRepresentativeKey.set(client.email, client.key);
    toCreate.push(client);
  }

  if (toCreate.length > 0) {
    await db.contact.createMany({
      data: toCreate.map((c) => ({
        userId: user.id,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        company: c.company,
        relationship: "CLIENT" as const,
      })),
    });

    const createdPhones = toCreate.filter((c) => c.phone).map((c) => c.phone!);
    const createdEmails = toCreate.filter((c) => c.email).map((c) => c.email!);
    const created = await db.contact.findMany({
      where: {
        userId: user.id,
        OR: [
          ...(createdPhones.length ? [{ phone: { in: createdPhones } }] : []),
          ...(createdEmails.length ? [{ email: { in: createdEmails } }] : []),
        ],
      },
      select: { id: true, email: true, phone: true },
    });
    const createdByPhone = new Map(created.filter((c) => c.phone).map((c) => [c.phone!, c.id]));
    const createdByEmail = new Map(created.filter((c) => c.email).map((c) => [c.email!.toLowerCase(), c.id]));

    for (const client of toCreate) {
      const id = (client.phone && createdByPhone.get(client.phone)) || (client.email && createdByEmail.get(client.email));
      if (id) keyToContactId.set(client.key, id);
    }
  }

  for (const [key, representativeKey] of redirectKeyTo) {
    const id = keyToContactId.get(representativeKey);
    if (id) keyToContactId.set(key, id);
  }

  // Re-importing an updated export re-sends every old row too — dedupe against what's
  // already logged (by contact + date + exact text) so only genuinely new deals get added.
  const involvedContactIds = [...new Set(keyToContactId.values())];
  const existingInteractions = involvedContactIds.length
    ? await db.interaction.findMany({
        where: { userId: user.id, contactId: { in: involvedContactIds } },
        select: { contactId: true, occurredAt: true, summary: true },
      })
    : [];
  const existingSignatures = new Set(existingInteractions.map((i) => `${i.contactId}|${i.occurredAt.getTime()}|${i.summary}`));

  const interactionRows = deals
    .map((d) => {
      const contactId = keyToContactId.get(d.key);
      if (!contactId) return null;
      const summary = d.summary.slice(0, 4900);
      const signature = `${contactId}|${d.occurredAt.getTime()}|${summary}`;
      if (existingSignatures.has(signature)) return null;
      existingSignatures.add(signature);
      return { userId: user.id, contactId, type: "NOTE" as const, summary, occurredAt: d.occurredAt };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (interactionRows.length > 0) {
    await db.interaction.createMany({ data: interactionRows });
  }

  revalidatePath("/contacts");
  return {
    newContacts: toCreate.length,
    matchedContacts: clients.length - toCreate.length,
    dealsImported: interactionRows.length,
  };
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
