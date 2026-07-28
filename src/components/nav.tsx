"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GlobalSearch } from "./global-search";
import { ThemeToggle } from "./theme-toggle";
import { ModeSwitch } from "./mode-switch";

const links = [
  { href: "/", label: "Presupuestos" },
  { href: "/facturas", label: "Facturas" },
  { href: "/clientes", label: "Clientes" },
  { href: "/productos", label: "Productos" },
  { href: "/agenda", label: "Agenda" },
];

export default function Nav() {
  const pathname = usePathname();
  const isOrg = pathname.startsWith("/org");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className={`border-b transition-colors ${
        isOrg
          ? "border-stone-700/40 bg-stone-900"
          : "border-border bg-panel canvas-texture"
      }`}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-5 flex items-center h-14 gap-2">
        <Link
          href={isOrg ? "/org" : "/"}
          className={`font-semibold text-sm sm:text-base mr-1 sm:mr-3 flex-shrink-0 tracking-tight ${
            isOrg ? "text-stone-200" : "text-text-primary"
          }`}
        >
          <span className="hidden sm:inline">flux</span>
          <span className="sm:hidden">f</span>
        </Link>

        <ModeSwitch />

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`sm:hidden p-2 rounded-[6px] transition-colors ${
            isOrg
              ? "text-stone-400 hover:bg-stone-800"
              : "text-text-secondary hover:bg-surface-alt"
          }`}
          aria-label="Menú"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div className={`${menuOpen ? "flex" : "hidden"} sm:flex absolute sm:static top-14 left-0 right-0 z-50 flex-col sm:flex-row p-3 sm:p-0 gap-1 border-b sm:border-b-0 shadow-elevated sm:shadow-none ${isOrg ? "bg-stone-900 border-stone-700/50" : "bg-panel sm:bg-transparent border-border"}`}>
          {isOrg ? (
            <>
              <OrgNavLink href="/org" active={pathname === "/org"} onClick={() => setMenuOpen(false)}>
                Hoy
              </OrgNavLink>
              <OrgNavLink href="/org/todas" active={pathname === "/org/todas"} onClick={() => setMenuOpen(false)}>
                Todas
              </OrgNavLink>
              <OrgNavLink href="/org/proyectos" active={pathname.startsWith("/org/proyectos")} onClick={() => setMenuOpen(false)}>
                Proyectos
              </OrgNavLink>
            </>
          ) : (
            links.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                active={
                  link.href === "/"
                    ? pathname === "/" || pathname.startsWith("/presupuestos")
                    : pathname.startsWith(link.href)
                }
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <GlobalSearch />
          <ThemeToggle />
          {!isOrg && (
            <Link
              href="/presupuestos/nuevo"
              className="text-xs font-medium bg-accent text-white px-3 py-1.5 rounded-[6px] hover:bg-accent-hover transition-colors tracking-tight hidden sm:inline-flex items-center gap-1"
            >
              <span className="text-[11px] opacity-80">+</span>
              <span>Nuevo</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-sm px-3 py-2 sm:py-1.5 rounded-[6px] transition-colors ${
        active
          ? "bg-surface text-text-primary font-medium shadow-card"
          : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
      }`}
    >
      {children}
    </Link>
  );
}

function OrgNavLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-sm px-3 py-2 sm:py-1.5 rounded-[6px] transition-colors ${
        active
          ? "bg-stone-800 text-stone-100 font-medium"
          : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
      }`}
    >
      {children}
    </Link>
  );
}
