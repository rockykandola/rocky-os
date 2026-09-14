"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, Heart, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const PROGRAM_START = "2026-09-14";
const TOTAL_DAYS = 37;
const STORAGE_KEY = "rocky-os-slaa-how-v1";

const characteristics = [
  "Getting sexually or emotionally attached before I really know the person.",
  "Staying in or returning to painful relationships because abandonment or loneliness feels worse.",
  "Compulsively pursuing relationships because emotional or sexual deprivation feels intolerable.",
  "Confusing love with neediness, attraction, pity, rescuing, or wanting to be rescued.",
  "Feeling empty or incomplete alone while still fearing intimacy or commitment.",
  "Using sex or emotional dependence to regulate stress, guilt, loneliness, anger, shame, fear, or envy.",
  "Using sex or emotional involvement to manipulate or control another person.",
  "Becoming seriously distracted or immobilized by romantic or sexual obsession or fantasy.",
  "Avoiding responsibility for myself by attaching to emotionally unavailable people.",
  "Remaining trapped in emotional dependency, romantic intrigue, or compulsive sexual behavior.",
  "Retreating from intimacy to avoid vulnerability and mistaking isolation for recovery.",
  "Idealizing people, pursuing the fantasy, then blaming them when reality does not match the fantasy.",
];

const candidateBottomLines = [
  "No sexual behavior outside the recovery boundaries agreed with Mr. Jude.",
  "No pursuing people who are unavailable, have rejected me, are committed elsewhere, or repeatedly show they cannot offer the relationship I actually want.",
  "No returning to a known destructive relationship simply because withdrawal, loneliness, or missing someone hurts.",
  "No relationship acceleration, instant life planning, major commitments, rescuing, or treating chemistry as proof of compatibility.",
  "No obsessive checking, engineered contact, repeated rereading of conversations, indirect social media communication, or compulsive monitoring of someone.",
  "No keeping someone around mainly as emotional or sexual anesthesia or for the reassurance of being wanted.",
  "No abandoning my recovery, values, peace, responsibilities, or stated relationship standards to keep a connection.",
];

const candidateMiddleLines = [
  "Heavy fantasy about someone I barely know.",
  "Repeatedly checking messages, social media, views, status, or online activity.",
  "Talking about one person over and over because my mind cannot disengage.",
  "Treating intense chemistry, attention, sex, or emotional pain as evidence of destiny.",
  "Rationalizing obvious incompatibilities or red flags.",
  "Wanting to contact an ex or unavailable person when lonely, anxious, rejected, angry, or dysregulated.",
  "Feeling compelled to fix the relationship immediately or get reassurance right now.",
  "Neglecting work, sleep, meetings, friendships, health, or spiritual practice because of romantic turmoil.",
  "Telling myself this situation is different when the behavior resembles an old pattern.",
];

const candidateTopLines = [
  "Honesty with myself, Mr. Jude, outreach contacts, and my Higher Power.",
  "Daily prayer and meditation.",
  "Meetings, fellowship, outreach, service, and healthy friendships with men.",
  "Being able to feel loneliness, attraction, rejection, desire, and uncertainty without needing another person to immediately change how I feel.",
  "Protecting work, physical health, sleep, spiritual life, and responsibilities.",
  "Building toward a stable monogamous marriage and family from reality, compatibility, patience, and values rather than intensity.",
  "Learning to be peaceful and whole while single instead of using romance or sex as proof that I am okay.",
];

type Answer = "yes" | "no" | "maybe" | "";

type DayState = {
  question: string;
  answer: string;
  sponsorCall: boolean;
  outreach1: boolean;
  outreach2: boolean;
  outreach3: boolean;
  prayerMeditation: boolean;
  meeting: boolean;
  bottomLinesMaintained: boolean;
  characteristics: Answer[];
  judeNotes: string;
  patterns: string;
};

type ProgramState = {
  days: Record<number, DayState>;
  bottomLines: string;
  middleLines: string;
  topLines: string;
};

function defaultQuestion(day: number) {
  if (day === 1) {
    return "What is sex and love addiction? Read the twelve characteristics. Mark unfamiliar concepts and passages that identify with your own behavior. Discuss them with your sponsor and on outreach calls.";
  }
  if (day <= 7) return "Paste today’s Bottom Line identification question from Mr. Jude here.";
  return "Paste today’s Step One, Two, or Three question from Mr. Jude here.";
}

function newDay(day: number): DayState {
  return {
    question: defaultQuestion(day),
    answer: "",
    sponsorCall: false,
    outreach1: false,
    outreach2: false,
    outreach3: false,
    prayerMeditation: false,
    meeting: false,
    bottomLinesMaintained: false,
    characteristics: Array.from({ length: 12 }, () => "" as Answer),
    judeNotes: "",
    patterns: "",
  };
}

const initialState: ProgramState = {
  days: {},
  bottomLines: candidateBottomLines.join("\n"),
  middleLines: candidateMiddleLines.join("\n"),
  topLines: candidateTopLines.join("\n"),
};

function programDayToday() {
  const start = new Date(`${PROGRAM_START}T00:00:00+07:00`);
  const diff = Math.floor((Date.now() - start.getTime()) / 86400000) + 1;
  return Math.min(TOTAL_DAYS, Math.max(1, diff));
}

export function SlaaHowDashboard() {
  const [state, setState] = useState<ProgramState>(initialState);
  const [day, setDay] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDay(programDayToday());
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setState({ ...initialState, ...JSON.parse(raw) });
      } catch {
        setState(initialState);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);

  const current = state.days[day] ?? newDay(day);
  const phase = day <= 7 ? "Bottom Line identification" : "Steps One through Three";

  const completion = useMemo(() => {
    const checks = [current.sponsorCall, current.outreach1, current.outreach2, current.outreach3, current.prayerMeditation, current.meeting, current.bottomLinesMaintained];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [current]);

  function updateDay(patch: Partial<DayState>) {
    setState((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: { ...(prev.days[day] ?? newDay(day)), ...patch },
      },
    }));
  }

  function updateCharacteristic(index: number, value: Answer) {
    const next = [...current.characteristics];
    next[index] = value;
    updateDay({ characteristics: next });
  }

  const callSummary = useMemo(() => {
    const identified = characteristics
      .map((text, index) => ({ text, answer: current.characteristics[index] }))
      .filter((item) => item.answer === "yes" || item.answer === "maybe")
      .map((item) => `${item.answer === "yes" ? "YES" : "MAYBE"}: ${item.text}`)
      .join("\n");

    return [
      `S.L.A.A. H.O.W. Day ${day} of ${TOTAL_DAYS}`,
      `Phase: ${phase}`,
      "",
      "Today’s question:", current.question,
      "",
      "My answer:", current.answer || "Not written yet.",
      "",
      "Characteristics to discuss:", identified || "None marked yet.",
      "",
      "Patterns I noticed:", current.patterns || "None written yet.",
      "",
      "Notes or questions for Mr. Jude:", current.judeNotes || "None written yet.",
    ].join("\n");
  }, [current, day, phase]);

  async function copySummary() {
    await navigator.clipboard.writeText(callSummary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  const checklist = [
    ["sponsorCall", "2:30 sponsor call with Mr. Jude", Phone],
    ["outreach1", "Outreach call 1", Phone],
    ["outreach2", "Outreach call 2", Phone],
    ["outreach3", "Outreach call 3", Phone],
    ["prayerMeditation", "Prayer and meditation", Heart],
    ["meeting", "Meeting, if scheduled", Check],
    ["bottomLinesMaintained", "Bottom Lines maintained today", Check],
  ] as const;

  if (!loaded) return <div className="text-sm text-muted-foreground">Loading recovery dashboard...</div>;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Heart className="h-3.5 w-3.5" /> Recovery / S.L.A.A. H.O.W.
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">37 Day Recovery Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Day {day} of {TOTAL_DAYS} · {phase} · Sponsor: Mr. Jude</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setDay((d) => Math.max(1, d - 1))} disabled={day === 1}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDay(programDayToday())}>Today</Button>
          <Button variant="outline" size="sm" onClick={() => setDay((d) => Math.min(TOTAL_DAYS, d + 1))} disabled={day === TOTAL_DAYS}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <section className="rounded-xl border bg-background p-5">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium">Today’s recovery tools</span>
          <span className="text-muted-foreground">{completion}% complete</span>
        </div>
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} />
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {checklist.map(([key, label, Icon]) => (
            <label key={key} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/40">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                checked={Boolean(current[key])}
                onChange={(event) => updateDay({ [key]: event.target.checked } as Partial<DayState>)}
              />
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="flex flex-col gap-6">
          <section className="rounded-xl border bg-background p-5">
            <h2 className="text-lg font-semibold">Today’s question</h2>
            <p className="mb-3 text-xs text-muted-foreground">Editable so you can paste the exact assignment Mr. Jude gives you.</p>
            <Textarea value={current.question} onChange={(e) => updateDay({ question: e.target.value })} className="min-h-28" />
            <h3 className="mb-2 mt-5 text-sm font-semibold">My written answer</h3>
            <Textarea value={current.answer} onChange={(e) => updateDay({ answer: e.target.value })} placeholder="Write the answer you want to read to Mr. Jude..." className="min-h-56" />
          </section>

          <section className="rounded-xl border bg-background p-5">
            <h2 className="text-lg font-semibold">The 12 characteristics</h2>
            <p className="mb-4 text-sm text-muted-foreground">Mark each YES, NO, or MAYBE so you have concrete material for your calls.</p>
            <div className="space-y-3">
              {characteristics.map((text, index) => (
                <div key={text} className="rounded-lg border p-3">
                  <p className="mb-3 text-sm"><span className="mr-2 font-semibold">{index + 1}.</span>{text}</p>
                  <div className="flex gap-2">
                    {(["yes", "no", "maybe"] as const).map((value) => (
                      <button key={value} type="button" onClick={() => updateCharacteristic(index, value)} className={`rounded-md border px-3 py-1 text-xs font-medium uppercase ${current.characteristics[index] === value ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}>
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-xl border bg-background p-5">
            <h2 className="text-lg font-semibold">Patterns I noticed today</h2>
            <p className="mb-3 text-xs text-muted-foreground">What happened, what I felt, what I wanted, what I did, and what pattern may have been operating.</p>
            <Textarea value={current.patterns} onChange={(e) => updateDay({ patterns: e.target.value })} className="min-h-44" />
          </section>

          <section className="rounded-xl border bg-background p-5">
            <h2 className="text-lg font-semibold">Notes for Mr. Jude</h2>
            <Textarea value={current.judeNotes} onChange={(e) => updateDay({ judeNotes: e.target.value })} placeholder="Questions, confusion, resistance, insights, or anything I need to say out loud..." className="mt-3 min-h-44" />
          </section>

          <section className="rounded-xl border bg-background p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Prepare for Jude</h2>
                <p className="text-xs text-muted-foreground">Builds one clean call summary from today’s work.</p>
              </div>
              <Button size="sm" variant="outline" onClick={copySummary}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-xs leading-relaxed">{callSummary}</pre>
          </section>
        </div>
      </div>

      <section className="rounded-xl border bg-background p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">My recovery lines</h2>
          <p className="text-xs text-muted-foreground">Working candidates only. Final Bottom Lines belong in the conversation with Mr. Jude and the program.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Bottom Lines</h3>
            <Textarea value={state.bottomLines} onChange={(e) => setState((prev) => ({ ...prev, bottomLines: e.target.value }))} className="min-h-80" />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Middle Lines</h3>
            <Textarea value={state.middleLines} onChange={(e) => setState((prev) => ({ ...prev, middleLines: e.target.value }))} className="min-h-80" />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Top Lines</h3>
            <Textarea value={state.topLines} onChange={(e) => setState((prev) => ({ ...prev, topLines: e.target.value }))} className="min-h-80" />
          </div>
        </div>
      </section>

      <p className="pb-4 text-center text-xs text-muted-foreground">Saved automatically in this browser. This page organizes your work and does not replace your sponsor, meetings, fellowship, or professional care.</p>
    </div>
  );
}
