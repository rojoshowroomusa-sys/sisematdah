import { getDailyState, getTodayTasksForEnergy, getTasks, resetDailyTasks, getProjects } from "@/lib/org-actions";
import { EnergyCheckIn } from "./energy-checkin";
import { OrgDashboard } from "./dashboard";

interface TaskRecord {
  id: number;
  title: string;
  energyLevel: string;
  status: string;
  estimatedMinutes: number | null;
  frictionScore: number | null;
  parentTaskId: number | null;
  subtasks: TaskRecord[];
  project: { id: number; name: string; color: string | null } | null;
}

export default async function OrgPage({
  searchParams,
}: {
  searchParams: Promise<{ energy?: string }>;
}) {
  const params = await searchParams;

  await resetDailyTasks();

  const today = await getDailyState(new Date());
  const rawMood = params.energy || today?.energyMood;
  const validMoods = ["modo_supervivencia", "media_energia", "hiperfoco", "regular", "cero_energia"];
  const energyMood = rawMood && validMoods.includes(rawMood) ? rawMood : null;

  if (!energyMood) {
    return <EnergyCheckIn />;
  }

  const tasks: TaskRecord[] = (await getTodayTasksForEnergy(energyMood)) as unknown as TaskRecord[];
  const allTasks: TaskRecord[] = (await getTasks({})) as unknown as TaskRecord[];
  const projects = await getProjects();

  return (
    <OrgDashboard
      energyMood={energyMood}
      projects={projects.map((p) => ({ id: p.id, name: p.name, color: p.color }))}
      tasks={tasks.map((t) => ({
        id: t.id,
        title: t.title,
        energyLevel: t.energyLevel,
        status: t.status,
        estimatedMinutes: t.estimatedMinutes,
        frictionScore: t.frictionScore,
        project: t.project ? { name: t.project.name, color: t.project.color } : null,
        subtasks: (t.subtasks || []).map((s) => ({
          id: s.id,
          title: s.title,
          status: s.status,
        })),
      }))}
      allTasks={allTasks.map((t) => ({
        id: t.id,
        title: t.title,
        energyLevel: t.energyLevel,
        status: t.status,
        estimatedMinutes: t.estimatedMinutes,
        project: t.project ? { name: t.project.name } : null,
      }))}
    />
  );
}
