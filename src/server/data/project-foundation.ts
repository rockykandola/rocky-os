import "server-only";
import { db } from "@/lib/db";

export async function getFoundationVendorLeads(userId: string) {
  return db.foundationVendorLead.findMany({
    where: { userId },
    orderBy: [{ countryGroup: "asc" }, { leadQuality: "asc" }, { name: "asc" }],
  });
}

export async function getFoundationOverview(userId: string) {
  const leads = await getFoundationVendorLeads(userId);
  const byCountry = Object.entries(
    leads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.countryGroup] = (acc[lead.countryGroup] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([country, count]) => ({ country, count }));

  return {
    leads,
    byCountry,
    totalLeads: leads.length,
    contacted: leads.filter((lead) => lead.status !== "NOT_CONTACTED").length,
    meetingsSet: leads.filter((lead) => lead.status === "MEETING_SET").length,
    qualified: leads.filter((lead) => lead.status === "QUALIFIED").length,
  };
}
