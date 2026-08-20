import Link from "next/link";
import { ArrowRight, CalendarDays, HeartPulse, Plane, Target, Wallet } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getFoundationOverview } from "@/server/data/project-foundation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImportVendorLeadsButton } from "@/components/project-foundation/import-vendor-leads-button";
import { SourcingResearchPanel } from "@/components/project-foundation/sourcing-research-panel";
import { VendorLeadTable, type FoundationVendorLeadView } from "@/components/project-foundation/vendor-lead-table";

export default async function ProjectFoundationPage() {
  const user = await requireUser();
  const overview = await getFoundationOverview(user.id);
  const vendorLeads: FoundationVendorLeadView[] = overview.leads.map((lead) => ({
    id: lead.id,
    countryGroup: lead.countryGroup,
    name: lead.name,
    city: lead.city,
    country: lead.country,
    address: lead.address,
    contact: lead.contact,
    email: lead.email,
    website: lead.website,
    sourceUrl: lead.sourceUrl,
    leadQuality: lead.leadQuality,
    businessType: lead.businessType,
    notes: lead.notes,
    status: lead.status,
    priority: lead.priority,
    meetingDate: lead.meetingDate,
    followUp: lead.followUp,
  }));

  return <div className="mx-auto flex max-w-7xl flex-col gap-6">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-semibold tracking-[0.18em] text-primary">PROJECT FOUNDATION</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Build a clearer next chapter.</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">One operating space for the reset, family visit, booked itinerary, business-building, and hair-sourcing expedition.</p></div><div className="flex gap-2"><ImportVendorLeadsButton /><Link href="/planner" className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">Open planner <ArrowRight className="h-4 w-4" /></Link></div></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Card><CardContent className="flex items-center gap-3 p-5"><CalendarDays className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Day 1</p><p className="font-semibold">August 20, 2026</p><p className="text-xs text-muted-foreground">Mobile visit Aug 15–18</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-3 p-5"><Plane className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Booked air value</p><p className="font-semibold">$1,660.67</p><p className="text-xs text-muted-foreground">$439.68 cash + rewards</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-3 p-5"><Target className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Vendor leads</p><p className="font-semibold">{overview.totalLeads || 34}</p><p className="text-xs text-muted-foreground">{overview.contacted} contacted · {overview.meetingsSet} meetings set</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-3 p-5"><HeartPulse className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Reset priorities</p><p className="font-semibold">Clarity + family</p><p className="text-xs text-muted-foreground">Protect the experiment</p></div></CardContent></Card></div>
    <div className="grid gap-4 md:grid-cols-3"><Card className="md:col-span-2"><CardHeader><CardTitle className="text-base">Trip anchors</CardTitle></CardHeader><CardContent className="grid gap-3 text-sm sm:grid-cols-2"><div className="rounded-lg bg-muted/50 p-3"><Badge variant="secondary">Aug 15–18</Badge><p className="mt-2 font-medium">Mobile, Alabama</p><p className="text-muted-foreground">Surprise visit with mom and dad.</p></div><div className="rounded-lg bg-muted/50 p-3"><Badge variant="secondary">Aug 20</Badge><p className="mt-2 font-medium">Day 1: LA → Athens</p><p className="text-muted-foreground">Project Foundation begins.</p></div><div className="rounded-lg bg-muted/50 p-3"><Badge variant="secondary">Sep 15–Oct 5</Badge><p className="mt-2 font-medium">Vendor-search window</p><p className="text-muted-foreground">Myanmar, Cambodia, Vietnam, then India.</p></div><div className="rounded-lg bg-muted/50 p-3"><Badge variant="secondary">Open</Badge><p className="mt-2 font-medium">Return to USA</p><p className="text-muted-foreground">Still needs booking and baggage plan.</p></div></CardContent></Card><Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Wallet className="h-4 w-4 text-primary" />Budget guardrails</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Travel target</span><strong>$2,000</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Inventory</span><strong>$4k–$8k</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Fallback lodging</span><strong>$1,170</strong></div><p className="border-t pt-3 text-xs text-muted-foreground">Hosted stays with Jimmy may lower lodging costs; keep paid fallback estimates until dates are confirmed.</p></CardContent></Card></div>
    <SourcingResearchPanel />
    {vendorLeads.length === 0 ? <Card><CardContent className="py-12 text-center"><p className="font-medium">The updated sourcing workbook is ready to import.</p><p className="mt-1 text-sm text-muted-foreground">Import the 34 lead Myanmar, Cambodia, and Vietnam list to start outreach from Rocky OS.</p></CardContent></Card> : <VendorLeadTable leads={vendorLeads} />}
  </div>;
}
