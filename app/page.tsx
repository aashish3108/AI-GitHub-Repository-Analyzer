"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { LogoIcon } from "@/components/icons";
import { validateRepositoryUrl } from "@/lib/validation";

const EXAMPLE_REPOS = [
  { owner: "vercel", repo: "next.js", label: "Next.js" },
  { owner: "facebook", repo: "react", label: "React" },
  { owner: "tailwindlabs", repo: "tailwindcss", label: "Tailwind CSS" },
  { owner: "openai", repo: "openai-python", label: "OpenAI Python" },
];

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = useCallback(
    async (repositoryUrl: string) => {
      setError(null);

      const validation = validateRepositoryUrl(repositoryUrl);
      if (!validation.valid) {
        setError(validation.error || "Invalid repository URL");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repositoryUrl }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to start analysis");
          setLoading(false);
          return;
        }

        router.push(`/analyze/${data.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
        setLoading(false);
      }
    },
    [router]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleAnalyze(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              AI-powered repository analysis
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
              Understand any GitHub
              <br />
              <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                repository in seconds
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-400">
              RepoLens AI performs a comprehensive analysis of any public GitHub
              repository — code quality, security, dependencies, documentation,
              and more — then generates a professional health report.
            </p>

            {/* URL Input */}
            <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-2xl">
              <div className="relative flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/40 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
                <div className="flex flex-1 items-center gap-3 px-2">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.28-.01-1.02-.02-2-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.08-.73.08-.73 1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.22.7.82.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
                  </svg>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="https://github.com/username/repository"
                    className="w-full border-0 bg-transparent p-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-white"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-60 sm:px-8"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="relative flex items-center gap-2">
                    {loading ? (
                      <>
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="opacity-25"
                          />
                          <path
                            d="M4 12a8 8 0 018-8"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze
                        <svg
                          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </div>

              {error && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </div>
              )}
            </form>

            {/* Example repositories */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-500">
                Try an example:
              </span>
              {EXAMPLE_REPOS.map((repo) => (
                <button
                  key={`${repo.owner}/${repo.repo}`}
                  onClick={() => handleAnalyze(`https://github.com/${repo.owner}/${repo.repo}`)}
                  disabled={loading}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-purple-700 dark:hover:bg-purple-950/40"
                >
                  {repo.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Everything you need to understand a codebase
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-400">
                Deep insights into any public repository, powered by AI and
                comprehensive static analysis.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 text-purple-600 dark:from-purple-500/20 dark:to-blue-500/20 dark:text-purple-400">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-slate-200 py-16 sm:py-24 dark:border-slate-800">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                How it works
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-400">
                Three simple steps to a comprehensive repository report.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title} className="relative">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold text-white shadow-lg shadow-purple-500/20">
                    {index + 1}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-slate-600 sm:flex-row dark:text-slate-400">
            <div className="flex items-center gap-2">
              <LogoIcon className="h-5 w-5" />
              <span>Built for developers, by developers.</span>
            </div>
            <div className="text-xs text-slate-500">
              Analyzes public repositories only · AI-powered insights
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

import type { ComponentType, SVGProps } from "react";

const FEATURES: Array<{
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}> = [
  {
    title: "Code Quality",
    description:
      "Evaluate organization, readability, maintainability, and more with a transparent 0-100 score.",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m18 16 4-4-4-4" /><path d="m6 8-4 4 4 4" /><path d="m14.5 4-5 16" />
      </svg>
    ),
  },
  {
    title: "Security Scanning",
    description:
      "Detect exposed secrets, unsafe configurations, and potential vulnerabilities with severity ratings.",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Dependency Analysis",
    description:
      "Identify dependencies, detect missing lockfiles, and spot suspicious dependency patterns.",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    title: "Architecture Detection",
    description:
      "Automatically identify frontend, backend, databases, and deployment technologies used.",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
      </svg>
    ),
  },
  {
    title: "Documentation Review",
    description:
      "Score your README, installation guide, and contribution docs with actionable improvements.",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: "AI-Powered Review",
    description:
      "Get an executive summary, strengths, weaknesses, and recommendations from an AI reviewer.",
    icon: (props) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 2v10l7-7" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    title: "Enter a repository URL",
    description:
      "Paste any public GitHub repository URL. We support the standard github.com/owner/repo format.",
  },
  {
    title: "We analyze everything",
    description:
      "RepoLens scans structure, code, dependencies, tests, security, and documentation in parallel.",
  },
  {
    title: "Get your report",
    description:
      "Receive a professional dashboard with scores, findings, and AI-generated recommendations.",
  },
];
