import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Users, ArrowLeft, CheckCircle2, ChevronRight, AlertCircle, Shield } from 'lucide-react';
import { Contest, ContestLeaderboardEntry } from '../types';
import { api } from '../lib/api';

interface ContestDetailsPageProps {
  contestId: string;
  onNavigate: (page: string, param?: string) => void;
}

export const ContestDetailsPage: React.FC<ContestDetailsPageProps> = ({ contestId, onNavigate }) => {
  const [contest, setContest] = useState<Contest | null>(null);
  const [leaderboard, setLeaderboard] = useState<ContestLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'problems' | 'scoreboard'>('problems');
  const [timeLeft, setTimeLeft] = useState<string>('01:45:22');

  useEffect(() => {
    const fetchContest = async () => {
      try {
        setLoading(true);
        const [cData, lbData] = await Promise.all([
          api.getContest(contestId),
          api.getContestLeaderboard(contestId)
        ]);
        setContest(cData);
        setLeaderboard(lbData);
      } catch (err) {
        console.error('Failed to load contest:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, [contestId]);

  // Live countdown timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      // simulate decrement
      setTimeLeft(prev => {
        const parts = prev.split(':').map(Number);
        let [h, m, s] = parts;
        if (s > 0) s--;
        else if (m > 0) { m--; s = 59; }
        else if (h > 0) { h--; m = 59; s = 59; }
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading || !contest) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={() => onNavigate('contests')}
        className="text-xs text-slate-400 hover:text-white font-mono flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Contests</span>
      </button>

      {/* Contest Banner Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                {contest.status === 'LIVE' ? 'LIVE ROUND IN PROGRESS' : 'CONTEST ROUND'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{contest.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">{contest.description}</p>
          </div>

          {/* Countdown Clock Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center min-w-[180px] shadow-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Time Remaining
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-widest text-indigo-400">
              {timeLeft}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              ICPC Standard Penalty Rules
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('problems')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'problems'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Problems ({contest.problems.length})
        </button>
        <button
          onClick={() => setActiveTab('scoreboard')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'scoreboard'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Live Scoreboard ({leaderboard.length})
        </button>
      </div>

      {/* Tab: Problems */}
      {activeTab === 'problems' && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3.5 px-6 w-16">#</th>
                <th className="py-3.5 px-6">Problem</th>
                <th className="py-3.5 px-6 w-32">Points</th>
                <th className="py-3.5 px-6 w-32 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {contest.problems.map((p, idx) => (
                <tr
                  key={p.problemId}
                  onClick={() => onNavigate('problem', p.problemId)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6 font-mono font-bold text-indigo-400">
                    {String.fromCharCode(65 + idx)}
                  </td>
                  <td className="py-4 px-6 font-semibold text-white group-hover:text-indigo-300">
                    {p.title}
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-amber-400 font-bold">
                    {p.score} pts
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('problem', p.problemId);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold ml-auto flex items-center gap-1 transition-colors"
                    >
                      <span>Solve</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Scoreboard */}
      {activeTab === 'scoreboard' && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4 text-center">Score</th>
                <th className="py-3.5 px-4 text-center">Penalty</th>
                {contest.problems.map((_, i) => (
                  <th key={i} className="py-3.5 px-4 text-center w-24">
                    {String.fromCharCode(65 + i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {leaderboard.map((row) => (
                <tr key={row.userId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold text-white">
                    {row.rank === 1 ? '🥇 1' : row.rank === 2 ? '🥈 2' : row.rank === 3 ? '🥉 3' : row.rank}
                  </td>
                  <td className="py-3.5 px-4 font-sans font-semibold text-white">
                    <button
                      onClick={() => onNavigate('profile', row.username)}
                      className="hover:underline text-indigo-300"
                    >
                      {row.username}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-amber-400">
                    {row.score}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400">
                    {row.penaltyMinutes}m
                  </td>
                  {contest.problems.map((p) => {
                    const status = row.problemScores?.[p.problemId];
                    return (
                      <td key={p.problemId} className="py-3.5 px-4 text-center">
                        {status ? (
                          status.solved ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-bold">
                              +{status.attempts} ({status.penaltyMinutes}m)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/60">
                              -{status.attempts}
                            </span>
                          )
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
