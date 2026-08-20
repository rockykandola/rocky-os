"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import vendorLeads from "@/lib/project-foundation/vendor-leads.json";

const sourceLeadSchema = z.object({
  sourceKey: z.string().trim().min(1).optional(),
  countryGroup: z.string(),
  name: z.string(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  contact: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  leadQuality: z.string().nullable().optional(),
  businessType: z.string().nullable().optional(),
  sourceUrl: z.string().nullable().optional(),
});

const identityKey = (countryGroup: string, name: string) => `${countryGroup}:${name}`.toLowerCase();
const fallbackSourceKey = (countryGroup: string, name: string, index: number) => `${identityKey(countryGroup, name).replace(/[^a-z0-9]+/g, ":").replace(/^:|:$/g, "")}:${index}`;

export async function importFoundationVendorLeads() {
  const user = await requireUser();
  const existingLeads = await db.foundationVendorLead.findMany({ where: { userId: user.id } });
  const existingBySourceKey = new Map(existingLeads.map((lead) => [lead.sourceKey, lead]));
  const existingByIdentity = new Map(existingLeads.map((lead) => [identityKey(lead.countryGroup, lead.name), lead]));

  const rows = vendorLeads.map((raw, index) => {
    const lead = sourceLeadSchema.parse(raw);
    const sourceKey = lead.sourceKey ?? fallbackSourceKey(lead.countryGroup, lead.name, index);
    const prior = existingBySourceKey.get(sourceKey) ?? existingByIdentity.get(identityKey(lead.countryGroup, lead.name));

    return {
      userId: user.id,
      sourceKey,
      countryGroup: lead.countryGroup,
      name: lead.name,
      city: lead.city ?? null,
      country: lead.country ?? null,
      address: lead.address ?? null,
      contact: lead.contact ?? null,
      email: lead.email ?? null,
      website: lead.website ?? null,
      sourceUrl: lead.sourceUrl ?? null,
      leadQuality: lead.leadQuality ?? null,
      businessType: lead.businessType ?? null,
      notes: lead.notes ?? null,
      status: prior?.status ?? "NOT_CONTACTED",
      priority: prior?.priority ?? null,
      meetingDate: prior?.meetingDate ?? null,
      followUp: prior?.followUp ?? null,
    };
  });
  const sourceKeys = rows.map((row) => row.sourceKey);

  await db.$transaction(async (tx) => {
    for (const row of rows) {
      await tx.foundationVendorLead.upsert({
        where: { userId_sourceKey: { userId: user.id, sourceKey: row.sourceKey } },
        update: {
          countryGroup: row.countryGroup,
          name: row.name,
          city: row.city,
          country: row.country,
          address: row.address,
          contact: row.contact,
          email: row.email,
          website: row.website,
          sourceUrl: row.sourceUrl,
          leadQuality: row.leadQuality,
          businessType: row.businessType,
          notes: row.notes,
          status: row.status,
          priority: row.priority,
          meetingDate: row.meetingDate,
          followUp: row.followUp,
        },
        create: row,
      });
    }

    await tx.foundationVendorLead.deleteMany({
      where: { userId: user.id, sourceKey: { notIn: sourceKeys } },
    });
  });

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
