import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, HeartPulse, Plane, ShieldAlert, Sparkles, Target, Wallet } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getFoundationOverview } from "@/server/data/project-foundation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImportVendorLeadsButton } from "@/components/project-foundation/import-vendor-leads-button";
import { SourcingResearchPanel } from "@/components/project-foundation/sourcing-research-panel";
import { VendorLeadTable, type FoundationVendorLeadView } from "@/components/project-foundation/vendor-lead-table";
import { FinalCannabisSessionForm } from "@/components/project-foundation/final-cannabis-session-form";
import { TimeSinceCannabis } from "@/components/project-foundation/time-since-cannabis";

function getLine(body: string | null | undefined, label: string) {
  const line = body?.split("\n").find((item) => item.startsWith(label));
  return line?.replace(label, "").trim() ?? "";
}

function toDatetimeLocal(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function getSessionIso(body: string | null | undefined) {
  const value = getLine(body, "Session recorded at:");
  return value || null;
}

export default async function ProjectFoundationPage() {
  const user = await requireUser();
  const overview = await getFoundationOverview(user.id);
  const reset = overview.cannabisReset;
  const finalSessionBody = reset.finalSession?.body;
  const finalSessionIso = getSessionIso(finalSessionBody);
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

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-primary">PROJECT FOUNDATION</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Build a clearer next chapter.</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            One operating space for the reset, family visit, booked itinerary, business building, cannabis taper, and hair sourcing expedition.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportVendorLeadsButton />
          <Link href="/planner" className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">
            Open planner <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Reset begins</p>
              <p className="font-semibold">August 19, 2026</p>
              <p className="text-xs text-muted-foreground">12:08 AM Pacific reference</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Plane className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Travel day</p>
              <p className="font-semibold">August 20, 2026</p>
              <p className="text-xs text-muted-foreground">LA to Amsterdam</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Target className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Vendor leads</p>
              <p className="font-semibold">{overview.totalLeads || 34}</p>
              <p className="text-xs text-muted-foreground">{overview.contacted} contacted · {overview.meetingsSet} meetings set</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <HeartPulse className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Cannabis reset</p>
              <p className="font-semibold">{finalSessionIso ? "Counter active" : "Taper active"}</p>
              <p className="text-xs text-muted-foreground">Reduce, finish, arrive clear</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cannabis Reset — LA → Amsterdam → Athens</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="font-medium">Today card</p>
              <p className="mt-1 text-muted-foreground">
                Observe rather than judge. Reduce automatic consumption. Stop stacking cannabis simply to stay continuously high.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {["Hydration", "Normal meals", "Movement or exercise", "Adequate sleep", "Delay automatic sessions", "Record use honestly"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="font-medium">Pre use check in</p>
                <p className="mt-2 text-muted-foreground">
                  What am I feeling right now? What am I hoping weed changes? Do I actually want it, or am I reaching automatically? Could I wait another 30 to 60 minutes?
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="font-medium">Post use reflection</p>
                <p className="mt-2 text-muted-foreground">Did cannabis actually give me what I wanted from it?</p>
              </div>
            </div>
            <div className="rounded-lg bg-primary/5 p-4">
              <p className="text-xs font-semibold tracking-[0.14em] text-primary">CORE THOUGHT</p>
              <p className="mt-2 font-semibold">PROJECT FOUNDATION IS NOT ABOUT CREATING A PERFECT ROCKY.</p>
              <p className="font-semibold">IT IS ABOUT DISCOVERING WHAT ROCKY LOOKS LIKE WHEN HIS LIFE IS BUILT INTENTIONALLY.</p>
              <p className="mt-2 text-muted-foreground">Cannabis is one part of that experiment.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              Final session milestone
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <TimeSinceCannabis sessionAtIso={finalSessionIso} />
            <FinalCannabisSessionForm
              defaultSessionAt={toDatetimeLocal(finalSessionIso ?? "")}
              defaultLocation={getLine(finalSessionBody, "Location:")}
              defaultFeelings={getLine(finalSessionBody, "Feelings:")}
              defaultAmount={getLine(finalSessionBody, "Approximate amount consumed:")}
              defaultReason={getLine(finalSessionBody, "Why this is final:")}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">LA taper</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Begin conscious tracking on August 19. Notice whether the urge is boredom, anxiety, habit, loneliness, sleep, recreation, emotional avoidance, physical relaxation, social context, or a genuine conscious choice.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">The Landing Ramp</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Amsterdam is a transition, not an excuse. Build longer gaps, lower intensity, sober activities, walking, food, coffee, social contact, sleep, journaling, and reflection.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ATHENS RESET</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Athens starts living without cannabis. Track cravings, anxiety, mood, energy, sleep, appetite, exercise, sunlight, hydration, alcohol, social connection, meaningful work, and what helped.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-primary" />
              Safety and travel rules
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>Do not carry cannabis, THC pills, THC drinks, concentrates, edibles, or other marijuana products internationally or through international border crossings.</p>
            <p>Do not replace cannabis withdrawal with heavy alcohol use or unsupervised sedatives.</p>
            <p>If severe confusion, hallucinations, inability to remain safe, chest pain, severe dehydration, repeated uncontrollable vomiting, suicidal thinking, or another acute emergency shows up, normal coaching stops and urgent professional help is the next step.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Initially active Project Foundation tasks</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {reset.tasks.map((task) => (
              <div key={task.id} className="flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{task.title}</p>
                  {task.notes && <p className="text-muted-foreground">{task.notes}</p>}
                </div>
                {task.dueDate && <Badge variant="secondary">{task.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Trip anchors</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg bg-muted/50 p-3">
              <Badge variant="secondary">Aug 15 to 18</Badge>
              <p className="mt-2 font-medium">Mobile, Alabama</p>
              <p className="text-muted-foreground">Surprise visit with mom and dad.</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <Badge variant="secondary">Aug 20</Badge>
              <p className="mt-2 font-medium">LA to Amsterdam</p>
              <p className="text-muted-foreground">The flight is not an obstacle to the taper. The flight is part of the taper.</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <Badge variant="secondary">Sep 15 to Oct 5</Badge>
              <p className="mt-2 font-medium">Vendor search window</p>
              <p className="text-muted-foreground">Myanmar, Cambodia, Vietnam, then India.</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <Badge variant="secondary">Open</Badge>
              <p className="mt-2 font-medium">Return to USA</p>
              <p className="text-muted-foreground">Still needs booking and baggage plan.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4 text-primary" />
              Budget guardrails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Travel target</span><strong>$2,000</strong></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Inventory</span><strong>$4k to $8k</strong></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Fallback lodging</span><strong>$1,170</strong></div>
            <p className="border-t pt-3 text-xs text-muted-foreground">Hosted stays with Jimmy may lower lodging costs; keep paid fallback estimates until dates are confirmed.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Affirmation rotation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {reset.affirmations.map((affirmation) => (
            <div key={affirmation} className="rounded-lg bg-muted/50 p-3 text-muted-foreground">{affirmation}</div>
          ))}
        </CardContent>
      </Card>

      <SourcingResearchPanel />
      {vendorLeads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-medium">The updated sourcing workbook is ready to import.</p>
            <p className="mt-1 text-sm text-muted-foreground">Import the 34 lead Myanmar, Cambodia, and Vietnam list to start outreach from Rocky OS.</p>
          </CardContent>
        </Card>
      ) : (
        <VendorLeadTable leads={vendorLeads} />
      )}
    </div>
  );
}
