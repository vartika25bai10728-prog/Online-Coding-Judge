import React, { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp, Search, Flame } from 'lucide-react';
import { api } from '../lib/api';

interface LeaderboardPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onNavigate }) => {
  const [rankedUsers, setRankedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await api.getGlobalLeaderboard();
        setRankedUsers(data);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getTier = (rating: number) => {
    if (rating >= 2400) return { name: 'Grandmaster', color: 'text-rose-400 bg-rose-950/60 border-rose-800/60' };
    if (rating >= 2100) return { name: 'Master', color: 'text-amber-400 bg-amber-950/60 border-amber-800/60' };
    if (rating >= 1800) return { name: 'Expert', color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/60' };
    if (rating >= 1500) return { name: 'Specialist', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60' };
    return { name: 'Pupil', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60' };
  };

  const filtered = rankedUsers.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Leaderboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            User rankings by rating and solved problems.
          </p>
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search competitor..."
            className="w-full bg-[#111827] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3.5 px-6 w-16 text-center">Rank</th>
                <th className="py-3.5 px-6">Competitor</th>
                <th className="py-3.5 px-6">Tier</th>
                <th className="py-3.5 px-6 text-right">Rating</th>
                <th className="py-3.5 px-6 text-right">Solved Total</th>
                <th className="py-3.5 px-6 text-right">E / M / H</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {filtered.map((user) => {
                const tier = getTier(user.rating);

                return (
                  <tr
                    key={user.id}
                    onClick={() => onNavigate('profile', user.username)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 text-center font-bold text-sm">
                      {user.rank === 1 ? '🥇 1' : user.rank === 2 ? '🥈 2' : user.rank === 3 ? '🥉 3' : user.rank}
                    </td>

                    <td className="py-4 px-6 font-sans">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                        />
                        <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {user.username}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${tier.color}`}>
                        {tier.name}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right font-bold text-white text-sm">
                      {user.rating}
                    </td>

                    <td className="py-4 px-6 text-right font-bold text-slate-200">
                      {user.solvedCount}
                    </td>

                    <td className="py-4 px-6 text-right text-[11px]">
                      <span className="text-emerald-400 font-semibold">{user.easySolved}</span>
                      <span className="text-slate-600"> / </span>
                      <span className="text-amber-400 font-semibold">{user.mediumSolved}</span>
                      <span className="text-slate-600"> / </span>
                      <span className="text-rose-400 font-semibold">{user.hardSolved}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
