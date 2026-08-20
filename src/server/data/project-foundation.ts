import "server-only";
import { db } from "@/lib/db";

const RESET_PROJECT_EXTERNAL_SOURCE = "project_foundation";
const RESET_PROJECT_EXTERNAL_ID = "cannabis-reset-la-amsterdam-athens";
const RESET_START_DATE = new Date("2026-08-19T00:00:00.000Z");
const FINAL_SESSION_NOTE_TITLE = "FINAL CANNABIS SESSION";

const affirmations = [
  "I don't need to change every uncomfortable feeling.",
  "A craving is a feeling, not an instruction.",
  "I can want weed without using weed.",
  "Every time I delay an automatic impulse, I strengthen control over my life.",
  "I am not trying to stay high until Athens. I am preparing myself to arrive clear.",
  "Amsterdam is my transition, not my excuse.",
  "Athens is where I begin learning what normal feels like again.",
  "I don't have to feel amazing every day for this experiment to be working.",
  "Temporary discomfort doesn't require a permanent solution.",
  "My job today is not to solve my whole life. My job is to make the next good decision.",
  "I want clarity more than I want another automatic high.",
  "I am collecting evidence about the person I become when I stay present.",
];

const initialTasks = [
  {
    externalId: "cannabis-reset-2026-08-19-observe",
    title: "Observe cannabis urges before acting",
    dueDate: "2026-08-19",
    priority: "HIGH" as const,
    notes:
      "Pre use check in: What am I feeling right now? What am I hoping weed changes? Do I actually want it, or am I reaching automatically? Could I wait another 30 to 60 minutes?",
  },
  {
    externalId: "cannabis-reset-2026-08-19-basics",
    title: "Water, normal meals, movement, and sleep",
    dueDate: "2026-08-19",
    priority: "HIGH" as const,
    notes: "Today is observe rather than judge. Reduce automatic consumption and avoid turning one use into an all day sequence.",
  },
  {
    externalId: "cannabis-reset-2026-08-20-travel-safety",
    title: "Travel without cannabis or THC products",
    dueDate: "2026-08-20",
    priority: "URGENT" as const,
    notes:
      "Do not carry cannabis, THC pills, THC drinks, concentrates, edibles, or other marijuana products internationally or through international border crossings.",
  },
  {
    externalId: "cannabis-reset-2026-08-20-flight-taper",
    title: "Use the flight as part of the taper",
    dueDate: "2026-08-20",
    priority: "HIGH" as const,
    notes:
      "Eat before traveling, hydrate, move when possible, sleep when possible, and avoid replacing cannabis with heavy alcohol.",
  },
  {
    externalId: "cannabis-reset-final-session",
    title: "FINAL CANNABIS SESSION",
    dueDate: "2026-08-23",
    priority: "HIGH" as const,
    notes:
      "Complete this when the final session is honestly chosen. Record local time, location, feelings, approximate amount, and why this is the final session.",
  },
  {
    externalId: "cannabis-reset-athens-daily-checkin",
    title: "Athens reset daily check in",
    dueDate: "2026-08-24",
    priority: "HIGH" as const,
    notes:
      "Track cannabis free status, cravings, anxiety, mood, energy, sleep, appetite, exercise, sunlight, hydration, alcohol, social interaction, meaningful work, reflection, one accomplishment, one difficult moment, and what helped.",
  },
];

const habitTitles = [
  "Cannabis free day",
  "Morning sunlight",
  "Hydration",
  "Movement or walking",
  "Evening reset reflection",
];

const projectDescription =
  "Project Foundation initiative for progressively reducing cannabis exposure, finishing cannabis use before Athens, arriving without cannabis, and using Athens as a physical, mental, emotional, and lifestyle reset.";

async function findOrCreateMilestone(userId: string, projectId: string, title: string, dueDate: string, sortOrder: number) {
  const existing = await db.milestone.findFirst({ where: { userId, projectId, title } });
  if (existing) return existing;

  return db.milestone.create({
    data: {
      userId,
      projectId,
      title,
      dueDate: new Date(`${dueDate}T00:00:00.000Z`),
      sortOrder,
    },
  });
}

async function findOrCreateProjectNote(userId: string, projectId: string, title: string, body: string) {
  const existing = await db.note.findFirst({
    where: {
      userId,
      entityType: "PROJECT",
      entityId: projectId,
      title,
    },
  });

  if (existing) return existing;

  return db.note.create({
    data: {
      userId,
      entityType: "PROJECT",
      entityId: projectId,
      title,
      body,
    },
  });
}

async function ensureCannabisReset(userId: string) {
  const project = await db.project.upsert({
    where: {
      userId_externalSource_externalId: {
        userId,
        externalSource: RESET_PROJECT_EXTERNAL_SOURCE,
        externalId: RESET_PROJECT_EXTERNAL_ID,
      },
    },
    update: {
      title: "Cannabis Reset — LA → Amsterdam → Athens",
      description: projectDescription,
      area: "HEALTH",
      status: "ACTIVE",
      color: "#16a34a",
      targetDate: new Date("2026-09-07T00:00:00.000Z"),
    },
    create: {
      userId,
      title: "Cannabis Reset — LA → Amsterdam → Athens",
      description: projectDescription,
      area: "HEALTH",
      status: "ACTIVE",
      color: "#16a34a",
      targetDate: new Date("2026-09-07T00:00:00.000Z"),
      externalSource: RESET_PROJECT_EXTERNAL_SOURCE,
      externalId: RESET_PROJECT_EXTERNAL_ID,
    },
  });

  const milestones = await Promise.all([
    findOrCreateMilestone(userId, project.id, "LA taper begins", "2026-08-19", 10),
    findOrCreateMilestone(userId, project.id, "Travel day LA to Amsterdam", "2026-08-20", 20),
    findOrCreateMilestone(userId, project.id, "The Landing Ramp", "2026-08-21", 30),
    findOrCreateMilestone(userId, project.id, "FINAL CANNABIS SESSION", "2026-08-23", 40),
    findOrCreateMilestone(userId, project.id, "ATHENS RESET", "2026-08-24", 50),
  ]);

  const milestoneByTitle = Object.fromEntries(milestones.map((milestone) => [milestone.title, milestone.id]));

  await Promise.all(
    initialTasks.map((task, index) =>
      db.task.upsert({
        where: {
          userId_externalSource_externalId: {
            userId,
            externalSource: RESET_PROJECT_EXTERNAL_SOURCE,
            externalId: task.externalId,
          },
        },
        update: {
          projectId: project.id,
          milestoneId:
            task.externalId === "cannabis-reset-final-session"
              ? milestoneByTitle["FINAL CANNABIS SESSION"]
              : task.dueDate === "2026-08-24"
                ? milestoneByTitle["ATHENS RESET"]
                : undefined,
          title: task.title,
          notes: task.notes,
          priority: task.priority,
          dueDate: new Date(`${task.dueDate}T00:00:00.000Z`),
          sortOrder: index,
        },
        create: {
          userId,
          projectId: project.id,
          milestoneId:
            task.externalId === "cannabis-reset-final-session"
              ? milestoneByTitle["FINAL CANNABIS SESSION"]
              : task.dueDate === "2026-08-24"
                ? milestoneByTitle["ATHENS RESET"]
                : undefined,
          title: task.title,
          notes: task.notes,
          priority: task.priority,
          dueDate: new Date(`${task.dueDate}T00:00:00.000Z`),
          sortOrder: index,
          externalSource: RESET_PROJECT_EXTERNAL_SOURCE,
          externalId: task.externalId,
        },
      }),
    ),
  );

  await Promise.all(
    habitTitles.map(async (title) => {
      const existing = await db.habit.findFirst({ where: { userId, title } });
      if (existing) return existing;
      return db.habit.create({ data: { userId, title, area: "HEALTH", frequency: "DAILY", color: "#16a34a" } });
    }),
  );

  await findOrCreateProjectNote(
    userId,
    project.id,
    "Why I'm Doing This",
    "I'm not doing this because weed is evil.\n\nI'm doing this because I want to know who I am without constantly changing how I feel.\n\nCannabis has been part of my routines, relaxation, travel, boredom, emotions and escape. Project Foundation is supposed to help me understand what my life feels like when I intentionally build it instead of automatically reacting to whatever I feel in the moment.\n\nAmsterdam isn't the finish line.\n\nAthens isn't punishment.\n\nThis trip is an experiment in clarity.\n\nI want to see what happens to my energy, confidence, anxiety, sleep, ambition, relationships, creativity and sense of purpose when I give my brain enough time to experience life without constantly reaching for weed.\n\nI don't have to decide today that I will never touch cannabis again for the rest of my life.\n\nI only have to honor the experiment I'm choosing right now.",
  );

  await findOrCreateProjectNote(
    userId,
    project.id,
    "Initial feelings",
    "August 19, 2026\n\nRocky feels motivated to stop cannabis but is also concerned about withdrawal and what the first several days without weed will feel like.\n\nPart of the original instinct was to consume a very large amount before traveling so THC would remain in his body and potentially make quitting easier.\n\nThe updated approach is different: reduce rather than load up.\n\nThere may be nervousness about sleeping, anxiety, boredom, irritability, cravings and not having cannabis available. There is also curiosity.\n\nThis trip provides an unusual opportunity to change environment at the same time as changing behavior. The intention is to approach discomfort as data rather than immediately trying to eliminate it.",
  );

  await findOrCreateProjectNote(
    userId,
    project.id,
    "Project Foundation core thought",
    "PROJECT FOUNDATION IS NOT ABOUT CREATING A PERFECT ROCKY.\n\nIT IS ABOUT DISCOVERING WHAT ROCKY LOOKS LIKE WHEN HIS LIFE IS BUILT INTENTIONALLY.\n\nCannabis is one part of that experiment.",
  );

  await findOrCreateProjectNote(userId, project.id, "Affirmation rotation", affirmations.join("\n"));

  const journalDate = new Date("2026-08-19T00:00:00.000Z");
  const existingJournal = await db.journalEntry.findUnique({
    where: { userId_entryDate: { userId, entryDate: journalDate } },
  });

  if (!existingJournal) {
    await db.journalEntry.create({
      data: {
        userId,
        entryDate: journalDate,
        title: "Why I'm Doing This",
        body: "I'm not doing this because weed is evil.\n\nI'm doing this because I want to know who I am without constantly changing how I feel.\n\nThis trip is an experiment in clarity. I only have to honor the experiment I'm choosing right now.",
        mood: 4,
      },
    });
  }

  const finalSession = await db.note.findFirst({
    where: { userId, entityType: "PROJECT", entityId: project.id, title: FINAL_SESSION_NOTE_TITLE },
    orderBy: { updatedAt: "desc" },
  });

  const tasks = await db.task.findMany({
    where: { userId, projectId: project.id, status: { in: ["TODO", "IN_PROGRESS"] } },
    orderBy: [{ dueDate: "asc" }, { sortOrder: "asc" }],
    take: 8,
  });

  return { project, milestones, tasks, finalSession };
}

export async function getFoundationVendorLeads(userId: string) {
  return db.foundationVendorLead.findMany({
    where: { userId },
    orderBy: [{ countryGroup: "asc" }, { leadQuality: "asc" }, { name: "asc" }],
  });
}

export async function getFoundationOverview(userId: string) {
  const [leads, cannabisReset] = await Promise.all([getFoundationVendorLeads(userId), ensureCannabisReset(userId)]);
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
    cannabisReset: {
      ...cannabisReset,
      resetStartDate: RESET_START_DATE,
      affirmations,
    },
  };
}
