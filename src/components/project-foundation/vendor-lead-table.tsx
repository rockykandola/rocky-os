"use client";

import { useMemo, useState, useTransition } from "react";
import { ExternalLink, MessageCircle, Phone, Search } from "lucide-react";
import { updateFoundationVendorLead } from "@/server/actions/project-foundation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FoundationVendorPriority, FoundationVendorStatus } from "@/generated/prisma/client";

export type FoundationVendorLeadView = {
  id: string;
  countryGroup: string;
  name: string;
  city: string | null;
  country: string | null;
  address: string | null;
  contact: string | null;
  email: string | null;
  website: string | null;
  sourceUrl: string | null;
  leadQuality: string | null;
  businessType: string | null;
  notes: string | null;
  status: FoundationVendorStatus;
  priority: FoundationVendorPriority | null;
  meetingDate: string | null;
  followUp: string | null;
};

const statuses = ["NOT_CONTACTED", "CONTACTED", "MEETING_REQUESTED", "MEETING_SET", "MET", "QUALIFIED", "REJECTED"] as const;
const priorities = ["HIGH", "MEDIUM", "LOW"] as const;
const label = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/(^| )\w/g, (c) => c.toUpperCase());
const phoneParts = (value: string | null) => (value ?? "").split("/").map((part) => part.trim()).filter(Boolean);
const normalizePhone = (value: string) => value.replace(/[^0-9]/g, "");
const whatsAppLinksFromNotes = (notes: string | null) => [...(notes ?? "").matchAll(/https:\/\/wa\.me\/[0-9]+/g)].map((match) => match[0]);

function contactActions(lead: FoundationVendorLeadView) {
  const phones = phoneParts(lead.contact);
  const phoneLinks = phones.map((phone) => ({ label: phone, href: `tel:${phone.replace(/\s/g, "")}` }));
  const whatsAppLinks = Array.from(new Set([
    ...phones.map(normalizePhone).filter(Boolean).map((phone) => `https://wa.me/${phone}`),
    ...whatsAppLinksFromNotes(lead.notes),
  ]));

  return { phoneLinks, whatsAppLinks };
}

function noteLines(notes: string | null) {
  return (notes ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
}

export function VendorLeadTable({ leads }: { leads: FoundationVendorLeadView[] }) {
  const [country, setCountry] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(leads[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const selected = leads.find((lead) => lead.id === selectedId) ?? leads[0];
  const countries = [...new Set(leads.map((lead) => lead.countryGroup))];
  const filtered = useMemo(() => leads.filter((lead) => {
    const haystack = `${lead.name} ${lead.city ?? ""} ${lead.contact ?? ""} ${lead.email ?? ""} ${lead.website ?? ""} ${lead.businessType ?? ""} ${lead.leadQuality ?? ""} ${lead.notes ?? ""}`.toLowerCase();
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
          <div><Label>Search</Label><div className="relative mt-1"><Search className="absolute top-2 left-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-8" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Vendor, city, contact, product, risk" /></div></div>
        </div>
        <p className="text-xs text-muted-foreground">Showing {filtered.length} of {leads.length} leads. WhatsApp links open directly where phone data exists. Myanmar should stay video verified before any in person visit.</p>
        <div className="overflow-x-auto rounded-md border"><table className="w-full min-w-[1180px] text-sm"><thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr><th className="p-3">Vendor</th><th className="p-3">Country / city</th><th className="p-3">Contact</th><th className="p-3">Status</th><th className="p-3">Meeting</th><th className="p-3">Notes / source</th></tr></thead><tbody>{filtered.map((lead) => {
          const actions = contactActions(lead);
          return <tr key={lead.id} className="border-t align-top"><td className="p-3"><button className="text-left font-medium hover:text-primary" onClick={() => setSelectedId(lead.id)}>{lead.name}</button><div className="mt-1 text-xs text-muted-foreground">{lead.businessType ?? "Lead"} · {lead.leadQuality ?? "Verify"}</div></td><td className="p-3">{lead.countryGroup}<br /><span className="text-xs text-muted-foreground">{lead.city}</span></td><td className="p-3"><div className="flex flex-wrap gap-2">{actions.whatsAppLinks.map((href, index) => <a key={href} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-primary hover:bg-muted" href={href} target="_blank" rel="noreferrer"><MessageCircle className="h-3 w-3" />WhatsApp {index + 1}</a>)}{actions.phoneLinks.map((item) => <a key={item.href} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted" href={item.href}><Phone className="h-3 w-3" />Call</a>)}</div><p className="mt-2 text-xs text-muted-foreground">{lead.contact ?? lead.email ?? "No direct contact listed"}</p></td><td className="p-3"><Badge variant={lead.status === "QUALIFIED" ? "default" : "outline"}>{label(lead.status)}</Badge>{lead.priority && <div className="mt-1 text-xs text-muted-foreground">{label(lead.priority)} priority</div>}</td><td className="p-3">{lead.meetingDate ?? "..."}</td><td className="p-3"><p className="line-clamp-3 text-xs text-muted-foreground">{lead.notes ?? "Verify live before buying."}</p><div className="mt-2 flex flex-wrap gap-3">{lead.sourceUrl && <a className="inline-flex items-center gap-1 text-xs font-medium text-primary" href={lead.sourceUrl} target="_blank" rel="noreferrer">Source <ExternalLink className="h-3 w-3" /></a>}{lead.website && <span className="text-xs text-muted-foreground">{lead.website}</span>}</div></td></tr>;
        })}</tbody></table></div>
      </CardContent>
    </Card>
    {selected && <Card><CardHeader><CardTitle className="text-base">Update outreach: {selected.name}</CardTitle></CardHeader><CardContent className="grid gap-5"><div className="rounded-lg border bg-muted/30 p-4 text-sm"><div className="grid gap-3 md:grid-cols-2"><div><p className="text-xs font-medium text-muted-foreground">Contact</p><p>{selected.contact ?? "No direct contact listed"}</p></div><div><p className="text-xs font-medium text-muted-foreground">Address / city</p><p>{selected.address ?? selected.city ?? "Verify before visit"}</p></div></div>{noteLines(selected.notes).length > 0 && <div className="mt-4 grid gap-2">{noteLines(selected.notes).map((line) => <p key={line} className="text-xs text-muted-foreground">{line}</p>)}</div>}<div className="mt-4 flex flex-wrap gap-2">{contactActions(selected).whatsAppLinks.map((href, index) => <a key={href} className="inline-flex items-center gap-1 rounded-md border bg-background px-3 py-2 text-xs font-medium text-primary hover:bg-muted" href={href} target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5" />Message on WhatsApp {index + 1}</a>)}{selected.sourceUrl && <a className="inline-flex items-center gap-1 rounded-md border bg-background px-3 py-2 text-xs font-medium text-primary hover:bg-muted" href={selected.sourceUrl} target="_blank" rel="noreferrer">Open source <ExternalLink className="h-3.5 w-3.5" /></a>}</div></div><form action={save} className="grid gap-4 md:grid-cols-2"><div><Label>Status</Label><Select name="status" defaultValue={selected.status}><SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger><SelectContent>{statuses.map((item) => <SelectItem key={item} value={item}>{label(item)}</SelectItem>)}</SelectContent></Select></div><div><Label>Meeting priority</Label><Select name="priority" defaultValue={selected.priority ?? ""}><SelectTrigger className="mt-1 w-full"><SelectValue placeholder="None" /></SelectTrigger><SelectContent><SelectItem value="">None</SelectItem>{priorities.map((item) => <SelectItem key={item} value={item}>{label(item)}</SelectItem>)}</SelectContent></Select></div><div><Label>Meeting date/time</Label><Input name="meetingDate" className="mt-1" defaultValue={selected.meetingDate ?? ""} placeholder="Sep 18, 10:00 AM" /></div><div className="md:col-span-2"><Label>Follow-up notes</Label><Textarea name="followUp" className="mt-1" defaultValue={selected.followUp ?? ""} placeholder="Message sent, response, next action..." /></div><div className="md:col-span-2 flex justify-end"><Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save outreach update"}</Button></div></form></CardContent></Card>}
  </div>;
}
