import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Users, Calendar, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Contest } from '../types';
import { api } from '../lib/api';

interface ContestsPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const ContestsPage: React.FC<ContestsPageProps> = ({ onNavigate }) => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true);
        const data = await api.getContests();
        setContests(data);
      } catch (err) {
        console.error('Failed to load contests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const filteredContests = contests.filter((c) => {
    if (activeTab === 'live') return c.status === 'LIVE';
    if (activeTab === 'upcoming') return c.status === 'UPCOMING';
    if (activeTab === 'past') return c.status === 'ENDED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Contests</h1>
        <p className="text-sm text-slate-400 mt-1">
          Participate in timed contests and track standings on the scoreboard.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          All Contests ({contests.length})
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'live'
              ? 'bg-emerald-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live ({contests.filter(c => c.status === 'LIVE').length})</span>
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Upcoming ({contests.filter(c => c.status === 'UPCOMING').length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'past'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Past Rounds ({contests.filter(c => c.status === 'ENDED').length})
        </button>
      </div>

      {/* Contest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContests.map((contest) => {
          const isLive = contest.status === 'LIVE';
          const isUpcoming = contest.status === 'UPCOMING';

          return (
            <div
              key={contest.id}
              className={`bg-[#111827] border rounded-2xl p-6 flex flex-col justify-between shadow-xl transition-all hover:border-slate-700 ${
                isLive
                  ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
                  : 'border-slate-800'
              }`}
            >
              <div className="space-y-4">
                {/* Status Pill */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono px-2.5 py-1 rounded-md font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                      isLive
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                        : isUpcoming
                        ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800/60'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {isLive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                    <span>{contest.status}</span>
                  </span>

                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{contest.durationMinutes} mins</span>
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {contest.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {contest.description}
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">PROBLEMS</span>
                    <span className="font-bold text-white">{contest.problems.length} Challenges</span>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">PARTICIPANTS</span>
                    <span className="font-bold text-white">{contest.participantsCount} Coders</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Starts: {new Date(contest.startTime).toLocaleDateString()} at{' '}
                    {new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-slate-800/60">
                <button
                  onClick={() => onNavigate('contest-details', contest.id)}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isLive
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25'
                      : 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{isLive ? 'Join Live Round Now' : 'View Contest & Scoreboard'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
