import React, { useEffect, useState } from 'react';
import { Code2, ArrowRight, CheckCircle2, Play, BookOpen, Clock, Tag } from 'lucide-react';
import { Problem, Submission } from '../types';
import { api } from '../lib/api';

interface LandingPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [featuredProblem, setFeaturedProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [probsRes, subsRes] = await Promise.all([
          api.getProblems({ limit: 8 }),
          api.getSubmissions({ limit: 5 })
        ]);
        setProblems(probsRes.problems);
        setFeaturedProblem(probsRes.problems[0] || null);
        setRecentSubmissions(subsRes);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Simple, honest header */}
      <section className="space-y-4 text-center sm:text-left border-b border-slate-800 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
          <span>Student Coding Project • Online Judge</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Practice Coding & Algorithms
        </h1>

        <p className="text-base text-slate-400 max-w-2xl leading-relaxed">
          A clean and straightforward online judge to solve algorithmic problems, run code with custom inputs,
          and test solutions across Java, Python, C++, and JavaScript.
        </p>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
          <button
            id="hero-explore-problems-btn"
            onClick={() => onNavigate('problems')}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Code2 className="w-4 h-4" />
            <span>Browse All Problems</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="hero-submissions-btn"
            onClick={() => onNavigate('submissions')}
            className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
            <span>View Submissions</span>
          </button>
        </div>
      </section>

      {/* Featured Problem Card */}
      {featuredProblem && (
        <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div>
              <span className="text-xs font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                Featured Practice Problem
              </span>
              <h2 className="text-xl font-bold text-white mt-1">{featuredProblem.title}</h2>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono px-2.5 py-1 rounded font-medium border ${
                  featuredProblem.difficulty === 'EASY'
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                    : featuredProblem.difficulty === 'MEDIUM'
                    ? 'bg-amber-950/60 text-amber-400 border-amber-800/50'
                    : 'bg-rose-950/60 text-rose-400 border-rose-800/50'
                }`}
              >
                {featuredProblem.difficulty}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {featuredProblem.acceptanceRate}% acceptance
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
            {featuredProblem.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap gap-1.5">
              {featuredProblem.tags.map((tag) => (
                <span key={tag} className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {tag}
                </span>
              ))}
            </div>

            <button
              onClick={() => onNavigate('problem', featuredProblem.slug)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Solve Problem</span>
            </button>
          </div>
        </section>
      )}

      {/* Quick Problem List Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Popular Problems</h2>
            <p className="text-xs text-slate-400">Click on any problem to start writing code.</p>
          </div>
          <button
            onClick={() => onNavigate('problems')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4 w-28">Difficulty</th>
                <th className="py-3 px-4 hidden sm:table-cell">Tags</th>
                <th className="py-3 px-4 w-24 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {problems.slice(0, 6).map((prob, idx) => (
                <tr
                  key={prob.id}
                  onClick={() => onNavigate('problem', prob.slug)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium text-white hover:text-indigo-400 transition-colors">
                    {prob.title}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-mono text-[11px] font-semibold ${
                        prob.difficulty === 'EASY'
                          ? 'text-emerald-400'
                          : prob.difficulty === 'MEDIUM'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {prob.difficulty}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {prob.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('problem', prob.slug);
                      }}
                      className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-medium text-[11px] transition-colors"
                    >
                      Solve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Submissions Feed */}
      {recentSubmissions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Activity</h2>
              <p className="text-xs text-slate-400">Latest code submissions on the platform.</p>
            </div>
            <button
              onClick={() => onNavigate('submissions')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>All Submissions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between text-xs"
              >
                <div className="space-y-1 truncate pr-2">
                  <p className="font-semibold text-white truncate">{sub.problemTitle}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {sub.language} • by <span className="text-slate-300">{sub.username}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      sub.verdict === 'ACCEPTED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : sub.verdict === 'WRONG_ANSWER'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                        : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                    }`}
                  >
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
      )}

      {/* About this Project - student project explanation */}
      <section className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>About this Project</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          This is an online judge web application built for coding practice and problem verification.
          Users can choose algorithmic problems, write solutions in Java, Python, C++, or JavaScript,
          test with custom test cases, and check runtime and verdict results.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono text-slate-400">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
            <p className="font-semibold text-slate-200 font-sans">Multi-Language</p>
            <p className="text-[11px] mt-1 text-slate-400">Java 21, Python 3, C++, and JavaScript support.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
            <p className="font-semibold text-slate-200 font-sans">Test Runner</p>
            <p className="text-[11px] mt-1 text-slate-400">Run code against sample or custom test cases.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
            <p className="font-semibold text-slate-200 font-sans">Verdicts</p>
            <p className="text-[11px] mt-1 text-slate-400">Accepted, Wrong Answer, and execution time stats.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
