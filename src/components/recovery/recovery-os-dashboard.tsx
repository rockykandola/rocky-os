"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Check,
  ClipboardList,
  Copy,
  Flame,
  Heart,
  Library,
  MessageCircle,
  Phone,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  Utensils,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const STORAGE_KEY = "rocky-os-recovery-hub-v1";

const programTracks = [
  {
    id: "aa",
    title: "AA",
    subtitle: "Alcohol, emotional sobriety, service, and step work",
    icon: ShieldCheck,
    color: "bg-sky-500",
    dailyFocus: [
      "Stay sober today",
      "Make one honest recovery contact",
      "Read from AA literature",
      "Do one useful act of service",
      "Inventory resentment, fear, dishonesty, or self pity",
    ],
    literature: [
      {
        title: "AA Big Book",
        role: "Core recovery text, How It Works, spiritual experience, and working with others.",
      },
      {
        title: "AA 12 Steps and 12 Traditions",
        role: "Step study, tradition study, and deeper daily inventory.",
      },
      {
        title: "Attendance Template",
        role: "Meeting record and accountability proof.",
      },
      {
        title: "Emotional Sobriety Round Up",
        role: "Audio reference for emotional sobriety and right sized thinking.",
      },
    ],
    sponsorPrompt: "What truth am I avoiding today, and what sane action would move me back toward sobriety?",
  },
  {
    id: "na",
    title: "NA",
    subtitle: "Clean time, cravings, step writing, and fellowship",
    icon: Heart,
    color: "bg-emerald-500",
    dailyFocus: [
      "Stay clean today",
      "Call or message one recovering addict",
      "Read one NA step prompt",
      "Name the strongest craving or reservation",
      "Choose one replacement action before isolation starts",
    ],
    literature: [
      {
        title: "NA Step Working Guide",
        role: "Primary question source for written step work.",
      },
      {
        title: "NA Step Working Guide copy",
        role: "Second local copy for backup or alternate formatting.",
      },
      {
        title: "Recovery Dharma",
        role: "Meditation, inquiry, and craving observation support.",
      },
    ],
    sponsorPrompt: "What am I trying to manage alone that needs fellowship, honesty, or surrender?",
  },
  {
    id: "weight",
    title: "Weight Loss",
    subtitle: "Fat loss, discipline, energy, knee friendly movement, and food honesty",
    icon: Scale,
    color: "bg-orange-500",
    dailyFocus: [
      "Weigh in or log body trend",
      "Hit protein and water",
      "Walk or train without irritating the knee",
      "Track food honestly",
      "Protect sleep and avoid late night drift",
    ],
    literature: [
      {
        title: "Fitness Log",
        role: "Local Project Foundation tracker for activity, duration, intensity, knee discomfort, and notes.",
      },
      {
        title: "Clarity Log",
        role: "Sleep, energy, mood, clarity, cravings, triggers, and substance free tracking.",
      },
    ],
    sponsorPrompt: "What is the next honest health action that is small enough to do today and meaningful enough to count?",
  },
] as const;

type TrackId = (typeof programTracks)[number]["id"];

const workbookModules: Record<
  TrackId,
  {
    id: string;
    title: string;
    purpose: string;
    prompts: string[];
  }[]
> = {
  aa: [
    {
      id: "aa-sober-day",
      title: "Sober day plan",
      purpose: "Make the day smaller than the disease and specific enough to follow.",
      prompts: [
        "What is the one situation today where alcohol, ego, anger, self pity, or isolation could get a foothold?",
        "What meeting, call, prayer, reading, or service action am I doing before the day gets loose?",
        "What am I not negotiating with today?",
      ],
    },
    {
      id: "aa-step-one",
      title: "Step One reality check",
      purpose: "Name powerlessness and unmanageability in plain language, without drama or denial.",
      prompts: [
        "Where has self will failed me recently?",
        "What did I lose control of once I started trying to manage my feelings my way?",
        "What would acceptance look like today if I stopped pretending I can outthink this alone?",
      ],
    },
    {
      id: "aa-inventory",
      title: "Quick inventory",
      purpose: "Catch resentments, fear, dishonesty, and selfishness while they are still small.",
      prompts: [
        "Who or what am I resentful toward today, and what do I think they threaten?",
        "What fear is underneath my reaction?",
        "Where do I owe honesty, humility, an apology, or restraint?",
      ],
    },
    {
      id: "aa-emotional-sobriety",
      title: "Emotional sobriety",
      purpose: "Practice being right sized instead of controlled by approval, rejection, or control.",
      prompts: [
        "Where am I depending on another person, result, or mood to feel okay?",
        "What can I do today that is useful whether or not I feel good?",
        "What would mature, sober Rocky do in the next hour?",
      ],
    },
  ],
  na: [
    {
      id: "na-clean-day",
      title: "Clean day plan",
      purpose: "Protect today from cravings, reservations, isolation, and vague promises.",
      prompts: [
        "What is the strongest reservation, craving, or excuse active today?",
        "What person am I contacting before I isolate?",
        "What place, app, person, or routine do I need to avoid today?",
      ],
    },
    {
      id: "na-step-one",
      title: "NA Step One work",
      purpose: "See the pattern clearly enough that recovery becomes the sane option.",
      prompts: [
        "What does powerlessness look like in my actual behavior, not my theory?",
        "How has using, substituting, hiding, or obsessing made life unmanageable?",
        "What consequence do I need to remember before my mind edits the truth?",
      ],
    },
    {
      id: "na-triggers",
      title: "Trigger map",
      purpose: "Convert triggers into a concrete interruption plan.",
      prompts: [
        "What feeling usually comes right before I want to check out?",
        "What is my first visible warning sign?",
        "What are the first three interruption actions I will take?",
      ],
    },
    {
      id: "na-fellowship",
      title: "Fellowship and service",
      purpose: "Move from isolation into connection before the disease gets private.",
      prompts: [
        "Who can I be honest with today?",
        "What can I share in a meeting without performing or hiding?",
        "What simple service action gets me out of myself?",
      ],
    },
  ],
  weight: [
    {
      id: "weight-food-plan",
      title: "Food plan",
      purpose: "Make fat loss practical by deciding before cravings decide for me.",
      prompts: [
        "What am I eating for the next meal?",
        "What protein anchor am I using today?",
        "What food choice is most likely to drift, and what is the replacement plan?",
      ],
    },
    {
      id: "weight-craving-plan",
      title: "Craving interruption",
      purpose: "Treat food cravings like a signal, not an instruction.",
      prompts: [
        "What am I actually feeling when I want to eat off plan?",
        "Am I hungry, tired, lonely, bored, anxious, angry, or avoiding something?",
        "What 10 minute action comes before any decision to eat?",
      ],
    },
    {
      id: "weight-training",
      title: "Knee friendly movement",
      purpose: "Build consistency without turning pain into an excuse or a setback.",
      prompts: [
        "What movement can I do today without aggravating my knee?",
        "What is the minimum version that still counts?",
        "What did my body tell me after movement?",
      ],
    },
    {
      id: "weight-weekly-review",
      title: "Weekly trend review",
      purpose: "Track the trend instead of letting one weigh in run the day.",
      prompts: [
        "What is the actual trend this week?",
        "What worked?",
        "What one adjustment would make next week easier to repeat?",
      ],
    },
  ],
};

const operatingPlans: Record<TrackId, string[]> = {
  aa: [
    "Meeting or honest recovery contact before isolation gets comfortable.",
    "Read or write one small piece of step work.",
    "Tell the truth faster than pride wants to.",
    "Do one act of service without needing credit.",
    "End the day with a quick inventory and repair plan.",
  ],
  na: [
    "Name the craving, reservation, or substitute behavior without dressing it up.",
    "Contact one recovering person before acting on impulse.",
    "Avoid the highest risk place, person, app, or routine today.",
    "Use the body: walk, shower, eat, sleep, or sit in a meeting.",
    "Write the clean version of the truth before the disease edits it.",
  ],
  weight: [
    "Plan the next meal before hunger gets loud.",
    "Protein, water, steps, and sleep are the non dramatic foundation.",
    "Use knee friendly movement and stop before pain becomes punishment.",
    "Log honestly. No moral trial, no fantasy accounting.",
    "Review the weekly trend, not just the emotional weigh in.",
  ],
};

type TrackState = {
  active: boolean;
  meeting: boolean;
  contact: boolean;
  reading: boolean;
  writing: boolean;
  service: boolean;
  sober: boolean;
  meetingName: string;
  contactName: string;
  stepOrReading: string;
  notes: string;
};

type HealthState = {
  weight: string;
  targetWeight: string;
  protein: string;
  calories: string;
  water: string;
  steps: string;
  workout: string;
  sleep: string;
  cravings: string;
  win: string;
};

type RecoveryState = {
  date: string;
  selectedTrack: TrackId;
  tracks: Record<TrackId, TrackState>;
  health: HealthState;
  workbookAnswers: Record<string, string>;
  morningIntention: string;
  eveningReview: string;
};

const baseTrackState: TrackState = {
  active: true,
  meeting: false,
  contact: false,
  reading: false,
  writing: false,
  service: false,
  sober: false,
  meetingName: "",
  contactName: "",
  stepOrReading: "",
  notes: "",
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function createInitialState(): RecoveryState {
  return {
    date: todayKey(),
    selectedTrack: "aa",
    tracks: {
      aa: { ...baseTrackState },
      na: { ...baseTrackState },
      weight: {
        ...baseTrackState,
        meeting: false,
        contact: false,
        reading: false,
        writing: false,
        service: false,
      },
    },
    health: {
      weight: "",
      targetWeight: "",
      protein: "",
      calories: "",
      water: "",
      steps: "",
      workout: "",
      sleep: "",
      cravings: "",
      win: "",
    },
    workbookAnswers: {},
    morningIntention: "",
    eveningReview: "",
  };
}

function mergeState(raw: string | null): RecoveryState {
  const initial = createInitialState();
  if (!raw) return initial;

  try {
    const parsed = JSON.parse(raw) as Partial<RecoveryState>;
    return {
      ...initial,
      ...parsed,
      tracks: {
        aa: { ...initial.tracks.aa, ...parsed.tracks?.aa },
        na: { ...initial.tracks.na, ...parsed.tracks?.na },
        weight: { ...initial.tracks.weight, ...parsed.tracks?.weight },
      },
      health: { ...initial.health, ...parsed.health },
      workbookAnswers: { ...initial.workbookAnswers, ...parsed.workbookAnswers },
    };
  } catch {
    return initial;
  }
}

function trackCompletion(track: TrackState, id: TrackId) {
  const checks =
    id === "weight"
      ? [track.sober, track.writing, track.service, track.reading, track.contact]
      : [track.sober, track.meeting, track.contact, track.reading, track.writing, track.service];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function RecoveryOsDashboard() {
  const [state, setState] = useState<RecoveryState>(createInitialState);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setState(mergeState(window.localStorage.getItem(STORAGE_KEY)));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);

  const selectedTrack = programTracks.find((track) => track.id === state.selectedTrack) ?? programTracks[0];
  const selectedState = state.tracks[selectedTrack.id];
  const dailyCheckItems = [
    { key: "sober", label: selectedTrack.id === "weight" ? "Stayed food honest" : "Stayed sober or clean", icon: ShieldCheck },
    { key: "meeting", label: selectedTrack.id === "weight" ? "Movement done" : "Meeting done", icon: MessageCircle },
    { key: "contact", label: selectedTrack.id === "weight" ? "Accountability contact" : "Sponsor or fellow contact", icon: Phone },
    { key: "reading", label: selectedTrack.id === "weight" ? "Plan reviewed" : "Reading done", icon: BookOpen },
    { key: "writing", label: selectedTrack.id === "weight" ? "Food logged" : "Step writing done", icon: ClipboardList },
    { key: "service", label: selectedTrack.id === "weight" ? "Body care done" : "Service done", icon: Heart },
  ] as const;
  const totalCompletion = Math.round(
    programTracks.reduce((sum, track) => sum + trackCompletion(state.tracks[track.id], track.id), 0) / programTracks.length,
  );

  const dailySummary = useMemo(() => {
    const trackLines = programTracks.map((track) => {
      const item = state.tracks[track.id];
      const workbookLines = workbookModules[track.id]
        .map((module) => {
          const answers = module.prompts
            .map((prompt, index) => {
              const key = `${track.id}:${module.id}:${index}`;
              return `${prompt}\n${state.workbookAnswers[key] || "Not written yet."}`;
            })
            .join("\n");
          return `${module.title}\n${answers}`;
        })
        .join("\n\n");

      return [
        `${track.title}: ${trackCompletion(item, track.id)}%`,
        `Clean or sober action: ${item.sober ? "yes" : "open"}`,
        `Meeting or movement: ${item.meetingName || "not logged"}`,
        `Contact: ${item.contactName || "not logged"}`,
        `Reading or step work: ${item.stepOrReading || "not logged"}`,
        `Notes: ${item.notes || "none"}`,
        "",
        "Workbook:",
        workbookLines,
      ].join("\n");
    });

    return [
      `Recovery OS daily review for ${state.date}`,
      "",
      "Morning intention:",
      state.morningIntention || "Not written yet.",
      "",
      trackLines.join("\n\n"),
      "",
      "Weight loss metrics:",
      `Weight: ${state.health.weight || "not logged"}`,
      `Target weight: ${state.health.targetWeight || "not logged"}`,
      `Protein: ${state.health.protein || "not logged"}`,
      `Calories: ${state.health.calories || "not logged"}`,
      `Water: ${state.health.water || "not logged"}`,
      `Steps: ${state.health.steps || "not logged"}`,
      `Workout: ${state.health.workout || "not logged"}`,
      `Sleep: ${state.health.sleep || "not logged"}`,
      `Cravings: ${state.health.cravings || "not logged"}`,
      `Win: ${state.health.win || "not logged"}`,
      "",
      "Evening review:",
      state.eveningReview || "Not written yet.",
    ].join("\n");
  }, [state]);

  function updateTrack(id: TrackId, patch: Partial<TrackState>) {
    setState((prev) => ({
      ...prev,
      tracks: {
        ...prev.tracks,
        [id]: { ...prev.tracks[id], ...patch },
      },
    }));
  }

  function updateWorkbookAnswer(key: string, value: string) {
    setState((prev) => ({
      ...prev,
      workbookAnswers: {
        ...prev.workbookAnswers,
        [key]: value,
      },
    }));
  }

  async function copyDailySummary() {
    await navigator.clipboard.writeText(dailySummary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  if (!loaded) return <div className="text-sm text-muted-foreground">Loading Recovery OS...</div>;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Recovery OS
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">AA, NA, and Weight Loss</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            One daily place for sobriety, clean time, step work, fellowship, movement, food honesty, and the small actions that keep the day from drifting.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input value={state.date} onChange={(event) => setState((prev) => ({ ...prev, date: event.target.value }))} type="date" className="w-40" />
          <Button size="sm" variant="outline" onClick={copyDailySummary}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy daily review"}
          </Button>
        </div>
      </div>

      <section className="rounded-lg border bg-background p-5">
        <div className="mb-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium">Whole day completion</span>
          <span className="text-muted-foreground">{totalCompletion}% complete</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${totalCompletion}%` }} />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {programTracks.map((track) => {
          const Icon = track.icon;
          const item = state.tracks[track.id];
          const completion = trackCompletion(item, track.id);
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => setState((prev) => ({ ...prev, selectedTrack: track.id }))}
              className={`rounded-lg border bg-background p-5 text-left transition-colors ${
                selectedTrack.id === track.id ? "border-primary shadow-sm" : "hover:bg-muted/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${track.color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-semibold">{track.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{track.subtitle}</p>
                  </div>
                </div>
                <Badge variant="secondary">{completion}%</Badge>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${track.color}`} style={{ width: `${completion}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col gap-6">
          <section className="rounded-lg border bg-background p-5">
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">Today in {selectedTrack.title}</h2>
            </div>
            <div className="grid gap-2">
              {selectedTrack.dailyFocus.map((focus) => (
                <div key={focus} className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  <span>{focus}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-lg border p-3 text-sm text-muted-foreground">{selectedTrack.sponsorPrompt}</p>
          </section>

          <section className="rounded-lg border bg-background p-5">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">{selectedTrack.title} operating plan</h2>
            </div>
            <div className="grid gap-2">
              {operatingPlans[selectedTrack.id].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-background p-5">
            <div className="mb-4 flex items-center gap-2">
              <Library className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">In-app workbook</h2>
            </div>
            <div className="grid gap-4">
              {workbookModules[selectedTrack.id].map((module) => (
                <div key={module.id} className="rounded-lg border p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold">{module.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{module.purpose}</p>
                  </div>
                  <div className="grid gap-3">
                    {module.prompts.map((prompt, index) => {
                      const key = `${selectedTrack.id}:${module.id}:${index}`;
                      return (
                        <label key={key} className="grid gap-2">
                          <span className="text-sm font-medium">{prompt}</span>
                          <Textarea
                            value={state.workbookAnswers[key] ?? ""}
                            onChange={(event) => updateWorkbookAnswer(key, event.target.value)}
                            placeholder="Write the honest answer here."
                            className="min-h-24"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-background p-5">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">Program references used</h2>
            </div>
            <div className="grid gap-2">
              {selectedTrack.literature.map((source) => (
                <div key={source.title} className="rounded-lg bg-muted/50 p-3">
                  <h3 className="text-sm font-semibold">{source.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{source.role}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-lg border bg-background p-5">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">Daily check in</h2>
            </div>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {dailyCheckItems.map(({ key, label, icon: Icon }) => (
                <label key={key} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/40">
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 rounded border-border"
                    checked={selectedState[key]}
                    onChange={(event) => updateTrack(selectedTrack.id, { [key]: event.target.checked } as Partial<TrackState>)}
                  />
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm leading-snug">{label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Input
                value={selectedState.meetingName}
                onChange={(event) => updateTrack(selectedTrack.id, { meetingName: event.target.value })}
                placeholder={selectedTrack.id === "weight" ? "Walk, gym, mobility" : "Meeting name"}
              />
              <Input
                value={selectedState.contactName}
                onChange={(event) => updateTrack(selectedTrack.id, { contactName: event.target.value })}
                placeholder="Contact name"
              />
              <Input
                value={selectedState.stepOrReading}
                onChange={(event) => updateTrack(selectedTrack.id, { stepOrReading: event.target.value })}
                placeholder="Step, page, or plan"
              />
            </div>
            <Textarea
              value={selectedState.notes}
              onChange={(event) => updateTrack(selectedTrack.id, { notes: event.target.value })}
              placeholder="What happened today, what helped, what needs honesty tomorrow?"
              className="mt-4 min-h-36"
            />
          </section>

          <section className="rounded-lg border bg-background p-5">
            <div className="mb-4 flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">Weight loss metrics</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Input value={state.health.weight} onChange={(event) => setState((prev) => ({ ...prev, health: { ...prev.health, weight: event.target.value } }))} placeholder="Weight" />
              <Input value={state.health.targetWeight} onChange={(event) => setState((prev) => ({ ...prev, health: { ...prev.health, targetWeight: event.target.value } }))} placeholder="Target" />
              <Input value={state.health.protein} onChange={(event) => setState((prev) => ({ ...prev, health: { ...prev.health, protein: event.target.value } }))} placeholder="Protein" />
              <Input value={state.health.calories} onChange={(event) => setState((prev) => ({ ...prev, health: { ...prev.health, calories: event.target.value } }))} placeholder="Calories" />
              <Input value={state.health.water} onChange={(event) => setState((prev) => ({ ...prev, health: { ...prev.health, water: event.target.value } }))} placeholder="Water" />
              <Input value={state.health.steps} onChange={(event) => setState((prev) => ({ ...prev, health: { ...prev.health, steps: event.target.value } }))} placeholder="Steps" />
              <Input value={state.health.workout} onChange={(event) => setState((prev) => ({ ...prev, health: { ...prev.health, workout: event.target.value } }))} placeholder="Workout" />
              <Input value={state.health.sleep} onChange={(event) => setState((prev) => ({ ...prev, health: { ...prev.health, sleep: event.target.value } }))} placeholder="Sleep" />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Textarea value={state.health.cravings} onChange={(event) => setState((prev) => ({ ...prev, health: { ...prev.health, cravings: event.target.value } }))} placeholder="Food, alcohol, drug, or emotional cravings" className="min-h-28" />
              <Textarea value={state.health.win} onChange={(event) => setState((prev) => ({ ...prev, health: { ...prev.health, win: event.target.value } }))} placeholder="One health win today" className="min-h-28" />
            </div>
          </section>
        </div>
      </div>

      <section className="rounded-lg border bg-background p-5">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">Morning and evening</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Textarea
            value={state.morningIntention}
            onChange={(event) => setState((prev) => ({ ...prev, morningIntention: event.target.value }))}
            placeholder="Morning intention: what kind of man am I practicing being today?"
            className="min-h-36"
          />
          <Textarea
            value={state.eveningReview}
            onChange={(event) => setState((prev) => ({ ...prev, eveningReview: event.target.value }))}
            placeholder="Evening review: where was I honest, where did I drift, what is tomorrow's first right action?"
            className="min-h-36"
          />
        </div>
      </section>

      <section className="rounded-lg border bg-muted/40 p-5">
        <div className="flex items-start gap-3">
          <Utensils className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Recovery OS is an organizer for daily recovery, health habits, and source references. It does not replace meetings, sponsors, fellowship, medical care, therapy, nutrition advice, or emergency help.
          </p>
        </div>
      </section>
    </div>
  );
}
