import { requireUser } from "@/lib/auth";
import { getTodaysPlans } from "@/server/data/daily-plan";
import { getCandidateTasksForTopThree } from "@/server/data/tasks";
import { MorningPlanForm } from "@/components/planner/morning-plan-form";
import { EveningReviewForm } from "@/components/planner/evening-review-form";

export default async function PlannerPage() {
  const user = await requireUser();
  const [{ morning, evening }, candidates] = await Promise.all([
    getTodaysPlans(user.id),
    getCandidateTasksForTopThree(user.id),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Daily Planner</h1>
        <p className="text-sm text-muted-foreground">Start with intention, end with reflection.</p>
      </div>

      <MorningPlanForm plan={morning} candidates={candidates} />
      <EveningReviewForm plan={evening} />
    </div>
  );
}
