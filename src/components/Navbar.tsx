import React, { useState } from 'react';
import { Terminal, Shield, Trophy, Code2, ListOrdered, MessageSquare, LogOut, CheckCircle2, ChevronDown, UserCheck, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, param?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout, openAuthModal, quickSwitchUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="border-b border-slate-800/80 bg-[#0c121e]/90 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-8">
          <button
            id="nav-logo-btn"
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white font-mono">APEX</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60 uppercase tracking-wider">JUDGE</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider -mt-0.5">ISOLATED SANDBOX ENGINE</p>
            </div>
          </button>

          {/* Links */}
          <div className="hidden md:flex items-center gap-1">
            <button
              id="nav-link-problems"
              onClick={() => onNavigate('problems')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentPage === 'problems' || currentPage === 'problem'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Problems</span>
            </button>

            <button
              id="nav-link-contests"
              onClick={() => onNavigate('contests')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all relative ${
                currentPage === 'contests' || currentPage === 'contest-details'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Contests</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>

            <button
              id="nav-link-leaderboard"
              onClick={() => onNavigate('leaderboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentPage === 'leaderboard'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>

            <button
              id="nav-link-submissions"
              onClick={() => onNavigate('submissions')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentPage === 'submissions'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submissions</span>
            </button>

            <button
              id="nav-link-discussions"
              onClick={() => onNavigate('discussions')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentPage === 'discussions'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Discussions</span>
            </button>

            {user?.role === 'ADMIN' && (
              <button
                id="nav-link-admin"
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  currentPage === 'admin'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-amber-300/80 hover:text-amber-200 hover:bg-amber-500/10'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Actions & Auth Status */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher for Test Reviewers */}
          <div className="hidden sm:flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            <button
              id="switch-to-user-btn"
              onClick={() => quickSwitchUser('USER')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                user?.role === 'USER' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to User profile"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>User</span>
            </button>
            <button
              id="switch-to-admin-btn"
              onClick={() => quickSwitchUser('ADMIN')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                user?.role === 'ADMIN' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Admin profile"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Judge Engine Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Judge: <strong className="text-emerald-400 font-semibold">ONLINE</strong></span>
          </div>

          {/* User Profile / Login */}
          {user ? (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors focus:outline-none"
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                />
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-200">{user.username}</span>
                    <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400 font-mono">
                      {user.rating}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 font-sans">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs text-slate-400 font-mono">Signed in as</p>
                    <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-mono">
                        Rating: {user.rating}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-mono flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        {user.currentStreak}d
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      id="dropdown-profile-btn"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate('profile', user.username);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors"
                    >
                      User Profile & Statistics
                    </button>

                    <button
                      id="dropdown-my-submissions-btn"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate('submissions');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors"
                    >
                      My Submissions
                    </button>

                    {user.role === 'ADMIN' && (
                      <button
                        id="dropdown-admin-btn"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-amber-300 hover:bg-amber-500/10 transition-colors flex items-center justify-between"
                      >
                        <span>Admin Console</span>
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-800 pt-1">
                    <button
                      id="dropdown-logout-btn"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="nav-login-btn"
              onClick={openAuthModal}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
