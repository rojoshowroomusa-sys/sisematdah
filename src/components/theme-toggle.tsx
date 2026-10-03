"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  // Aplica el tema y fija la clase opuesta, de modo que el bloque
  // `@media (prefers-color-scheme: dark)` de globals.css (guardado con
  // `html:not(.light)`) no pise una elección explícita de tema claro.
  function applyTheme(next: boolean) {
    const el = document.documentElement;
    el.classList.toggle("dark", next);
    el.classList.toggle("light", !next);
  }

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    applyTheme(isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    applyTheme(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      className="text-xs text-text-tertiary hover:text-text-secondary border border-border rounded-[6px] px-2 py-1.5 transition-colors"
      title={dark ? "Modo claro" : "Modo oscuro"}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
