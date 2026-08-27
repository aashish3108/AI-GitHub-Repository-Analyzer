import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoLens AI — Intelligent GitHub Repository Analyzer",
  description:
    "Get a professional health report for any public GitHub repository. AI-powered analysis of code quality, security, dependencies, documentation, and more.",
  keywords: [
    "GitHub",
    "repository",
    "analyzer",
    "code quality",
    "AI",
    "security",
    "code review",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
