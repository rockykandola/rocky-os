import "server-only";
import { db } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";

const OPEN_STATUSES = ["TODO", "IN_PROGRESS"] as const;

const TASK_INCLUDE = {
  project: { select: { id: true, title: true, color: true } },
  subtasks: { orderBy: { sortOrder: "asc" as const } },
};

export function startOfToday() {
  return startOfDay(new Date());
}

export async function getTopThreeTasks(userId: string, date = startOfToday()) {
  return db.task.findMany({
    where: { userId, isTopThree: true, topThreeDate: date, status: { in: [...OPEN_STATUSES] } },
    include: TASK_INCLUDE,
    orderBy: { sortOrder: "asc" },
  });
}

export async function getTasksDueToday(userId: string, date = startOfToday()) {
  return db.task.findMany({
    where: {
      userId,
      parentTaskId: null,
      status: { in: [...OPEN_STATUSES] },
      dueDate: { gte: startOfDay(date), lte: endOfDay(date) },
    },
    include: TASK_INCLUDE,
    orderBy: { dueDate: "asc" },
  });
}

export async function getOverdueTasks(userId: string, date = startOfToday()) {
  return db.task.findMany({
    where: {
      userId,
      parentTaskId: null,
      status: { in: [...OPEN_STATUSES] },
      dueDate: { lt: startOfDay(date) },
    },
    include: TASK_INCLUDE,
    orderBy: { dueDate: "asc" },
  });
}

export async function getCandidateTasksForTopThree(userId: string, date = startOfToday()) {
  return db.task.findMany({
    where: {
      userId,
      parentTaskId: null,
      status: { in: [...OPEN_STATUSES] },
      OR: [{ dueDate: { lte: endOfDay(date) } }, { isTopThree: true, topThreeDate: date }],
    },
    include: TASK_INCLUDE,
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    take: 20,
  });
}

export type TaskWithProject = Awaited<ReturnType<typeof getTasksDueToday>>[number];

export type TaskFilter = "today" | "overdue" | "upcoming" | "all" | "completed";

export async function getTasks(userId: string, filter: TaskFilter, date = startOfToday()) {
  switch (filter) {
    case "today":
      return db.task.findMany({
        where: {
          userId,
          parentTaskId: null,
          status: { in: [...OPEN_STATUSES] },
          dueDate: { gte: startOfDay(date), lte: endOfDay(date) },
        },
        include: TASK_INCLUDE,
        orderBy: [{ priority: "desc" }, { sortOrder: "asc" }],
      });
    case "overdue":
      return db.task.findMany({
        where: {
          userId,
          parentTaskId: null,
          status: { in: [...OPEN_STATUSES] },
          dueDate: { lt: startOfDay(date) },
        },
        include: TASK_INCLUDE,
        orderBy: { dueDate: "asc" },
      });
    case "upcoming":
      return db.task.findMany({
        where: {
          userId,
          parentTaskId: null,
          status: { in: [...OPEN_STATUSES] },
          dueDate: { gt: endOfDay(date) },
        },
        include: TASK_INCLUDE,
        orderBy: { dueDate: "asc" },
      });
    case "completed":
      return db.task.findMany({
        where: { userId, parentTaskId: null, status: "DONE" },
        include: TASK_INCLUDE,
        orderBy: { completedAt: "desc" },
        take: 100,
      });
    case "all":
    default:
      return db.task.findMany({
        where: { userId, parentTaskId: null, status: { not: "CANCELED" } },
        include: TASK_INCLUDE,
        orderBy: [{ status: "asc" }, { priority: "desc" }, { sortOrder: "asc" }],
      });
  }
}
