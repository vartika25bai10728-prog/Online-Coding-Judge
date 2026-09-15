import React, { useState, useEffect } from 'react';
import { User as UserIcon, Flame, Trophy, Award, CheckCircle2, Calendar, Clock, Star, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface ProfilePageProps {
  username?: string;
  onNavigate: (page: string, param?: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ username, onNavigate }) => {
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const targetUsername = username || currentUser?.username || 'alex_coder';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await api.getUserProfile(targetUsername);
        setProfileData(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [targetUsername]);

  if (loading || !profileData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { user, stats } = profileData;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-xl"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60 uppercase">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-md">{user.bio}</p>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>Global Rank: <strong className="text-white">#{stats.rank}</strong></span>
              </div>
            </div>
          </div>

          {/* Rating & Streaks */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center min-w-[110px]">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Elo Rating</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{user.rating}</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center min-w-[110px]">
              <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" /> Streak
              </span>
              <span className="text-2xl font-black text-white font-mono">{user.currentStreak}d</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Solved Breakdown & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Problem Solved Analytics */}
        <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Solved Challenges</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Total Solved: <strong className="text-white">{stats.solvedCount}</strong> / {stats.totalProblems}
            </span>
          </div>

          {/* Difficulty Progress Bars */}
          <div className="space-y-4 font-mono text-xs">
            {/* Easy */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-emerald-400 font-semibold">Easy</span>
                <span className="text-slate-300">
                  {stats.easySolved} / {stats.totalEasy}{' '}
                  <span className="text-slate-500">
                    ({Math.round((stats.easySolved / Math.max(1, stats.totalEasy)) * 100)}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${(stats.easySolved / Math.max(1, stats.totalEasy)) * 100}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-amber-400 font-semibold">Medium</span>
                <span className="text-slate-300">
                  {stats.mediumSolved} / {stats.totalMedium}{' '}
                  <span className="text-slate-500">
                    ({Math.round((stats.mediumSolved / Math.max(1, stats.totalMedium)) * 100)}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${(stats.mediumSolved / Math.max(1, stats.totalMedium)) * 100}%` }}
                />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-rose-400 font-semibold">Hard</span>
                <span className="text-slate-300">
                  {stats.hardSolved} / {stats.totalHard}{' '}
                  <span className="text-slate-500">
                    ({Math.round((stats.hardSolved / Math.max(1, stats.totalHard)) * 100)}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${(stats.hardSolved / Math.max(1, stats.totalHard)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">ACCEPTANCE RATE</span>
              <span className="text-base font-bold text-white">{stats.acceptanceRate}%</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">TOTAL SUBMISSIONS</span>
              <span className="text-base font-bold text-white">{stats.totalSubmissions}</span>
            </div>
          </div>
        </div>

        {/* Right: Badges & Achievements */}
        <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Earned Badges & Distinctions</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {stats.badges.filter((b: any) => b.unlockedAt).length} / {stats.badges.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stats.badges.map((badge: any) => {
              const isUnlocked = !!badge.unlockedAt;

              return (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                    isUnlocked
                      ? 'bg-slate-900/80 border-indigo-500/40 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-50'
                  }`}
                >
                  <div className="text-2xl shrink-0 mt-0.5">{badge.icon}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{badge.name}</span>
                      {isUnlocked && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px] leading-tight">{badge.description}</p>
                    {isUnlocked && (
                      <p className="text-[10px] font-mono text-indigo-400 pt-0.5">
                        Earned {new Date(badge.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Contribution Heatmap (60-Day Interactive Calendar) */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>60-Day Submission Activity</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">Consistent Daily Problem Solving</span>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1.5 min-w-[600px]">
            {stats.recentActivity.map((day: any, i: number) => {
              const intensity =
                day.count >= 4
                  ? 'bg-emerald-400'
                  : day.count >= 2
                  ? 'bg-emerald-600'
                  : day.count === 1
                  ? 'bg-emerald-900'
                  : 'bg-slate-900';

              return (
                <div
                  key={i}
                  className={`w-3.5 h-12 rounded-sm ${intensity} transition-transform hover:scale-125 hover:z-10 cursor-pointer`}
                  title={`${day.date}: ${day.count} submissions`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
          <span>60 days ago</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-900" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-900" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            <span>More</span>
          </div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};
