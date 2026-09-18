"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Copy,
  FileText,
  Heart,
  Library,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const PROGRAM_START = "2026-09-14";
const TOTAL_DAYS = 37;
const STORAGE_KEY = "rocky-os-slaa-how-v3";

const characteristics = [
  "Sexual or emotional attachment before real knowledge of the person.",
  "Returning to painful relationships because loneliness feels worse.",
  "Compulsive pursuit when deprivation feels intolerable.",
  "Confusing love with need, pity, rescuing, or fantasy.",
  "Feeling incomplete alone while fearing intimacy or commitment.",
  "Using sex or emotional dependence to regulate difficult feelings.",
  "Using sex or emotional involvement to control another person.",
  "Becoming immobilized by romantic or sexual obsession.",
  "Avoiding self responsibility by attaching to unavailable people.",
  "Remaining trapped in dependency, intrigue, or compulsion.",
  "Retreating from intimacy and mistaking isolation for recovery.",
  "Idealizing people, pursuing fantasy, then blaming reality.",
];

const candidateBottomLines = [
  "No sexual behavior outside the recovery boundaries agreed with Mr. Jude.",
  "No pursuing unavailable people, rejected connections, or committed people.",
  "No returning to a destructive relationship because withdrawal hurts.",
  "No instant relationship acceleration, rescuing, or treating chemistry as proof.",
  "No compulsive checking, engineered contact, rereading, monitoring, or indirect contact.",
  "No keeping someone around mainly for reassurance, anesthesia, or being wanted.",
  "No abandoning recovery, values, peace, responsibilities, or standards to keep a connection.",
];

const candidateMiddleLines = [
  "Heavy fantasy about someone I barely know.",
  "Repeatedly checking messages, social media, views, status, or activity.",
  "Talking about one person repeatedly because my mind cannot disengage.",
  "Treating chemistry, attention, sex, or pain as evidence of destiny.",
  "Rationalizing obvious incompatibilities or red flags.",
  "Wanting contact when lonely, anxious, rejected, angry, or dysregulated.",
  "Feeling compelled to fix the relationship or get reassurance immediately.",
  "Neglecting work, sleep, meetings, friendships, health, or spiritual practice.",
  "Telling myself this is different when the behavior resembles an old pattern.",
];

const candidateTopLines = [
  "Honesty with myself, Mr. Jude, outreach contacts, and my Higher Power.",
  "Daily prayer and meditation.",
  "Meetings, fellowship, outreach, service, and healthy friendships with men.",
  "Feeling loneliness, attraction, rejection, desire, and uncertainty without using another person to change the feeling.",
  "Protecting work, physical health, sleep, spiritual life, and responsibilities.",
  "Building toward stable love from reality, compatibility, patience, and values.",
  "Learning to be peaceful while single instead of using romance or sex as proof that I am okay.",
];

const literatureSources = [
  {
    title: "An Introduction to S.L.A.A. H.O.W.",
    kind: "Mr. Jude file",
    pages: "RTF",
    status: "Readable",
    role: "Primary map for the 37 day H.O.W. rhythm, calls, meetings, sponsor work, and the first seven days.",
    path: "/Users/VikrumKandola/Desktop/Personal/Rocky 12 Step/AA/SLAA/HOW Intro  to first 7 Days.rtf",
  },
  {
    title: "Set Aside Prayer",
    kind: "Prayer",
    pages: "RTF",
    status: "Readable",
    role: "Opening prayer or meditation before daily writing.",
    path: "/Users/VikrumKandola/Desktop/SLAA 2026/Set Aside Prayer.rtf",
  },
  {
    title: "This Matter of Honesty",
    kind: "AA Grapevine essay",
    pages: "RTF",
    status: "Readable",
    role: "Honesty reading for sponsor preparation and Step One work.",
    path: "/Users/VikrumKandola/Desktop/SLAA 2026/This Matter of Honesty.rtf",
  },
  {
    title: "Newcomers Packet",
    kind: "S.L.A.A. packet",
    pages: "6 pages",
    status: "Encoded text",
    role: "Newcomer overview and first pass orientation. Needs OCR cleanup before detailed assignment extraction.",
    path: "/Users/VikrumKandola/Desktop/SLAA 2026/Newcomers_Packet.pdf",
  },
  {
    title: "S.L.A.A. Basic Text",
    kind: "Core literature",
    pages: "192 pages",
    status: "Readable",
    role: "Main S.L.A.A. reference for illness, recovery, withdrawal, sponsorship, meetings, and the Steps.",
    path: "/Users/VikrumKandola/Desktop/SLAA 2026/SLAA Basic Text.pdf",
  },
  {
    title: "Questions Beginners Ask",
    kind: "Newcomer pamphlet",
    pages: "13 pages",
    status: "Readable with artifacts",
    role: "Newcomer orientation, acting out, withdrawal, prayer rhythm, Steps, and Traditions.",
    path: "/Users/VikrumKandola/Desktop/SLAA 2026/Questions Beginners Ask NEW E.pdf",
  },
  {
    title: "Anorexia: Sexual, Social, Emotional",
    kind: "S.L.A.A. pamphlet",
    pages: "13 pages",
    status: "Readable with artifacts",
    role: "Inventory for avoidance of social, sexual, or emotional nourishment.",
    path: "/Users/VikrumKandola/Desktop/SLAA 2026/PAM-007 Anorexia E.pdf",
  },
  {
    title: "Withdrawal: Gateway to Freedom, Hope and Joy",
    kind: "S.L.A.A. pamphlet",
    pages: "8 pages",
    status: "Scanned",
    role: "Withdrawal support and normalization. Needs OCR before detailed assignment extraction.",
    path: "/Users/VikrumKandola/Desktop/SLAA 2026/Withdrawal Gateway to Freedom.pdf",
  },
  {
    title: "Romantic Obsession",
    kind: "S.L.A.A. pamphlet",
    pages: "8 pages",
    status: "Scanned",
    role: "Obsession pattern reference. Needs OCR before detailed assignment extraction.",
    path: "/Users/VikrumKandola/Desktop/SLAA 2026/Romantic Obsession.pdf",
  },
  {
    title: "Setting Bottom Lines",
    kind: "S.L.A.A. worksheet",
    pages: "13 pages",
    status: "Scanned",
    role: "Bottom Line worksheets. Needs OCR before detailed assignment extraction.",
    path: "/Users/VikrumKandola/Desktop/SLAA 2026/Setting Bottom Lines Pamphlet.pdf",
  },
  {
    title: "The 12 Steps and 12 Traditions",
    kind: "AA reference",
    pages: "194 pages",
    status: "Readable",
    role: "Step and Tradition reading alongside S.L.A.A. H.O.W. questions.",
    path: "/Users/VikrumKandola/Desktop/SLAA 2026/The 12-Steps and 12 traditions.pdf",
  },
  {
    title: "AA 12 Steps and 12 Traditions copy",
    kind: "AA reference",
    pages: "194 pages",
    status: "Readable",
    role: "Second local copy of the AA 12 and 12 for Step reading backup.",
    path: "/Users/VikrumKandola/Desktop/Personal/Rocky 12 Step/AA/Big Book & 12 x 12/AA-12-Steps-12-Traditions.pdf",
  },
  {
    title: "SAA Green Book Workbook",
    kind: "Companion workbook",
    pages: "17 pages",
    status: "Readable",
    role: "Independent reflection packet for boundaries, sponsor work, meetings, and recovery actions.",
    path: "/Users/VikrumKandola/Desktop/Personal/Rocky 12 Step/SLAA/SAA_Green_Book_Workbook.pdf",
  },
  {
    title: "SAA Green Book Companion Packet",
    kind: "Companion guide",
    pages: "10 pages",
    status: "Readable",
    role: "Non infringing study guide and reading navigation companion.",
    path: "/Users/VikrumKandola/Desktop/Personal/Rocky 12 Step/SLAA/SAA_Green_Book_Companion_Packet.pdf",
  },
  {
    title: "AA Big Book",
    kind: "AA reference",
    pages: "193 pages",
    status: "Readable",
    role: "How It Works, spiritual experience, and broader Twelve Step foundations.",
    path: "/Users/VikrumKandola/Desktop/Personal/Rocky 12 Step/AA/Big Book & 12 x 12/AA-Big-Book-4th-edition.pdf",
  },
];

const dayTemplates = Array.from({ length: TOTAL_DAYS }, (_, index) => {
  const day = index + 1;
  if (day <= 7) {
    const themes = [
      "Orientation and the twelve characteristics",
      "Inventory of current acting out patterns",
      "Anorexia and avoidance scan",
      "Romantic obsession pattern scan",
      "Withdrawal and emotional tolerance",
      "Draft Bottom, Middle, and Top Lines",
      "Review first seven answers with Mr. Jude",
    ];

    const sourceGroups = [
      ["An Introduction to S.L.A.A. H.O.W.", "S.L.A.A. Basic Text", "Newcomers Packet"],
      ["Questions Beginners Ask", "S.L.A.A. Basic Text"],
      ["Anorexia: Sexual, Social, Emotional", "SAA Green Book Workbook"],
      ["Romantic Obsession", "S.L.A.A. Basic Text"],
      ["Withdrawal: Gateway to Freedom, Hope and Joy", "This Matter of Honesty"],
      ["Setting Bottom Lines", "SAA Green Book Workbook"],
      ["An Introduction to S.L.A.A. H.O.W.", "Setting Bottom Lines"],
    ];

    return {
      day,
      phase: "Bottom Line identification",
      title: themes[index],
      assignment:
        "Answer one Bottom Line identification question from Mr. Jude. Keep it current to today and read it on the sponsor call.",
      sources: sourceGroups[index],
      prompt:
        "What behavior, fantasy, avoidance, or emotional dependency needs a clear boundary so recovery has a real chance today?",
    };
  }

  const stepDay = day - 7;
  const step = stepDay <= 10 ? "Step One" : stepDay <= 20 ? "Step Two" : "Step Three";
  const title =
    step === "Step One"
      ? "Powerlessness and unmanageability"
      : step === "Step Two"
        ? "Hope, help, and sanity"
        : "Surrender, willingness, and action";

  return {
    day,
    phase: "Steps One through Three",
    title: `${step}: ${title}`,
    assignment:
      "Answer one Step question from Mr. Jude. Use the literature notes, then keep the written answer specific enough to read out loud.",
    sources:
      step === "Step One"
        ? ["S.L.A.A. Basic Text", "Questions Beginners Ask", "This Matter of Honesty"]
        : step === "Step Two"
          ? ["The 12 Steps and 12 Traditions", "AA Big Book", "SAA Green Book Companion Packet"]
          : ["The 12 Steps and 12 Traditions", "AA Big Book", "Set Aside Prayer"],
    prompt:
      step === "Step One"
        ? "Where did I lose choice, honesty, peace, time, money, focus, or dignity?"
        : step === "Step Two"
          ? "What would sanity look like if I stopped solving this alone?"
          : "What am I still trying to control, and what action would show willingness today?",
  };
});

type Answer = "yes" | "no" | "maybe" | "";

type DayState = {
  question: string;
  answer: string;
  sponsorCall: boolean;
  sponsorCallTime: string;
  outreach1: boolean;
  outreach1Name: string;
  outreach2: boolean;
  outreach2Name: string;
  outreach3: boolean;
  outreach3Name: string;
  prayerMeditation: boolean;
  meeting: boolean;
  meetingName: string;
  bottomLinesMaintained: boolean;
  characteristics: Answer[];
  judeNotes: string;
  patterns: string;
  sourceNotes: string;
  gratitude: string;
};

type ProgramState = {
  days: Record<number, DayState>;
  bottomLines: string;
  middleLines: string;
  topLines: string;
  selectedSourceTitle: string;
};

function defaultQuestion(day: number) {
  return dayTemplates[day - 1]?.assignment ?? "Paste today’s question from Mr. Jude here.";
}

const day4AnorexiaReflection = {
  question:
    "4. Read the S.L.A.A. pamphlet on anorexia, Anorexia: Sexual, Social, Emotional, as it relates to sexual, social and emotional anorexia. Do you relate to any of these behaviors? Do some writing and discuss.",
  answer:
    "Day 4 working notes from Sept 18 discussion\n\nI do not relate to this as much as a primary pattern. My main line is connection and communication with people. I am an open book. I share my heart. I do not want to become someone who avoids love, emotion, honesty, or closeness.\n\nWhere I do relate is that when I am very hurt, I can lose access to healthy love and healthy emotional connection. I do not usually avoid love because I do not want it. I avoid or back away when I am wounded, activated, scared, or unsure whether the source of love is safe. Sometimes I am not attracted, or I have reservations about the person or the source of the love, and I back away. I think that can be healthy discernment when I am protecting my recovery and not abandoning myself.\n\nThe dark places for me are anger, suicide thoughts, and deep unworthiness. Rejection after diving in, losing someone I love or care about, betrayal, and seeing strings attached to love can take me very dark. Betrayal especially feels like my biggest scary moment. My body reacts like I am in danger. I feel like the world is against me, like everyone hates me and wants to kill me, like there is no safety anywhere. I cry. I shake. It hurts so so so so bad. In those moments I believe I will never be enough and no one will ever choose me.\n\nWhen I back away in those moments, my body is activated. I am either on high guard or I stop caring what happens to me and get reckless. That is where I need recovery. It is not that I want to be avoidant. It is that betrayal and rejection can make my nervous system feel unsafe and out of control.\n\nI am scared of becoming avoidant because avoidant people have hurt me. To me, avoidants can seem to lie, manipulate, disappear, withhold, and hurt people. I never want to become that. I do not want to use distance, silence, or emotional withdrawal as punishment or control.\n\nHealthy connection in pain looks like support groups, counselor, retreats, yoga, and calling a friend when it is at its worst. I am still learning what it feels like to stay emotionally available when I am hurt. That might mean slowing down, telling the truth, asking for support, and not running to unsafe places for relief.\n\nThe honest distinction for me is this: I do not strongly identify with sexual, social, or emotional anorexia as my main pattern, because I am deeply wired for connection. But I do relate to moments where pain, betrayal, or rejection can make me pull away from healthy connection, go on high guard, become reckless, or believe I am unworthy. That is the part I want to recover.",
  patterns:
    "Patterns noticed\n\nConnection and communication are core values, not optional extras.\n\nThe risk is not emotional coldness as a baseline. The risk is what happens after rejection, betrayal, or love with strings attached.\n\nBetrayal creates a threat response: high guard, shaking, crying, danger feelings, and beliefs that there is no safety.\n\nThe most dangerous belief is: I will never be enough and no one will ever choose me.\n\nBacking away can be healthy when it comes from discernment about attraction, safety, values, or the source of love. It becomes risky when it comes from panic, self abandonment, revenge, despair, or reckless collapse.\n\nRecovery question: when I am hurt, do I stop wanting love, or do I stop trusting love?",
  sourceNotes:
    "Source notes\n\nAnorexia in this pamphlet is useful as a scan for avoidance of sexual, social, and emotional nourishment. My strongest identification is not with default avoidance. My identification is with losing access to safe nourishment when betrayal, rejection, or fear takes over.",
  judeNotes:
    "Notes or questions for Mr. Jude\n\nI want to discuss the difference between healthy discernment and anorexic avoidance.\n\nI want to talk about betrayal as a danger response in my body, not just a sad feeling.\n\nI need help learning how to stay emotionally available while hurt without becoming reckless, desperate, or unsafe.\n\nI am afraid of becoming avoidant because avoidant people have hurt me. I want to be careful that I do not confuse slowing down with withholding love.\n\nQuestion: what does sober, emotionally available space look like when I am activated?",
  gratitude:
    "Sane action\n\nIf betrayal or rejection hits today, I will treat it as a danger signal in my nervous system, not as proof that I am worthless. I will reach for support before I isolate, spiral, or get reckless.",
};

function newDay(day: number): DayState {
  const baseDay = {
    question: defaultQuestion(day),
    answer: "",
    sponsorCall: false,
    sponsorCallTime: "2:30 PM",
    outreach1: false,
    outreach1Name: "",
    outreach2: false,
    outreach2Name: "",
    outreach3: false,
    outreach3Name: "",
    prayerMeditation: false,
    meeting: false,
    meetingName: "",
    bottomLinesMaintained: false,
    characteristics: Array.from({ length: 12 }, () => "" as Answer),
    judeNotes: "",
    patterns: "",
    sourceNotes: "",
    gratitude: "",
  };

  return day === 4 ? { ...baseDay, ...day4AnorexiaReflection } : baseDay;
}

const initialState: ProgramState = {
  days: {
    4: newDay(4),
  },
  bottomLines: candidateBottomLines.join("\n"),
  middleLines: candidateMiddleLines.join("\n"),
  topLines: candidateTopLines.join("\n"),
  selectedSourceTitle: "Anorexia: Sexual, Social, Emotional",
};

function programDayToday() {
  const start = new Date(`${PROGRAM_START}T00:00:00+07:00`);
  const diff = Math.floor((Date.now() - start.getTime()) / 86400000) + 1;
  return Math.min(TOTAL_DAYS, Math.max(1, diff));
}

function mergeStoredState(raw: string | null): ProgramState {
  if (!raw) return initialState;

  try {
    const parsed = JSON.parse(raw) as Partial<ProgramState>;
    return {
      ...initialState,
      ...parsed,
      days: parsed.days ?? {},
    };
  } catch {
    return initialState;
  }
}

export function SlaaHowDashboard() {
  const [state, setState] = useState<ProgramState>(initialState);
  const [day, setDay] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDay(programDayToday());
    setState(mergeStoredState(window.localStorage.getItem(STORAGE_KEY)));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);

  const template = dayTemplates[day - 1];
  const current = { ...newDay(day), ...(state.days[day] ?? {}) };
  const selectedSource = literatureSources.find((source) => source.title === state.selectedSourceTitle) ?? literatureSources[0];

  const completion = useMemo(() => {
    const checks = [
      current.sponsorCall,
      current.outreach1,
      current.outreach2,
      current.outreach3,
      current.prayerMeditation,
      current.meeting,
      current.bottomLinesMaintained,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [current]);

  function updateDay(patch: Partial<DayState>) {
    setState((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: { ...newDay(day), ...(prev.days[day] ?? {}), ...patch },
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

    const outreach = [
      current.outreach1Name || "Outreach call 1",
      current.outreach2Name || "Outreach call 2",
      current.outreach3Name || "Outreach call 3",
    ].join(", ");

    return [
      `S.L.A.A. H.O.W. Day ${day} of ${TOTAL_DAYS}`,
      `Phase: ${template.phase}`,
      `Sponsor call: ${current.sponsorCall ? "done" : "open"} at ${current.sponsorCallTime || "2:30 PM"}`,
      `Outreach: ${outreach}`,
      `Meeting: ${current.meeting ? current.meetingName || "done" : "open"}`,
      `Bottom Lines maintained: ${current.bottomLinesMaintained ? "yes" : "not checked"}`,
      "",
      "Today’s assignment:",
      current.question,
      "",
      "My answer:",
      current.answer || "Not written yet.",
      "",
      "Sources I used:",
      template.sources.join(", "),
      "",
      "Source notes:",
      current.sourceNotes || "None written yet.",
      "",
      "Characteristics to discuss:",
      identified || "None marked yet.",
      "",
      "Patterns I noticed:",
      current.patterns || "None written yet.",
      "",
      "Notes or questions for Mr. Jude:",
      current.judeNotes || "None written yet.",
      "",
      "Gratitude or sane action:",
      current.gratitude || "None written yet.",
    ].join("\n");
  }, [current, day, template]);

  async function copySummary() {
    await navigator.clipboard.writeText(callSummary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  const checklist = [
    ["sponsorCall", "Sponsor call with Mr. Jude", Phone],
    ["outreach1", "Outreach call 1", Phone],
    ["outreach2", "Outreach call 2", Phone],
    ["outreach3", "Outreach call 3", Phone],
    ["prayerMeditation", "Prayer and meditation", Heart],
    ["meeting", "Meeting", MessageCircle],
    ["bottomLinesMaintained", "Bottom Lines maintained today", ShieldCheck],
  ] as const;

  if (!loaded) return <div className="text-sm text-muted-foreground">Loading recovery dashboard...</div>;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Heart className="h-3.5 w-3.5" /> Recovery / S.L.A.A. H.O.W.
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">37 Day Recovery Dashboard</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Day {day} of {TOTAL_DAYS}. {template.phase}. Sponsor: Mr. Jude. Source material stays organized here so daily writing, calls, meetings, and literature notes live in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setDay((d) => Math.max(1, d - 1))} disabled={day === 1}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDay(programDayToday())}>Today</Button>
          <Button variant="outline" size="sm" onClick={() => setDay((d) => Math.min(TOTAL_DAYS, d + 1))} disabled={day === TOTAL_DAYS}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <section className="rounded-lg border bg-background p-5">
        <div className="mb-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium">Today’s recovery tools</span>
          <span className="text-muted-foreground">{completion}% complete</span>
        </div>
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion}%` }} />
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {checklist.map(([key, label, Icon]) => (
            <label key={key} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/40">
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 rounded border-border"
                checked={Boolean(current[key])}
                onChange={(event) => updateDay({ [key]: event.target.checked } as Partial<DayState>)}
              />
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm leading-snug">{label}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Input value={current.sponsorCallTime} onChange={(event) => updateDay({ sponsorCallTime: event.target.value })} aria-label="Sponsor call time" />
          <Input value={current.outreach1Name} onChange={(event) => updateDay({ outreach1Name: event.target.value })} placeholder="Outreach 1 name" />
          <Input value={current.outreach2Name} onChange={(event) => updateDay({ outreach2Name: event.target.value })} placeholder="Outreach 2 name" />
          <Input value={current.outreach3Name} onChange={(event) => updateDay({ outreach3Name: event.target.value })} placeholder="Outreach 3 name" />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <div className="flex flex-col gap-6">
          <section className="rounded-lg border bg-background p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{template.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{template.prompt}</p>
              </div>
              <Badge variant="secondary">Day {day}</Badge>
            </div>
            <div className="mb-4 grid gap-2 sm:grid-cols-2">
              {template.sources.map((source) => (
                <div key={source} className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                  <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                  <span>{source}</span>
                </div>
              ))}
            </div>
            <h3 className="mb-2 text-sm font-semibold">Mr. Jude assignment</h3>
            <Textarea value={current.question} onChange={(event) => updateDay({ question: event.target.value })} className="min-h-24" />
            <h3 className="mb-2 mt-5 text-sm font-semibold">My written answer</h3>
            <Textarea value={current.answer} onChange={(event) => updateDay({ answer: event.target.value })} placeholder="Write the answer you want to read to Mr. Jude." className="min-h-56" />
          </section>

          <section className="rounded-lg border bg-background p-5">
            <h2 className="text-lg font-semibold">The 12 characteristics</h2>
            <p className="mb-4 text-sm text-muted-foreground">Mark each pattern for today so the sponsor call has concrete material.</p>
            <div className="space-y-3">
              {characteristics.map((text, index) => (
                <div key={text} className="rounded-lg border p-3">
                  <p className="mb-3 text-sm leading-relaxed"><span className="mr-2 font-semibold">{index + 1}.</span>{text}</p>
                  <div className="flex flex-wrap gap-2">
                    {(["yes", "no", "maybe"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateCharacteristic(index, value)}
                        className={`min-h-8 rounded-md border px-3 py-1 text-xs font-medium uppercase ${
                          current.characteristics[index] === value ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                        }`}
                      >
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
          <section className="rounded-lg border bg-background p-5">
            <div className="mb-3 flex items-center gap-2">
              <Library className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">Literature shelf</h2>
            </div>
            <div className="grid gap-2">
              {literatureSources.map((source) => (
                <button
                  key={source.title}
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, selectedSourceTitle: source.title }))}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    selectedSource.title === source.title ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{source.title}</span>
                    <Badge variant={source.status === "Scanned" ? "outline" : "secondary"}>{source.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{source.kind} · {source.pages}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-background p-5">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">{selectedSource.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground">{selectedSource.role}</p>
            <div className="mt-4 rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">Source location</p>
              <p className="mt-1 break-words text-xs">{selectedSource.path}</p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Rocky OS stores your notes and reading map here. The full document remains in the source file.
            </p>
          </section>

          <section className="rounded-lg border bg-background p-5">
            <h2 className="text-lg font-semibold">Source notes</h2>
            <p className="mb-3 text-xs text-muted-foreground">Write page references, sponsor comments, and anything you want to bring into today’s answer.</p>
            <Textarea value={current.sourceNotes} onChange={(event) => updateDay({ sourceNotes: event.target.value })} className="min-h-36" />
          </section>

          <section className="rounded-lg border bg-background p-5">
            <h2 className="text-lg font-semibold">Patterns noticed</h2>
            <Textarea value={current.patterns} onChange={(event) => updateDay({ patterns: event.target.value })} className="mt-3 min-h-36" />
          </section>

          <section className="rounded-lg border bg-background p-5">
            <h2 className="text-lg font-semibold">Notes for Mr. Jude</h2>
            <Textarea value={current.judeNotes} onChange={(event) => updateDay({ judeNotes: event.target.value })} placeholder="Questions, resistance, confusion, or anything I need to say out loud." className="mt-3 min-h-36" />
          </section>
        </div>
      </div>

      <section className="rounded-lg border bg-background p-5">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">My recovery lines</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Bottom Lines</h3>
            <Textarea value={state.bottomLines} onChange={(event) => setState((prev) => ({ ...prev, bottomLines: event.target.value }))} className="min-h-72" />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Middle Lines</h3>
            <Textarea value={state.middleLines} onChange={(event) => setState((prev) => ({ ...prev, middleLines: event.target.value }))} className="min-h-72" />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Top Lines</h3>
            <Textarea value={state.topLines} onChange={(event) => setState((prev) => ({ ...prev, topLines: event.target.value }))} className="min-h-72" />
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-background p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-lg font-semibold">Prepare for Jude</h2>
            <p className="text-sm text-muted-foreground">Builds one clean call summary from today’s assignment, calls, source notes, patterns, and questions.</p>
          </div>
          <Button size="sm" variant="outline" onClick={copySummary}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-xs leading-relaxed">{callSummary}</pre>
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold">Gratitude or sane action</h3>
          <Textarea value={current.gratitude} onChange={(event) => updateDay({ gratitude: event.target.value })} className="min-h-24" />
        </div>
      </section>

      <section className="rounded-lg border bg-muted/40 p-5">
        <div className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Saved automatically in this browser. This page organizes sponsor work and source references. It does not replace your sponsor, meetings, fellowship, therapy, medical care, or emergency support.
          </p>
        </div>
      </section>
    </div>
  );
}
