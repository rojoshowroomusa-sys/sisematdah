import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organización Personal",
  description: "Sistema de organización adaptativo para TDAH y depresión",
};

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-5 -mb-7 px-5 pb-7 min-h-[calc(100vh-3.5rem)] bg-stone-900 text-stone-100">
      <div className="max-w-2xl mx-auto pt-7">
        {children}
      </div>
    </div>
  );
}
