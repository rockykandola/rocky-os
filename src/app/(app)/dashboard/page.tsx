import Link from "next/link";
import { CalendarClock, AlertTriangle, Target, Users, Cake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import {
  getTopThreeTasks,
  getTasksDueToday,
  getOverdueTasks,
  getCandidateTasksForTopThree,
} from "@/server/data/tasks";
import { getClientAttentionInsights } from "@/server/data/contacts";
import { TaskItem } from "@/components/tasks/task-item";
import { TopThreePicker } from "@/components/dashboard/top-three-picker";

function daysSince(date: Date) {
  return Math.round((Date.now() - date.getTime()) / 86_400_000);
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [topThree, dueToday, overdue, candidates, clientAttention] = await Promise.all([
    getTopThreeTasks(user.id),
    getTasksDueToday(user.id),
    getOverdueTasks(user.id),
    getCandidateTasksForTopThree(user.id),
    getClientAttentionInsights(user.id),
  ]);

  const greetingName = user.fullName?.split(" ")[0] || "there";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hey {greetingName} 👋</h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what matters today, {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" />
            Top 3 priorities
          </CardTitle>
          <TopThreePicker
            candidates={candidates}
            initialSelectedIds={topThree.map((t) => t.id)}
          />
        </CardHeader>
        <CardContent>
          {topThree.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              Nothing set for today. Click the pencil to choose your top 3.
            </p>
          ) : (
            <div className="flex flex-col divide-y">
              {topThree.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="h-4 w-4 text-primary" />
              Today&apos;s schedule
              {dueToday.length > 0 && <Badge variant="secondary">{dueToday.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dueToday.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">Nothing due today. Enjoy the breathing room.</p>
            ) : (
              <div className="flex flex-col divide-y">
                {dueToday.map((task) => (
                  <TaskItem key={task.id} task={task} dense />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={overdue.length > 0 ? "border-destructive/40" : undefined}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Overdue
              {overdue.length > 0 && <Badge variant="destructive">{overdue.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdue.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">You&apos;re all caught up.</p>
            ) : (
              <div className="flex flex-col divide-y">
                {overdue.map((task) => (
                  <TaskItem key={task.id} task={task} dense />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(clientAttention.goingCold.length > 0 || clientAttention.upcomingBirthdays.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          {clientAttention.goingCold.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-primary" />
                  Clients going quiet
                  <Badge variant="secondary">{clientAttention.goingCold.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col divide-y">
                  {clientAttention.goingCold.map((c) => (
                    <Link
                      key={c.id}
                      href={`/contacts/${c.id}`}
                      className="flex items-center justify-between gap-2 py-2.5 text-sm hover:text-primary"
                    >
                      <span className="truncate font-medium">{c.fullName}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {daysSince(c.lastPurchase)}d since last purchase
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {clientAttention.upcomingBirthdays.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Cake className="h-4 w-4 text-primary" />
                  Birthdays coming up
                  <Badge variant="secondary">{clientAttention.upcomingBirthdays.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col divide-y">
                  {clientAttention.upcomingBirthdays.map((c) => (
                    <Link
                      key={c.id}
                      href={`/contacts/${c.id}`}
                      className="flex items-center justify-between gap-2 py-2.5 text-sm hover:text-primary"
                    >
                      <span className="truncate font-medium">{c.fullName}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {c.daysUntil === 0 ? "Today" : c.daysUntil === 1 ? "Tomorrow" : `In ${c.daysUntil}d`}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        <span>Got something on your mind? Use Quick Capture in the top bar, then sort it in Brain Dump.</span>
        <Link href="/brain-dump" className="font-medium text-foreground underline underline-offset-4">
          Open Brain Dump
        </Link>
      </div>
    </div>
  );
}
