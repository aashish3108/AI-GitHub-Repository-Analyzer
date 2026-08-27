"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { ScoreRing, getScoreLabel } from "@/components/ui/score-ring";
import type { AnalysisResult } from "@/lib/types";

interface AnalysisStatus {
  id: string;
  status: "pending" | "analyzing" | "completed" | "failed";
  progress: number;
  progressMessage: string;
  errorMessage: string | null;
  result: AnalysisResult | null;
}

const PROGRESS_STAGES = [
  { icon: "🔗", label: "Connecting to GitHub" },
  { icon: "📦", label: "Fetching repository metadata" },
  { icon: "🗂️", label: "Analyzing structure" },
  { icon: "🔍", label: "Inspecting code quality" },
  { icon: "🛡️", label: "Running security checks" },
  { icon: "📚", label: "Analyzing dependencies" },
  { icon: "📖", label: "Reviewing documentation" },
  { icon: "🧪", label: "Checking tests" },
  { icon: "🤖", label: "Generating AI review" },
  { icon: "✨", label: "Finalizing report" },
];

export default function AnalyzePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<AnalysisStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/analyze?id=${encodeURIComponent(id)}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load analysis");
        }
        const json: AnalysisStatus = await res.json();
        if (!cancelled) {
          setData(json);
          if (json.status === "completed" || json.status === "failed") {
            return;
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Network error");
        }
      }

      if (!cancelled) {
        setTimeout(poll, 1200);
      }
    };

    void poll();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center dark:border-red-900/50 dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
              Analysis failed
            </h2>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              {error}
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Back to home
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-center">
              <svg className="h-8 w-8 animate-spin text-purple-600" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (data.status !== "completed") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 sm:py-20">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40 sm:p-12 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                <svg className="h-8 w-8 animate-pulse text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Analyzing repository
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {data.progressMessage || "Working..."}
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
                <span>Progress</span>
                <span>{data.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${data.progress}%` }}
                />
              </div>
            </div>

            {/* Stages */}
            <div className="space-y-2">
              {PROGRESS_STAGES.map((stage, index) => {
                const stagePercentage = (index + 1) * 10;
                const isComplete = data.progress >= stagePercentage;
                const isActive =
                  !isComplete && data.progress >= index * 10;
                const isPending = !isComplete && !isActive;

                return (
                  <div
                    key={stage.label}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                      isComplete
                        ? "text-emerald-700 dark:text-emerald-400"
                        : isActive
                        ? "text-purple-700 dark:text-purple-400"
                        : "text-slate-400 dark:text-slate-600"
                    }`}
                  >
                    <span className="text-base">{stage.icon}</span>
                    <span className="flex-1">{stage.label}</span>
                    {isComplete && (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {isActive && (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    )}
                    {isPending && (
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-40" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (data.status === "completed" && data.result) {
    return <Dashboard result={data.result} />;
  }

  return null;
}

function Dashboard({ result }: { result: AnalysisResult }) {
  const router = useRouter();
  const { repository, structure, codeQuality, security, dependencies, readme, testing, aiReview, overallScore, scoreBreakdown } = result;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        {/* Repository Header */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.28-.01-1.02-.02-2-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.08-.73.08-.73 1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.22.7.82.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
                </svg>
                <span>{repository.owner}</span>
                <span>/</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {repository.name}
                </span>
                {repository.license && (
                  <span className="ml-2 rounded-full border border-slate-200 px-2 py-0.5 text-xs dark:border-slate-700">
                    {repository.license}
                  </span>
                )}
              </div>
              <p className="mt-3 text-base text-slate-700 dark:text-slate-300">
                {repository.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                {repository.mainLanguage && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-blue-500" />
                    {repository.mainLanguage}
                  </span>
                )}
                <Stat icon="⭐" value={formatNumber(repository.stars)} label="stars" />
                <Stat icon="🔱" value={formatNumber(repository.forks)} label="forks" />
                <Stat icon="👁️" value={formatNumber(repository.watchers)} label="watchers" />
                <Stat icon="🐛" value={formatNumber(repository.openIssues)} label="issues" />
              </div>
              {repository.topics.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {repository.topics.slice(0, 10).map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <ScoreRing score={overallScore} label={getScoreLabel(overallScore)} />
              <a
                href={repository.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                View on GitHub
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M7 7h10v10" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Score Overview Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreCard title="Code Quality" score={codeQuality.score} color="blue" />
          <ScoreCard title="Security" score={security.score} color="emerald" />
          <ScoreCard title="Documentation" score={readme.score} color="amber" />
          <ScoreCard title="Testing" score={testing.score} color="purple" />
        </div>

        {/* Score Breakdown */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
            Score Breakdown
          </h2>
          <div className="space-y-4">
            {Object.entries(scoreBreakdown).map(([key, value]) => (
              <div key={key}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium capitalize text-slate-700 dark:text-slate-300">
                    {formatScoreKey(key)}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {value}/100
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture */}
        <Section title="Architecture & Structure">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard label="Architecture" value={structure.architecture} />
            <InfoCard label="Total Files" value={String(structure.files.length)} />
            <InfoCard
              label="Languages"
              value={`${Object.keys(structure.languages).length} detected`}
            />
          </div>

          {structure.detectedTechnologies.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Detected Technologies
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {structure.detectedTechnologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 px-3 py-1 text-xs font-medium text-purple-700 dark:text-purple-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {Object.keys(structure.languages).length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Languages by Size
              </h3>
              <div className="space-y-2">
                {Object.entries(structure.languages)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([lang, size]) => {
                    const total = Object.values(structure.languages).reduce((a, b) => a + b, 0);
                    const percent = (size / total) * 100;
                    return (
                      <div key={lang}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {lang}
                          </span>
                          <span className="text-slate-500">{percent.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </Section>

        {/* Code Quality */}
        <Section title="Code Quality Analysis">
          <div className="mb-4 flex items-start gap-4">
            <ScoreRing score={codeQuality.score} size={90} strokeWidth={8} />
            <div className="flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Overall code quality based on organization, readability, maintainability, and documentation.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SubScore label="Organization" score={codeQuality.organization} />
            <SubScore label="Readability" score={codeQuality.readability} />
            <SubScore label="Maintainability" score={codeQuality.maintainability} />
            <SubScore label="Error Handling" score={codeQuality.errorHandling} />
            <SubScore label="Modularity" score={codeQuality.modularity} />
            <SubScore label="Documentation" score={codeQuality.documentation} />
          </div>
          {codeQuality.explanations.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
              {codeQuality.explanations.map((exp, i) => (
                <li key={i}>{exp}</li>
              ))}
            </ul>
          )}
        </Section>

        {/* Security */}
        <Section title="Security Analysis">
          <div className="mb-4 flex items-start gap-4">
            <ScoreRing score={security.score} size={90} strokeWidth={8} />
            <p className="flex-1 text-sm text-slate-600 dark:text-slate-400">
              {security.findings.length === 0
                ? "No major security issues detected in the sampled files."
                : `Found ${security.findings.length} potential security ${security.findings.length === 1 ? "finding" : "findings"}.`}
            </p>
          </div>
          {security.findings.length > 0 ? (
            <div className="space-y-2">
              {security.findings.map((finding, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <SeverityBadge severity={finding.severity} />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {finding.title}
                    </h4>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {finding.description}
                    </p>
                    {finding.file && (
                      <p className="mt-1 text-xs font-mono text-slate-500">
                        {finding.file}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                      <span className="font-medium">Recommendation:</span>{" "}
                      {finding.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
              ✓ No obvious security issues detected in the scanned files.
            </div>
          )}
        </Section>

        {/* Dependencies */}
        <Section title="Dependencies">
          <div className="grid gap-4 sm:grid-cols-3">
            <InfoCard
              label="Package Manager"
              value={dependencies.packageManager || "Unknown"}
            />
            <InfoCard
              label="Total Dependencies"
              value={String(dependencies.totalDependencies)}
            />
            <InfoCard
              label="Lockfile"
              value={dependencies.hasLockfile ? "Present ✓" : "Missing ✗"}
            />
          </div>
          {dependencies.recommendations.length > 0 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900/50 dark:bg-amber-950/30">
              <h4 className="mb-2 font-semibold text-amber-900 dark:text-amber-300">
                Recommendations
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-amber-800 dark:text-amber-400">
                {dependencies.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        {/* Documentation */}
        <Section title="Documentation (README)">
          <div className="mb-4 flex items-start gap-4">
            <ScoreRing score={readme.score} size={90} strokeWidth={8} />
            <div className="flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                README quality based on presence of key sections.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <CheckItem label="Description" checked={readme.hasDescription} />
                <CheckItem label="Installation" checked={readme.hasInstallation} />
                <CheckItem label="Usage" checked={readme.hasUsage} />
                <CheckItem label="Features" checked={readme.hasFeatures} />
                <CheckItem label="Screenshots" checked={readme.hasScreenshots} />
                <CheckItem label="Configuration" checked={readme.hasConfiguration} />
                <CheckItem label="Contributing" checked={readme.hasContributing} />
                <CheckItem label="License" checked={readme.hasLicense} />
              </div>
            </div>
          </div>
          {readme.recommendations.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/50">
              <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">
                Improvement suggestions
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-300">
                {readme.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        {/* Testing */}
        <Section title="Testing">
          <div className="mb-4 flex items-start gap-4">
            <ScoreRing score={testing.score} size={90} strokeWidth={8} />
            <div className="flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Test coverage and testing infrastructure.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge active={testing.hasUnitTests} label="Unit Tests" />
                <Badge active={testing.hasIntegrationTests} label="Integration Tests" />
                <Badge active={testing.hasE2ETests} label="E2E Tests" />
                <Badge active={testing.hasCI} label="CI/CD" />
              </div>
              {testing.testingFrameworks.length > 0 && (
                <p className="mt-3 text-xs text-slate-500">
                  Frameworks: {testing.testingFrameworks.join(", ")}
                </p>
              )}
            </div>
          </div>
          {testing.recommendations.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/50">
              <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">
                Recommendations
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-300">
                {testing.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        {/* AI Review */}
        <Section title="AI Review">
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Executive Summary
              </h3>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {aiReview.executiveSummary}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Strengths
                </h3>
                <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                  {aiReview.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-500">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Weaknesses
                </h3>
                <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                  {aiReview.weaknesses.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-red-500">!</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Technical Recommendations
              </h3>
              <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                {aiReview.technicalRecommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-semibold text-blue-500">{i + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <LongCard title="Architecture Review" content={aiReview.architectureReview} />
              <LongCard title="Developer Experience" content={aiReview.developerExperience} />
              <LongCard title="Production Readiness" content={aiReview.productionReadiness} />
            </div>
          </div>
        </Section>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Analyze another repository?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Try a different GitHub repository to get a new analysis.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            Back to home
          </button>
        </div>
      </main>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span>{icon}</span>
      <span className="font-semibold text-slate-900 dark:text-white">{value}</span>
      <span>{label}</span>
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ScoreCard({
  title,
  score,
  color,
}: {
  title: string;
  score: number;
  color: "blue" | "emerald" | "amber" | "purple";
}) {
  const colorMap = {
    blue: "from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400",
    emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    amber: "from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400",
    purple: "from-purple-500/10 to-purple-500/5 text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className={`mb-3 inline-flex rounded-lg bg-gradient-to-br ${colorMap[color]} p-2`}>
        <span className="text-2xl font-bold">{Math.round(score)}</span>
      </div>
      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
        {title}
      </h3>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function SubScore({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {label}
        </span>
        <span className="text-sm font-bold text-slate-900 dark:text-white">
          {score}
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colorMap: Record<string, string> = {
    critical: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/50",
    high: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900/50",
    medium: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/50",
    low: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/50",
    informational: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  };

  return (
    <span className={`inline-flex h-fit flex-shrink-0 rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${colorMap[severity] || colorMap.informational}`}>
      {severity}
    </span>
  );
}

function CheckItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${checked ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500"}`}>
      <span>{checked ? "✓" : "✗"}</span>
      <span>{label}</span>
    </div>
  );
}

function Badge({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500"}`}>
      <span>{active ? "✓" : "—"}</span>
      {label}
    </span>
  );
}

function LongCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
        {title}
      </h4>
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {content}
      </p>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatScoreKey(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}
