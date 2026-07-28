"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const modes = [
  { href: "/", label: "Taller", icon: "⚒" },
  { href: "/org", label: "Estudio", icon: "◫" },
] as const;

export function ModeSwitch() {
  const pathname = usePathname();
  const isOrg = pathname.startsWith("/org");
  const activeIndex = isOrg ? 1 : 0;

  return (
    <div
      className={`relative flex items-center rounded-[8px] p-0.5 transition-colors ${
        isOrg
          ? "bg-stone-800/80 ring-1 ring-stone-700/40"
          : "bg-black/5 dark:bg-white/10 ring-1 ring-border/60"
      }`}
    >
      <div
        className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-[6px] transition-all duration-250 ease-out"
        style={{
          left: activeIndex === 0 ? "2px" : "calc(50% + 0px)",
          backgroundColor: isOrg
            ? "var(--dark-accent)"
            : "var(--color-accent)",
        }}
      />
      {modes.map((mode, i) => (
        <Link
          key={mode.href}
          href={mode.href}
          className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[6px] transition-colors w-[70px] justify-center ${
            i === activeIndex
              ? "text-white"
              : isOrg
                ? "text-stone-400 hover:text-stone-200"
                : "text-text-tertiary hover:text-text-primary"
          }`}
        >
          <span className="text-[11px] opacity-70">{mode.icon}</span>
          <span className="tracking-tight">{mode.label}</span>
        </Link>
      ))}
    </div>
  );
}
