import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/lib/auth";
import { getProjectDetail } from "@/server/data/projects";
import { AREA_LABEL } from "@/lib/area-format";
import { MilestoneCard } from "@/components/projects/milestone-card";
import { AddMilestoneInline } from "@/components/projects/add-milestone-inline";
import { AddTaskInline } from "@/components/tasks/add-task-inline";
import { TaskItem } from "@/components/tasks/task-item";
import { ProjectNotes } from "@/components/projects/project-notes";
import { ProjectFiles } from "@/components/projects/project-files";
import { ProjectActions } from "@/components/projects/project-actions";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await getProjectDetail(user.id, id);
  if (!project) notFound();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {AREA_LABEL[project.area]}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {project.status.replace("_", " ").toLowerCase()}
            </Badge>
            {project.targetDate && (
              <span className="text-xs text-muted-foreground">Target {format(new Date(project.targetDate), "MMM d, yyyy")}</span>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
          {project.description && <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>}
        </div>
        <ProjectActions projectId={project.id} status={project.status} />
      </div>

      <Tabs defaultValue="work">
        <TabsList>
          <TabsTrigger value="work">Milestones & Tasks</TabsTrigger>
          <TabsTrigger value="notes">Notes ({project.notes.length})</TabsTrigger>
          <TabsTrigger value="files">Files ({project.files.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="work" className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {project.milestones.map((milestone) => (
              <MilestoneCard key={milestone.id} milestone={milestone} projectId={project.id} />
            ))}
            <div className="rounded-lg border border-dashed p-3">
              <AddMilestoneInline projectId={project.id} />
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">Other tasks</h3>
            <div className="rounded-lg border p-3">
              <div className="flex flex-col divide-y">
                {project.tasks.map((task) => (
                  <TaskItem key={task.id} task={{ ...task, project: null }} dense showSubtaskAdd />
                ))}
              </div>
              <div className="mt-1">
                <AddTaskInline projectId={project.id} placeholder="Add a task to this project…" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <ProjectNotes projectId={project.id} notes={project.notes} />
        </TabsContent>

        <TabsContent value="files">
          <ProjectFiles projectId={project.id} userId={user.id} files={project.files} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
