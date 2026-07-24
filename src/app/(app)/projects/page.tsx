import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { getProjects } from "@/server/data/projects";
import { AREA_LABEL } from "@/lib/area-format";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await getProjects(user.id);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">Goals, milestones, tasks, notes, and files — grouped.</p>
        </div>
        <ProjectFormDialog />
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <FolderKanban className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No projects yet. Create your first one to get organized.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const progress = project.taskCount > 0 ? Math.round((project.doneCount / project.taskCount) * 100) : 0;
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full transition-colors hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-snug">{project.title}</CardTitle>
                      {project.status !== "ACTIVE" && (
                        <Badge variant="secondary" className="shrink-0">
                          {project.status.replace("_", " ").toLowerCase()}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {project.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                    )}
                    <Badge variant="outline" className="w-fit text-[10px]">
                      {AREA_LABEL[project.area]}
                    </Badge>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {project.doneCount}/{project.taskCount} tasks
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
