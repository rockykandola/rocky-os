"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

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
