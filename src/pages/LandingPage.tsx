import React, { useEffect, useState } from 'react';
import { Terminal, Shield, Trophy, Code2, Zap, ArrowRight, CheckCircle2, Play, Users, Clock, Sparkles } from 'lucide-react';
import { Problem, Contest, Submission } from '../types';
import { api } from '../lib/api';

interface LandingPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [dailyProblem, setDailyProblem] = useState<Problem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [probsRes, contestsRes, subsRes] = await Promise.all([
          api.getProblems({ limit: 10 }),
          api.getContests(),
          api.getSubmissions({ limit: 6 })
        ]);
        setProblems(probsRes.problems);
        setDailyProblem(probsRes.problems[0] || null);
        setContests(contestsRes);
        setRecentSubmissions(subsRes);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      }
    };
    fetchData();
  }, []);

  const liveContest = contests.find(c => c.status === 'LIVE') || contests[0];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/60 text-xs font-mono text-indigo-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>APEX JUDGE ENGINE V3.4 • SANDBOX ACTIVE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
                Master Algorithms with{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Sub-Millisecond
                </span>{' '}
                Online Judging
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Engineered for serious competitive programmers and system design interview preparation.
                Features real-time queue orchestration, isolated execution sandbox, and authentic verification across 4 core languages.
              </p>

              {/* Action CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  id="hero-explore-problems-btn"
                  onClick={() => onNavigate('problems')}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Code2 className="w-4 h-4" />
                  <span>Solve Problems</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {dailyProblem && (
                  <button
                    id="hero-daily-challenge-btn"
                    onClick={() => onNavigate('problem', dailyProblem.slug)}
                    className="px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Daily Challenge: {dailyProblem.title}</span>
                  </button>
                )}
              </div>

              {/* Live Platform Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
                <div>
                  <p className="text-2xl font-bold text-white font-mono">20+</p>
                  <p className="text-xs text-slate-400">Curated Problems</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400 font-mono">&lt; 50ms</p>
                  <p className="text-xs text-slate-400">Average Judge Latency</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-400 font-mono">4</p>
                  <p className="text-xs text-slate-400">Languages (Py, JS, Java, C++)</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Card: Daily Challenge Preview */}
            <div className="lg:col-span-5">
              {dailyProblem ? (
                <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      PROBLEM OF THE DAY
                    </span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded font-semibold ${
                      dailyProblem.difficulty === 'EASY'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                        : dailyProblem.difficulty === 'MEDIUM'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                        : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                    }`}>
                      {dailyProblem.difficulty}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{dailyProblem.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {dailyProblem.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dailyProblem.tags.map(t => (
                      <span key={t} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Acceptance: {dailyProblem.acceptanceRate}%</span>
                    <span>Time Limit: {dailyProblem.timeLimitMs}ms</span>
                  </div>

                  <button
                    id="daily-problem-solve-now"
                    onClick={() => onNavigate('problem', dailyProblem.slug)}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Open in Judge IDE</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Live Contest Highlight */}
      {liveContest && (
        <section className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 border border-indigo-800/40 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Trophy className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      {liveContest.status === 'LIVE' ? 'ACTIVE COMPETITION RUNNING' : 'FEATURED CONTEST'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">{liveContest.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">{liveContest.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  id="landing-enter-contest-btn"
                  onClick={() => onNavigate('contest-details', liveContest.id)}
                  className="w-full md:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Enter Contest Scoreboard</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Core Architecture Pillars */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-white">Built for Production Rigor</h2>
          <p className="text-sm text-slate-400 mt-1">
            Engineered using asynchronous queue architecture and strict sandbox containment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-800/60 flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Asynchronous Redis Queue</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Submissions are decoupled from API latency. The backend enqueues code tasks immediately and pushes live status events (`QUEUED` → `COMPILING` → `RUNNING` → `JUDGING`).
            </p>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Zero-Trust Docker Sandbox</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Untrusted code runs in isolated containers without root privileges, no internet access, strict RAM limits, CPU cgroups, and read-only filesystems.
            </p>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Integrated Monaco IDE</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full VS Code editor capabilities with syntax highlighting, auto-indentation, local draft persistence, custom test case execution, and side-by-side diffing.
            </p>
          </div>
        </div>
      </section>

      {/* Live Submissions Feed */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Real-Time Judge Stream</h2>
          </div>
          <button
            onClick={() => onNavigate('submissions')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-[#111827]/80 border border-slate-800/90 rounded-xl p-4 flex items-center justify-between text-xs"
            >
              <div className="space-y-1 truncate pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white truncate">{sub.problemTitle}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                    {sub.language}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  by <strong className="text-slate-300 font-medium">{sub.username}</strong>
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                  sub.verdict === 'ACCEPTED'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                    : sub.verdict === 'WRONG_ANSWER'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800/50'
                    : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                }`}>
                  {sub.verdict}
                </span>
                {sub.runtimeMs > 0 && (
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{sub.runtimeMs}ms</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
