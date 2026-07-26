"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MadeToday } from "@/app/org/made-today";

interface ProjectLink {
  id: number;
  name: string;
  color: string | null;
}

interface Props {
  projects: ProjectLink[];
  energyMood: string;
  onChangeEnergy: () => void;
}

const energyBadge: Record<string, { label: string; color: string }> = {
  modo_supervivencia: { label: "Mínimo", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  regular: { label: "Regular", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  media_energia: { label: "Regular", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  hiperfoco: { label: "Hiperfoco", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

const navLinks = [
  { href: "/org", label: "Hoy", icon: "◉" },
  { href: "/org/todas", label: "Todas", icon: "☰" },
  { href: "/org/proyectos", label: "Proyectos", icon: "◐" },
];

export default function OrgSidebar({ projects, energyMood, onChangeEnergy }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-52 flex-shrink-0">
      <div className="sticky top-4 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-stone-100 tracking-tight">flux</h2>
          {energyBadge[energyMood] && (
            <span
              className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${energyBadge[energyMood].color}`}
            >
              {energyBadge[energyMood].label}
            </span>
          )}
        </div>

        <nav className="space-y-0.5">
          {navLinks.map((link) => {
            const active = link.href === "/org"
              ? pathname === "/org"
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-sm transition-colors ${
                  active
                    ? "bg-stone-800 text-stone-100 font-medium"
                    : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
                }`}
              >
                <span className="text-xs w-4 text-center">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {projects.length > 0 && (
          <div>
            <h3 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider px-3 mb-1.5">
              Proyectos
            </h3>
            <nav className="space-y-0.5">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/org/proyectos/${p.id}`}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-[6px] text-sm transition-colors ${
                    pathname === `/org/proyectos/${p.id}`
                      ? "bg-stone-800 text-stone-100 font-medium"
                      : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
                  }`}
                >
                  {p.color && (
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                  )}
                  <span className="truncate">{p.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}

        <MadeToday />

        <button
          onClick={onChangeEnergy}
          className="w-full text-xs text-stone-500 hover:text-stone-300 border border-stone-800 p-2.5 rounded-xl text-center transition-colors"
        >
          Reajustar Batería
        </button>
      </div>
    </aside>
  );
}
