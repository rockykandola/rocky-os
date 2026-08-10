"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import vendorLeads from "@/lib/project-foundation/vendor-leads.json";

const sourceLeadSchema = z.object({
  countryGroup: z.string(), name: z.string(), city: z.string().nullable().optional(), country: z.string().nullable().optional(),
  address: z.string().nullable().optional(), contact: z.string().nullable().optional(), email: z.string().nullable().optional(),
  website: z.string().nullable().optional(), notes: z.string().nullable().optional(), leadQuality: z.string().nullable().optional(),
  businessType: z.string().nullable().optional(), sourceUrl: z.string().nullable().optional(),
});

export async function importFoundationVendorLeads() {
  const user = await requireUser();
  const rows = vendorLeads.map((raw, index) => ({
    ...sourceLeadSchema.parse(raw),
    userId: user.id,
    sourceKey: `${raw.countryGroup}:${raw.name}:${index}`,
    leadQuality: raw.leadQuality ?? null,
    businessType: raw.businessType ?? null,
    city: raw.city ?? null,
    country: raw.country ?? null,
    address: raw.address ?? null,
    contact: raw.contact ?? null,
    email: raw.email ?? null,
    website: raw.website ?? null,
    sourceUrl: raw.sourceUrl ?? null,
  }));

  await db.$transaction(rows.map((row) => db.foundationVendorLead.upsert({
    where: { userId_sourceKey: { userId: user.id, sourceKey: row.sourceKey } },
    update: { countryGroup: row.countryGroup, name: row.name, city: row.city, country: row.country, address: row.address, contact: row.contact, email: row.email, website: row.website, sourceUrl: row.sourceUrl, leadQuality: row.leadQuality, businessType: row.businessType },
    create: row,
  })));

  revalidatePath("/project-foundation");
}

const updateLeadSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["NOT_CONTACTED", "CONTACTED", "MEETING_REQUESTED", "MEETING_SET", "MET", "QUALIFIED", "REJECTED"]),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional().nullable(),
  meetingDate: z.string().trim().max(120).optional().nullable(),
  followUp: z.string().trim().max(2000).optional().nullable(),
});

export async function updateFoundationVendorLead(input: z.input<typeof updateLeadSchema>) {
  const user = await requireUser();
  const data = updateLeadSchema.parse(input);
  await db.foundationVendorLead.update({
    where: { id: data.id, userId: user.id },
    data: { status: data.status, priority: data.priority ?? null, meetingDate: data.meetingDate || null, followUp: data.followUp || null },
  });
  revalidatePath("/project-foundation");
}
