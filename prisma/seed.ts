import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { addDays, subDays, startOfDay } from "date-fns";

const DEMO_EMAIL = "demo@rocky-os.app";
const DEMO_PASSWORD = "RockyOS!2026";
const DEMO_NAME = "Rocky Kandola";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function ensureDemoAuthUser(): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || url.includes("your-project")) {
    console.warn(
      "⚠️  NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured — seeding under a placeholder " +
        "user id. Sign up through the app UI instead, then re-run with real Supabase credentials to attach a " +
        "login to this demo data.",
    );
    return "00000000-0000-0000-0000-000000000001";
  }

  const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: DEMO_NAME },
  });

  if (!createError && created.user) return created.user.id;

  const { data: list, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;
  const existing = list.users.find((u) => u.email === DEMO_EMAIL);
  if (!existing) throw createError ?? new Error("Could not create or find demo user");
  return existing.id;
}

async function main() {
  const userId = await ensureDemoAuthUser();
  const today = startOfDay(new Date());

  const user = await db.user.upsert({
    where: { id: userId },
    update: { email: DEMO_EMAIL, fullName: DEMO_NAME },
    create: { id: userId, email: DEMO_EMAIL, fullName: DEMO_NAME, timezone: "America/Los_Angeles" },
  });

  // Wipe existing demo data for idempotent re-seeding. Doesn't touch anything
  // imported from Google Tasks (that's keyed by externalSource/externalId and
  // managed by the import action, not this script).
  await db.$transaction([
    db.notification.deleteMany({ where: { userId: user.id } }),
    db.dailyPlan.deleteMany({ where: { userId: user.id } }),
    db.brainDumpItem.deleteMany({ where: { userId: user.id } }),
    db.interaction.deleteMany({ where: { userId: user.id } }),
    db.contact.deleteMany({ where: { userId: user.id } }),
    db.healthMetric.deleteMany({ where: { userId: user.id } }),
    db.habitLog.deleteMany({ where: { userId: user.id } }),
    db.habit.deleteMany({ where: { userId: user.id } }),
    db.journalEntry.deleteMany({ where: { userId: user.id } }),
    db.fileAsset.deleteMany({ where: { userId: user.id } }),
    db.note.deleteMany({ where: { userId: user.id } }),
    db.task.deleteMany({ where: { userId: user.id, externalSource: null } }),
    db.milestone.deleteMany({ where: { userId: user.id } }),
    db.project.deleteMany({ where: { userId: user.id, externalSource: null } }),
  ]);

  // ---------------------------------------------------------------------
  // Hair Maiden India — the flagship brand, so it gets the richest seed.
  // ---------------------------------------------------------------------
  const hmi = await db.project.create({
    data: {
      userId: user.id,
      title: "Hair Maiden India",
      description: "Flagship hair extensions brand — website, wholesale, ads, and local SEO.",
      area: "BUSINESS",
      status: "ACTIVE",
      color: "#c026d3",
    },
  });
  const hmiWebsite = await db.milestone.create({
    data: { userId: user.id, projectId: hmi.id, title: "Wholesale suite live", status: "IN_PROGRESS", sortOrder: 0 },
  });
  const hmiGrowth = await db.milestone.create({
    data: { userId: user.id, projectId: hmi.id, title: "Ads & local SEO push", status: "IN_PROGRESS", sortOrder: 1 },
  });
  await db.task.createMany({
    data: [
      {
        userId: user.id,
        projectId: hmi.id,
        milestoneId: hmiWebsite.id,
        title: "Get wholesale suite online",
        status: "TODO",
        priority: "HIGH",
      },
      {
        userId: user.id,
        projectId: hmi.id,
        milestoneId: hmiWebsite.id,
        title: "Optimize best pages for products & ads",
        status: "TODO",
        priority: "MEDIUM",
      },
      {
        userId: user.id,
        projectId: hmi.id,
        milestoneId: hmiWebsite.id,
        title: "Add rush shipping for certain products",
        status: "TODO",
        priority: "LOW",
      },
      {
        userId: user.id,
        projectId: hmi.id,
        milestoneId: hmiGrowth.id,
        title: "Google Adwords re-visit",
        status: "TODO",
        priority: "MEDIUM",
      },
      {
        userId: user.id,
        projectId: hmi.id,
        milestoneId: hmiGrowth.id,
        title: "Local SEO: build out Q&A section",
        status: "TODO",
        priority: "HIGH",
        dueDate: today,
        isTopThree: true,
        topThreeDate: today,
        sortOrder: 0,
      },
      {
        userId: user.id,
        projectId: hmi.id,
        milestoneId: hmiGrowth.id,
        title: "Record and submit video testimonial",
        status: "TODO",
        priority: "MEDIUM",
      },
      {
        userId: user.id,
        projectId: hmi.id,
        title: "Hubspot clean up and usage",
        status: "TODO",
        priority: "MEDIUM",
        assignee: "Rocky",
      },
      {
        userId: user.id,
        projectId: hmi.id,
        title: "Attentive re-do and update campaigns",
        status: "TODO",
        priority: "MEDIUM",
      },
    ],
  });

  const hairVirginRaw = await db.project.create({
    data: {
      userId: user.id,
      title: "Hair Virgin Raw",
      description: "DBA under the Hair Maiden umbrella.",
      area: "BUSINESS",
      status: "ACTIVE",
      color: "#db2777",
    },
  });
  await db.task.createMany({
    data: [
      { userId: user.id, projectId: hairVirginRaw.id, title: "Check current inventory levels", status: "TODO", priority: "MEDIUM" },
      { userId: user.id, projectId: hairVirginRaw.id, title: "Review DBA filing status", status: "TODO", priority: "LOW" },
    ],
  });

  // ---------------------------------------------------------------------
  // Rocky's Rentals LLC — property rentals (Hipcamp + direct guests).
  // ---------------------------------------------------------------------
  const rentals = await db.project.create({
    data: {
      userId: user.id,
      title: "Rocky's Rentals LLC",
      description: "Property rentals — guest bookings, cleaners, Hipcamp.",
      area: "BUSINESS",
      status: "ACTIVE",
      color: "#0891b2",
    },
  });
  await db.task.createMany({
    data: [
      {
        userId: user.id,
        projectId: rentals.id,
        title: "Confirm cleaner payout for last stay",
        status: "TODO",
        priority: "HIGH",
        dueDate: today,
        isTopThree: true,
        topThreeDate: today,
        sortOrder: 1,
      },
      { userId: user.id, projectId: rentals.id, title: "Respond to review request", status: "TODO", priority: "LOW" },
      { userId: user.id, projectId: rentals.id, title: "Check Hipcamp payout reconciliation", status: "TODO", priority: "MEDIUM" },
    ],
  });

  // ---------------------------------------------------------------------
  // Smaller ventures / collabs — lighter seed, one project each.
  // ---------------------------------------------------------------------
  const smallerVentures: {
    title: string;
    description: string;
    color: string;
    tasks: string[];
  }[] = [
    {
      title: "Sober Living",
      description: "Sober living business operations.",
      color: "#65a30d",
      tasks: ["Check occupancy for the month", "Follow up on referral partners"],
    },
    {
      title: "Healing Forest Sanctuaries",
      description: "501(c)(3) nonprofit.",
      color: "#16a34a",
      tasks: ["Check in on 501(c)(3) filing status", "Review sanctuary volunteer schedule"],
    },
    {
      title: "Red Dot Imports / Etsy Store",
      description: "Import + Etsy retail line.",
      color: "#ea580c",
      tasks: ["Review latest Etsy order queue", "Check import shipment status"],
    },
    {
      title: "Abundance Abroad (TJ Taylor)",
      description: "Collaboration venture with TJ Taylor.",
      color: "#7c3aed",
      tasks: ["Sync with TJ on current milestones"],
    },
    {
      title: "Pillars of Light (Avi Nimmer)",
      description: "Collaboration venture with Avi Nimmer.",
      color: "#0d9488",
      tasks: ["Sync with Avi on current milestones"],
    },
    {
      title: "Thai Products (Mr Mark)",
      description: "Sourcing venture in Thailand.",
      color: "#eab308",
      tasks: ["Check in with Mr Mark on next shipment"],
    },
  ];

  for (const venture of smallerVentures) {
    const project = await db.project.create({
      data: {
        userId: user.id,
        title: venture.title,
        description: venture.description,
        area: "BUSINESS",
        status: "ACTIVE",
        color: venture.color,
      },
    });
    await db.task.createMany({
      data: venture.tasks.map((title) => ({
        userId: user.id,
        projectId: project.id,
        title,
        status: "TODO" as const,
        priority: "LOW" as const,
      })),
    });
  }

  // ---------------------------------------------------------------------
  // Personal & life admin.
  // ---------------------------------------------------------------------
  const taxes = await db.project.create({
    data: {
      userId: user.id,
      title: "Taxes & Finances",
      area: "FINANCE",
      status: "ACTIVE",
      color: "#dc2626",
    },
  });
  await db.task.createMany({
    data: [
      {
        userId: user.id,
        projectId: taxes.id,
        title: "Gather all bank statements",
        status: "TODO",
        priority: "URGENT",
        dueDate: subDays(today, 3),
      },
      { userId: user.id, projectId: taxes.id, title: "File with accountant", status: "TODO", priority: "HIGH", dueDate: addDays(today, 14) },
    ],
  });

  const relocation = await db.project.create({
    data: {
      userId: user.id,
      title: "Personal & Relocation",
      description: "Visa/residency admin and general life admin.",
      area: "OTHER",
      status: "ACTIVE",
      color: "#64748b",
    },
  });
  await db.task.createMany({
    data: [
      { userId: user.id, projectId: relocation.id, title: "License & insurance renewal", status: "TODO", priority: "MEDIUM" },
      { userId: user.id, projectId: relocation.id, title: "Passport renewal check", status: "TODO", priority: "LOW" },
    ],
  });

  // Standalone tasks not tied to a project.
  await db.task.createMany({
    data: [
      { userId: user.id, title: "Reply to unread emails across inboxes", status: "TODO", priority: "MEDIUM", dueDate: today },
      { userId: user.id, title: "Renew car registration", status: "TODO", priority: "MEDIUM", dueDate: subDays(today, 5) },
    ],
  });

  // --- Brain dump -------------------------------------------------------
  await db.brainDumpItem.createMany({
    data: [
      { userId: user.id, rawText: "Idea: consolidate all business inboxes into one weekly review", status: "PENDING" },
      { userId: user.id, rawText: "Call the accountant about Q3 estimated taxes", status: "PENDING" },
      {
        userId: user.id,
        rawText: "Note: HMI wholesale onboarding doc is out of date, needs a refresh",
        status: "CATEGORIZED",
        suggestedType: "NOTE",
        suggestedTitle: "Refresh HMI wholesale onboarding doc",
        aiRationale: "Reads like information to keep, not an immediate action.",
      },
    ],
  });

  // --- Contacts, journal, habits, health (light seed — flesh out via the app) ---
  const supplierContact = await db.contact.create({
    data: {
      userId: user.id,
      fullName: "Wholesale Supplier",
      relationship: "CLIENT",
      lastContactedAt: subDays(today, 4),
      nextFollowUpAt: addDays(today, 3),
      tags: ["hair-maiden-india", "wholesale"],
    },
  });
  await db.interaction.create({
    data: {
      userId: user.id,
      contactId: supplierContact.id,
      type: "MESSAGE",
      summary: "Discussed wholesale pricing tiers and next order timing.",
      occurredAt: subDays(today, 4),
    },
  });

  await db.journalEntry.create({
    data: {
      userId: user.id,
      entryDate: subDays(today, 1),
      title: "Good momentum",
      body: "Felt productive today — made progress across a few different businesses at once.",
      mood: 4,
    },
  });

  const habit = await db.habit.create({
    data: { userId: user.id, title: "Morning workout", area: "HEALTH", frequency: "DAILY", targetPerPeriod: 1, color: "#22c55e" },
  });
  await db.habitLog.createMany({
    data: [0, 1, 2].map((offset) => ({ userId: user.id, habitId: habit.id, logDate: subDays(today, offset) })),
  });

  await db.healthMetric.createMany({
    data: [
      { userId: user.id, type: "SLEEP_HOURS", value: 7.5, unit: "hours", recordedAt: subDays(today, 1) },
      { userId: user.id, type: "STEPS", value: 8200, unit: "steps", recordedAt: subDays(today, 1) },
    ],
  });

  console.log(`✅ Seeded demo data for ${user.email} (${user.id}).`);
  if (userId !== "00000000-0000-0000-0000-000000000001") {
    console.log(`   Log in with ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  }
  console.log("   Connect your real Google account under Integrations to pull in your actual task lists.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
