import Link from "next/link";
import { format } from "date-fns";
import { Plug, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getGoogleConnections } from "@/server/data/integrations";
import { ImportTasksButton } from "@/components/integrations/import-tasks-button";
import { DisconnectButton } from "@/components/integrations/disconnect-button";
import { StatusToast } from "@/components/integrations/status-toast";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { connected, error } = await searchParams;
  const user = await requireUser();
  const connections = await getGoogleConnections(user.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <StatusToast connected={connected} error={error} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Connect the accounts you already use so Rocky OS can pull real data in.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plug className="h-4 w-4 text-primary" />
            Google Tasks
          </CardTitle>
          <Button size="sm" className="gap-1.5" nativeButton={false} render={<Link href="/api/integrations/google/authorize" />}>
            <Plus className="h-4 w-4" />
            Connect Google account
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Each Google account you connect can be imported once (or re-imported anytime) — every
            tasklist becomes a Project, every task and its subtasks come across, completed history
            included. Re-importing is safe and won&apos;t create duplicates.
          </p>
          {connections.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              No Google accounts connected yet.
            </p>
          ) : (
            <div className="flex flex-col divide-y">
              {connections.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm font-medium">{c.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.lastImportedAt
                        ? `Last imported ${format(new Date(c.lastImportedAt), "MMM d, yyyy · h:mm a")}`
                        : "Never imported"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ImportTasksButton connectionId={c.id} />
                    <DisconnectButton connectionId={c.id} email={c.email} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
