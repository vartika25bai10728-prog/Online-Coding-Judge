import React, { useState, useEffect, useMemo } from 'react';
import { Search, CheckCircle2, Filter, ArrowUpDown, ChevronRight, Tag, Sparkles } from 'lucide-react';
import { Problem, Difficulty } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface ProblemsPageProps {
  onSelectProblem: (slug: string) => void;
}

const ALL_TAGS = [
  'All',
  'Arrays',
  'Hashing',
  'Strings',
  'Two Pointers',
  'Stack',
  'Binary Search',
  'Sliding Window',
  'Dynamic Programming',
  'Linked List',
  'Trees',
  'Depth-First Search',
  'Breadth-First Search',
  'Backtracking',
  'Greedy',
  'Bit Manipulation',
  'Math'
];

export const ProblemsPage: React.FC<ProblemsPageProps> = ({ onSelectProblem }) => {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [userSolvedSlugs, setUserSolvedSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'id' | 'acceptance' | 'difficulty'>('id');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const res = await api.getProblems({ limit: 100 });
        setProblems(res.problems);

        if (user) {
          const subs = await api.getSubmissions({ userId: user.id });
          const solved = new Set(
            subs.filter(s => s.verdict === 'ACCEPTED').map(s => s.problemSlug)
          );
          setUserSolvedSlugs(solved);
        }
      } catch (err) {
        console.error('Error fetching problems:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [user]);

  // Filter & sort logic
  const filteredProblems = useMemo(() => {
    return problems
      .filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

        const matchesDiff =
          selectedDifficulty === 'ALL' || p.difficulty === selectedDifficulty;

        const matchesTag =
          selectedTag === 'All' || p.tags.includes(selectedTag);

        return matchesSearch && matchesDiff && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === 'acceptance') return b.acceptanceRate - a.acceptanceRate;
        if (sortBy === 'difficulty') {
          const diffScore = { EASY: 1, MEDIUM: 2, HARD: 3 };
          return diffScore[a.difficulty] - diffScore[b.difficulty];
        }
        return 0;
      });
  }, [problems, search, selectedDifficulty, selectedTag, sortBy]);

  const counts = useMemo(() => {
    return {
      all: problems.length,
      easy: problems.filter(p => p.difficulty === 'EASY').length,
      medium: problems.filter(p => p.difficulty === 'MEDIUM').length,
      hard: problems.filter(p => p.difficulty === 'HARD').length
    };
  }, [problems]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans">Problem Repository</h1>
          <p className="text-sm text-slate-400 mt-1">
            20 high-yield interview challenges verified across 4 languages with sub-millisecond execution.
          </p>
        </div>

        {/* Solved Counter for current user */}
        {user && (
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Your Solved Progress</p>
              <p className="text-sm font-bold text-white font-mono">
                {userSolvedSlugs.size} / {problems.length}{' '}
                <span className="text-xs font-normal text-slate-400">
                  ({Math.round((userSolvedSlugs.size / Math.max(1, problems.length)) * 100)}%)
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              id="problem-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problem title or algorithm tag (e.g. 'Two Sum', 'Dynamic Programming')..."
              className="w-full bg-[#111827] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              id="problem-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="id">Default (ID)</option>
              <option value="acceptance">Highest Acceptance</option>
              <option value="difficulty">Difficulty Order</option>
            </select>
          </div>
        </div>

        {/* Difficulty Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            id="filter-diff-all"
            onClick={() => setSelectedDifficulty('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedDifficulty === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Difficulties ({counts.all})
          </button>
          <button
            id="filter-diff-easy"
            onClick={() => setSelectedDifficulty('EASY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedDifficulty === 'EASY'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-900 text-emerald-400/80 hover:text-emerald-300 border border-slate-800'
            }`}
          >
            Easy ({counts.easy})
          </button>
          <button
            id="filter-diff-medium"
            onClick={() => setSelectedDifficulty('MEDIUM')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedDifficulty === 'MEDIUM'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-900 text-amber-400/80 hover:text-amber-300 border border-slate-800'
            }`}
          >
            Medium ({counts.medium})
          </button>
          <button
            id="filter-diff-hard"
            onClick={() => setSelectedDifficulty('HARD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedDifficulty === 'HARD'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-900 text-rose-400/80 hover:text-rose-300 border border-slate-800'
            }`}
          >
            Hard ({counts.hard})
          </button>
        </div>

        {/* Tags horizontal scroll bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin text-xs">
          <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors shrink-0 ${
                selectedTag === tag
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-700 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/60 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">Status</th>
                <th className="py-3.5 px-4">Title & Tags</th>
                <th className="py-3.5 px-4 w-28">Difficulty</th>
                <th className="py-3.5 px-4 w-32">Acceptance</th>
                <th className="py-3.5 px-4 w-24 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    No problems match your current search and filter settings.
                  </td>
                </tr>
              ) : (
                filteredProblems.map((prob) => {
                  const isSolved = userSolvedSlugs.has(prob.slug);

                  return (
                    <tr
                      key={prob.id}
                      onClick={() => onSelectProblem(prob.slug)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Solved Status Indicator */}
                      <td className="py-4 px-4 text-center">
                        {isSolved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-700 mx-auto group-hover:bg-indigo-400 transition-colors" />
                        )}
                      </td>

                      {/* Title & Tags */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                              {prob.title}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {prob.tags.slice(0, 4).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                              >
                                {t}
                              </span>
                            ))}
                            {prob.tags.length > 4 && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 text-slate-500">
                                +{prob.tags.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Difficulty Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`text-xs font-mono px-2.5 py-1 rounded-md font-semibold border ${
                            prob.difficulty === 'EASY'
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                              : prob.difficulty === 'MEDIUM'
                              ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                              : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                      </td>

                      {/* Acceptance Rate */}
                      <td className="py-4 px-4 font-mono text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${Math.min(100, prob.acceptanceRate || 65)}%` }}
                            />
                          </div>
                          <span>{prob.acceptanceRate || 65}%</span>
                        </div>
                      </td>

                      {/* Solve Button */}
                      <td className="py-4 px-4 text-right">
                        <button
                          id={`solve-btn-${prob.slug}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProblem(prob.slug);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 hover:border-transparent text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1 ml-auto transition-all cursor-pointer"
                        >
                          <span>Solve</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
