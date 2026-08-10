"use client";

import { useMemo, useState, useTransition } from "react";
import { ExternalLink, Search } from "lucide-react";
import { updateFoundationVendorLead } from "@/server/actions/project-foundation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FoundationVendorLead } from "@/generated/prisma/client";

const statuses = ["NOT_CONTACTED", "CONTACTED", "MEETING_REQUESTED", "MEETING_SET", "MET", "QUALIFIED", "REJECTED"] as const;
const priorities = ["HIGH", "MEDIUM", "LOW"] as const;
const label = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/(^| )\w/g, (c) => c.toUpperCase());

export function VendorLeadTable({ leads }: { leads: FoundationVendorLead[] }) {
  const [country, setCountry] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(leads[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const selected = leads.find((lead) => lead.id === selectedId) ?? leads[0];
  const countries = [...new Set(leads.map((lead) => lead.countryGroup))];
  const filtered = useMemo(() => leads.filter((lead) => {
    const haystack = `${lead.name} ${lead.city ?? ""} ${lead.contact ?? ""} ${lead.email ?? ""}`.toLowerCase();
    return (country === "ALL" || lead.countryGroup === country) && (status === "ALL" || lead.status === status) && haystack.includes(search.toLowerCase());
  }), [country, status, search, leads]);

  function save(data: FormData) {
    if (!selected) return;
    const rawStatus = String(data.get("status"));
    const rawPriority = String(data.get("priority") ?? "");
    if (!statuses.includes(rawStatus as (typeof statuses)[number])) return;
    if (rawPriority && !priorities.includes(rawPriority as (typeof priorities)[number])) return;
    startTransition(async () => {
      await updateFoundationVendorLead({ id: selected.id, status: rawStatus as (typeof statuses)[number], priority: rawPriority ? rawPriority as (typeof priorities)[number] : null, meetingDate: String(data.get("meetingDate")), followUp: String(data.get("followUp")) });
    });
  }

  return <div className="flex flex-col gap-4">
    <Card>
      <CardHeader><CardTitle className="text-base">Vendor outreach pipeline</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div><Label>Country</Label><Select value={country} onValueChange={(value) => setCountry(value ?? "ALL")}><SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All countries</SelectItem>{countries.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Status</Label><Select value={status} onValueChange={(value) => setStatus(value ?? "ALL")}><SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All statuses</SelectItem>{statuses.map((item) => <SelectItem key={item} value={item}>{label(item)}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Search</Label><div className="relative mt-1"><Search className="absolute top-2 left-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-8" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Vendor, city, contact" /></div></div>
        </div>
        <p className="text-xs text-muted-foreground">Showing {filtered.length} of {leads.length} leads. Contact the strongest Vietnam and Cambodia factory leads first; treat Myanmar as exploratory.</p>
        <div className="overflow-x-auto rounded-md border"><table className="w-full min-w-[900px] text-sm"><thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr><th className="p-3">Vendor</th><th className="p-3">Country / city</th><th className="p-3">Contact</th><th className="p-3">Status</th><th className="p-3">Meeting</th><th className="p-3">Source</th></tr></thead><tbody>{filtered.map((lead) => <tr key={lead.id} className="border-t"><td className="p-3"><button className="text-left font-medium hover:text-primary" onClick={() => setSelectedId(lead.id)}>{lead.name}</button><div className="text-xs text-muted-foreground">{lead.businessType ?? ""} · {lead.leadQuality ?? ""}</div></td><td className="p-3">{lead.countryGroup}<br /><span className="text-xs text-muted-foreground">{lead.city}</span></td><td className="p-3">{lead.contact ?? lead.email ?? "—"}</td><td className="p-3"><Badge variant={lead.status === "QUALIFIED" ? "default" : "outline"}>{label(lead.status)}</Badge>{lead.priority && <div className="mt-1 text-xs text-muted-foreground">{label(lead.priority)} priority</div>}</td><td className="p-3">{lead.meetingDate ?? "—"}</td><td className="p-3">{lead.sourceUrl && <a className="inline-flex items-center gap-1 text-primary" href={lead.sourceUrl} target="_blank" rel="noreferrer">Open <ExternalLink className="h-3 w-3" /></a>}</td></tr>)}</tbody></table></div>
      </CardContent>
    </Card>
    {selected && <Card><CardHeader><CardTitle className="text-base">Update outreach: {selected.name}</CardTitle></CardHeader><CardContent><form action={save} className="grid gap-4 md:grid-cols-2"><div><Label>Status</Label><Select name="status" defaultValue={selected.status}><SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger><SelectContent>{statuses.map((item) => <SelectItem key={item} value={item}>{label(item)}</SelectItem>)}</SelectContent></Select></div><div><Label>Meeting priority</Label><Select name="priority" defaultValue={selected.priority ?? ""}><SelectTrigger className="mt-1 w-full"><SelectValue placeholder="None" /></SelectTrigger><SelectContent><SelectItem value="">None</SelectItem>{priorities.map((item) => <SelectItem key={item} value={item}>{label(item)}</SelectItem>)}</SelectContent></Select></div><div><Label>Meeting date/time</Label><Input name="meetingDate" className="mt-1" defaultValue={selected.meetingDate ?? ""} placeholder="Sep 18, 10:00 AM" /></div><div className="md:col-span-2"><Label>Follow-up notes</Label><Textarea name="followUp" className="mt-1" defaultValue={selected.followUp ?? ""} placeholder="Message sent, response, next action..." /></div><div className="md:col-span-2 flex justify-end"><Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save outreach update"}</Button></div></form></CardContent></Card>}
  </div>;
}
