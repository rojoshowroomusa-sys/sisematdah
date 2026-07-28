import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/nav";
import Toast from "@/components/toast";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "flux - Presupuestos & Organización",
  description: "Sistema de gestión de presupuestos y organización personal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-canvas text-text-primary canvas-texture">
        <script dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.toggle("dark", localStorage.getItem("theme")==="dark"||(!localStorage.getItem("theme")&&matchMedia("(prefers-color-scheme:dark)").matches))`,
        }} />
        <Nav />
        <KeyboardShortcuts>
          <main className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-5 py-4 sm:py-7 animate-fade-in">
            {children}
          </main>
        </KeyboardShortcuts>
        <Toast />
      </body>
    </html>
  );
}
