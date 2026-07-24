import "server-only";
import { db } from "@/lib/db";

export async function getProjects(userId: string) {
  const projects = await db.project.findMany({
    where: { userId, status: { not: "ARCHIVED" } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { tasks: { where: { parentTaskId: null } } } },
      tasks: { where: { status: "DONE", parentTaskId: null }, select: { id: true } },
    },
  });

  return projects.map((p) => ({
    ...p,
    taskCount: p._count.tasks,
    doneCount: p.tasks.length,
  }));
}

export async function getProjectDetail(userId: string, id: string) {
  const project = await db.project.findUnique({
    where: { id, userId },
    include: {
      milestones: {
        orderBy: { sortOrder: "asc" },
        include: {
          tasks: {
            where: { parentTaskId: null },
            orderBy: [{ status: "asc" }, { sortOrder: "asc" }],
            include: { subtasks: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
      tasks: {
        where: { milestoneId: null, parentTaskId: null },
        orderBy: [{ status: "asc" }, { sortOrder: "asc" }],
        include: { subtasks: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!project) return null;

  const [notes, files] = await Promise.all([
    db.note.findMany({
      where: { userId, entityType: "PROJECT", entityId: id },
      orderBy: { createdAt: "desc" },
    }),
    db.fileAsset.findMany({
      where: { userId, entityType: "PROJECT", entityId: id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { ...project, notes, files };
}

export type ProjectListItem = Awaited<ReturnType<typeof getProjects>>[number];
export type ProjectDetail = NonNullable<Awaited<ReturnType<typeof getProjectDetail>>>;
