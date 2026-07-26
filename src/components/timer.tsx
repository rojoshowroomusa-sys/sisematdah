"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const presets = [
  { label: "5min", seconds: 300 },
  { label: "15min", seconds: 900 },
  { label: "25min", seconds: 1500 },
  { label: "45min", seconds: 2700 },
];

const STORAGE_KEY = "flux_timer_sessions";

function getSessions(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toISOString().split("T")[0];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return 0;
  const data = JSON.parse(stored);
  return data.date === today ? data.count : 0;
}

function addSession() {
  const today = new Date().toISOString().split("T")[0];
  const stored = localStorage.getItem(STORAGE_KEY);
  const prev = stored ? JSON.parse(stored) : {};
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ date: today, count: (prev.date === today ? prev.count : 0) + 1 })
  );
}

export default function Timer() {
  const [totalSeconds, setTotalSeconds] = useState(300);
  const [remaining, setRemaining] = useState(300);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setSessions(getSessions());
    audioRef.current = new Audio(
      "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQpvAICPAAAAAEhIWlqCgoqFf3xzbWxzd4GCgoSCfnp0b3B1fIGDgn99d3Jub3R3enx9fXx8fHx8fHt7e3p6enp6e3p7fHx8fHt7e3x8fH19fXx8fHx7e3t7fHx9fX5+fn5+fn5+fX18fHt7fHx9fX5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx7e3t7e3t7e3p6enp6enp6enp6enp6enp6enp6enp6enp5eXl5eXl5eXl5eXl5eXl5eXl4eHh4eHh4eHh3d3d3d3d3d3d3d3d3d3d3d3d3c3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3NzQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCgoKCgoKCgn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn4+Pj4+Pj49/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f38"
    );
    audioRef.current.volume = 0.3;
  }, []);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setDone(true);
            addSession();
            setSessions(getSessions());
            audioRef.current?.play().catch(() => {});
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, remaining]);

  const progress = totalSeconds > 0 ? 1 - remaining / totalSeconds : 0;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  function selectPreset(seconds: number) {
    setTotalSeconds(seconds);
    setRemaining(seconds);
    setRunning(false);
    setDone(false);
  }

  const toggleRunning = useCallback(() => {
    if (done) {
      setTotalSeconds(totalSeconds);
      setRemaining(totalSeconds);
      setDone(false);
      setRunning(true);
    } else {
      setRunning((r) => !r);
    }
  }, [done, totalSeconds]);

  return (
    <div className="bg-stone-800/60 border border-stone-700/30 rounded-[12px] p-4 flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="4" className="text-stone-700/50" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-teal-500 transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xl font-semibold text-stone-100 tracking-tight">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
          <span className="text-[10px] text-stone-500 font-medium mt-0.5">
            {done ? "Terminado" : running ? "En foco" : "Detenido"}
          </span>
        </div>
      </div>

      <div className="flex gap-1.5">
        {presets.map((p) => (
          <button
            key={p.seconds}
            onClick={() => selectPreset(p.seconds)}
            className={`text-[11px] font-medium px-2 py-1 rounded-[6px] transition-colors ${
              totalSeconds === p.seconds
                ? "bg-teal-600/20 text-teal-400 border border-teal-600/30"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-700/50 border border-transparent"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <button
        onClick={toggleRunning}
        className={`w-full py-2 rounded-[8px] text-sm font-medium transition-colors ${
          done
            ? "bg-teal-600 text-stone-950 hover:bg-teal-500"
            : running
            ? "bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-600/30"
            : "bg-teal-600/20 text-teal-400 hover:bg-teal-600/30 border border-teal-600/30"
        }`}
      >
        {done ? "Repetir" : running ? "Pausar" : "Iniciar"}
      </button>

      {sessions > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
          <span className="font-mono text-teal-500/60">{sessions}</span>
          <span>sesión{sessions !== 1 ? "es" : ""} hoy</span>
        </div>
      )}
    </div>
  );
}
