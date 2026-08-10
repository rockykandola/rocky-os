# Rocky OS

A personal operating system for Rocky: one command center for every business, plus personal life
admin, instead of a Google Tasks list per business and a dozen open Gmail tabs.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4** + **shadcn/ui** (Base UI primitives) + Framer Motion
- **Supabase** — Postgres database + Auth
- **Prisma 7** (driver adapter: `@prisma/adapter-pg`) as the ORM
- **React Query** for client-side data
- **Vercel AI SDK** + OpenAI for brain-dump categorization and the daily planner coach

## What's built so far

- Full domain schema (`prisma/schema.prisma`): users, projects, milestones, tasks (with one level
  of subtasks + a free-text `assignee` for delegating to staff), notes, files, journal entries,
  habits, health metrics, contacts/CRM, brain dump, daily plans, notifications.
- Supabase email/password auth, session refresh via `src/proxy.ts` (Next 16 renamed
  `middleware.ts` → `proxy.ts`), protected route group at `src/app/(app)`.
- App shell: sidebar nav, ⌘K command palette / global search, quick capture (from anywhere).
- **Dashboard**: top 3 priorities (user-editable per day), today's schedule, overdue tasks.
- **Projects**: goals/areas, milestones, tasks + subtasks, notes, file attachments (Supabase
  Storage). Seeded with your real businesses (Hair Maiden India, Hair Virgin Raw, Rocky's Rentals
  LLC, and the rest) instead of placeholder demo content.
- **Tasks**: filterable list (today/overdue/upcoming/all/completed), inline + full create forms,
  nested subtasks matching how you actually break work down in Google Tasks.
- **Brain Dump**: quick capture anywhere → AI (or keyword-fallback) categorization → convert to
  task/project/note.
- **Daily Planner**: morning intention-setting + AI plan summary, evening reflection + AI review.
- **Integrations**: connect one or more Google accounts and pull every Google Tasks list in —
  each list becomes a Project, every task (including completed history and subtasks) comes across.
  Safe to re-run; it won't create duplicates. Same connection also grants Gmail access.
- **Gmail**: a read-only glance across every connected inbox — recent messages, unread state,
  snippet — click any message to open it in real Gmail. No sending/drafting (deliberately, given
  how many accounts you juggle — this is a triage view, not a replacement inbox).
- **Journal**: one entry per day, mood tracker, optional AI-generated reflection.
- **Habits**: a 7-day check-off grid per habit.
- **Contacts**: family/friends/clients with a logged interaction timeline per person.
- **Project Foundation**: protected reset dashboard with trip anchors, budget guardrails, and a persistent Cambodia/Myanmar/Vietnam vendor outreach pipeline.
- Seed script with realistic demo data across the whole schema.

Deliberately not built: WhatsApp and iMessage automation (neither has a workable API for a hosted
web app — capture from those manually via Quick Capture instead). Health tracker UI and
notifications center are the remaining next slice — schema's ready, UI isn't.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Create a project at [supabase.com](https://supabase.com) — it's just a signup, then from
**Project Settings**:

- **API**: copy the Project URL and `anon` public key, and the `service_role` secret key.
- **Database → Connection string**: copy the pooled connection string (port 6543) and the direct
  connection string (port 5432).
- **Storage**: create a bucket named `attachments` and make it **public** (used for project file
  uploads in this first slice).

### 3. Configure environment variables

Fill in `.env` (already scaffolded) with your real values:

```bash
DATABASE_URL="<pooled connection string>"
DIRECT_URL="<direct connection string>"
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon key>"
SUPABASE_SERVICE_ROLE_KEY="<service role key>"
OPENAI_API_KEY="<optional — enables AI categorization/planning>"
GOOGLE_CLIENT_ID="<optional — enables Google Tasks import, see below>"
GOOGLE_CLIENT_SECRET="<optional>"
```

`OPENAI_API_KEY` is optional: without it, Brain Dump falls back to keyword-based categorization
and the Planner shows a simple non-AI summary instead of failing. `GOOGLE_CLIENT_ID` /
`GOOGLE_CLIENT_SECRET` are optional too — without them, the Integrations page just tells you it's
not configured yet.

### 4. Push the schema and seed demo data

```bash
npm run db:push    # creates tables in your Supabase database
npm run db:seed     # creates your login + your real businesses as starter Projects
```

The seed script uses `SUPABASE_SERVICE_ROLE_KEY` to create your login:
**demo@rocky-os.app / RockyOS!2026** — change the password after your first login. If Supabase
env vars aren't set, it seeds data under a placeholder user id instead — sign up through the app
UI and re-run the seed once configured to attach real data to your login.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Project Foundation is available at [http://localhost:3000/project-foundation](http://localhost:3000/project-foundation). On first visit, click **Import 30 vendor leads** to copy the working vendor list into your Rocky OS account. Use the vendor table to filter by country, search leads, set outreach status, assign meeting priority, record meeting dates, and keep follow-up notes.

## Connecting Google Tasks + Gmail (optional, but this is the good part)

One Google OAuth connection covers both: it lets you import every Google Tasks list you currently
use — Hair Maiden India, HMI Website, HMI Ad's, Hubspot, Attentive, Yelp, Jumper Local SEO, Rockys
Rentals, Personal, Taxes, all of it — straight into Rocky OS with completed history and subtasks
included, and it grants read-only access so that account's inbox shows up under **Gmail**. You can
connect more than one Google account (you have several inboxes), and re-import anytime — it won't
duplicate anything.

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create a new project
   (top-left project picker → **New Project**). Any name is fine, e.g. "Rocky OS".
2. In the left sidebar: **APIs & Services → Library**, search **"Google Tasks API"**, click it,
   click **Enable**. Then search **"Gmail API"** and enable that too.
3. **APIs & Services → OAuth consent screen**: choose **External**, fill in an app name and your
   email, save through the steps. On the **Test users** step, add your own Google account email(s)
   — while the app is in "Testing" mode only test users can connect, which is exactly what you
   want since this is just for you.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs — add both:
     - `http://localhost:3000/api/integrations/google/callback` (for local dev)
     - `https://<your-deployed-domain>/api/integrations/google/callback` (once deployed — see below)
5. Copy the **Client ID** and **Client secret** it gives you into `.env` (and into Vercel's env
   vars once deployed) as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
6. In Rocky OS, go to **Integrations** in the sidebar → **Connect Google account** → sign in with
   whichever inbox owns the task lists you want → **Import tasks**. Repeat per Google account.

## Deploying (GitHub → Vercel)

Since you already push to GitHub: create a repo, push this project to it, then at
[vercel.com](https://vercel.com) click **Add New → Project**, import that GitHub repo, and paste
in the same environment variables from your `.env` file (Vercel's project settings has an
"Environment Variables" section — paste each one in). Set `NEXT_PUBLIC_APP_URL` to your real
Vercel URL once you have it. Every `git push` after that auto-deploys. Don't forget to add the
production callback URL (`https://your-app.vercel.app/api/integrations/google/callback`) to the
Google OAuth client's redirect URIs from step 4 above.

## Useful scripts

| Script              | Purpose                                      |
| -------------------- | --------------------------------------------- |
| `npm run dev`         | Start the dev server (Turbopack)              |
| `npm run build`       | Production build                              |
| `npm run db:push`     | Push the Prisma schema to your database       |
| `npm run db:migrate`  | Create/apply a versioned migration            |
| `npm run db:studio`   | Open Prisma Studio                            |
| `npm run db:seed`     | Seed demo data                                |
| `npm run lint`        | ESLint                                        |

## Notes on architecture

- **Data access** (`src/server/data/*`) is read-only, server-only query functions. **Actions**
  (`src/server/actions/*`) are `"use server"` mutations, each `requireUser()`-gated and scoped to
  `userId` on every query — Postgres RLS should be added on top of this before handling real user
  data, this app-layer scoping is not a substitute for it.
- Prisma 7 no longer reads `DATABASE_URL` from `schema.prisma` — the connection is wired through
  a `@prisma/adapter-pg` `Pool` in `src/lib/db.ts`, and `prisma.config.ts` supplies the URL to the
  CLI (migrate/studio) only.
- UI primitives come from shadcn's `base-nova` preset (Base UI, not Radix) — triggers compose via
  a `render={<Element/>}` prop instead of `asChild`.
- Google Tasks import is idempotent: every imported `Project`/`Task` carries
  `externalSource`/`externalId`, and re-import upserts by that pair rather than re-creating rows.
- Subtasks are just `Task` rows with a `parentTaskId`, one level deep — mirrors Google Tasks'
  own model so import maps directly onto it.
