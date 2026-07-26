"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";

export async function getProjects() {
  return prisma.project.findMany({
    where: { archived: false },
    orderBy: { name: "asc" },
    include: { _count: { select: { tasks: true } } },
  });
}

export async function getProject(id: number) {
  return prisma.project.findUnique({
    where: { id },
    include: { _count: { select: { tasks: true } } },
  });
}

export async function createProject(data: { name: string; color?: string }) {
  const project = await prisma.project.create({ data });
  revalidatePath("/org");
  return project;
}

export async function actualizarProyecto(id: number, data: { name?: string; color?: string; archived?: boolean }) {
  const project = await prisma.project.update({ where: { id }, data });
  revalidatePath("/org");
  return project;
}

export async function eliminarProyecto(id: number) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/org");
}

export async function getTasks(filters?: {
  status?: string;
  energyLevel?: string;
  projectId?: number;
  parentTaskId?: number | null;
}) {
  return prisma.task.findMany({
    where: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.energyLevel ? { energyLevel: filters.energyLevel } : {}),
      ...(filters?.projectId ? { projectId: filters.projectId } : {}),
      ...(filters?.parentTaskId !== undefined
        ? { parentTaskId: filters.parentTaskId }
        : { parentTaskId: null }),
    },
    include: { project: true, subtasks: true },
    orderBy: [{ stepOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getTask(id: number) {
  return prisma.task.findUnique({
    where: { id },
    include: { project: true, subtasks: { orderBy: { stepOrder: "asc" } }, parentTask: true },
  });
}

export async function createTask(data: {
  title: string;
  description?: string;
  energyLevel?: string;
  estimatedMinutes?: number;
  status?: string;
  projectId?: number;
  frictionScore?: number;
  parentTaskId?: number;
  stepOrder?: number;
}) {
  const task = await prisma.task.create({ data });
  revalidatePath("/org");
  return task;
}

export async function updateTask(id: number, data: {
  title?: string;
  description?: string;
  energyLevel?: string;
  estimatedMinutes?: number;
  status?: string;
  projectId?: number | null;
  frictionScore?: number;
  stepOrder?: number;
}) {
  const task = await prisma.task.update({ where: { id }, data });
  revalidatePath("/org");
  return task;
}

export async function deleteTask(id: number) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/org");
}

export async function getDailyState(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return prisma.dailyState.findFirst({
    where: { date: { gte: start, lte: end } },
  });
}

export async function setDailyState(data: {
  date: Date;
  energyMood: string;
  topPriorityId?: number;
}) {
  const start = new Date(data.date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(data.date);
  end.setHours(23, 59, 59, 999);

  const existing = await prisma.dailyState.findFirst({
    where: { date: { gte: start, lte: end } },
  });

  const state = existing
    ? await prisma.dailyState.update({
        where: { id: existing.id },
        data: { energyMood: data.energyMood, topPriorityId: data.topPriorityId },
      })
    : await prisma.dailyState.create({
        data: { date: start, energyMood: data.energyMood, topPriorityId: data.topPriorityId },
      });

  revalidatePath("/org");
  return state;
}

export async function getTodayTasksForEnergy(energyMood: string) {
  const allTasks = await prisma.task.findMany({
    where: { parentTaskId: null, status: { notIn: ["done", "archived"] } },
    include: { project: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  if (energyMood === "cero_energia" || energyMood === "modo_supervivencia") {
    const lowEnergy = allTasks.filter((t) => t.energyLevel === "cero_energia");
    const critical = allTasks.filter((t) => t.frictionScore && t.frictionScore <= 2);
    return (lowEnergy.length > 0 ? lowEnergy : critical).slice(0, 1);
  }

  if (energyMood === "media_energia" || energyMood === "regular") {
    const inbox = allTasks.filter((t) => t.status === "inbox");
    const nextUp = allTasks.filter((t) => t.status === "next_up");
    return [...nextUp, ...inbox].slice(0, 3);
  }

  return allTasks.slice(0, 10);
}

export async function quickCapture(title: string) {
  return createTask({ title, status: "inbox" });
}

export interface ResetResult {
  resetPerformed: boolean;
  tasksReturnedToInbox: number;
}

export async function resetDailyTasks(): Promise<ResetResult> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const existing = await prisma.dailyState.findFirst({
    where: { date: { gte: todayStart } },
  });

  if (existing) {
    return { resetPerformed: false, tasksReturnedToInbox: 0 };
  }

  const result = await prisma.task.updateMany({
    where: {
      status: { in: ["next_up", "in_progress"] },
      createdAt: { lt: todayStart },
    },
    data: { status: "inbox" },
  });

  await prisma.dailyState.create({
    data: { date: todayStart, energyMood: "pending" },
  });

  revalidatePath("/org");

  return {
    resetPerformed: true,
    tasksReturnedToInbox: result.count,
  };
}
