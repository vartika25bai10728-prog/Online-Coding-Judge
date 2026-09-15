import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { ProblemsPage } from './pages/ProblemsPage';
import { ProblemWorkspacePage } from './pages/ProblemWorkspacePage';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { ContestsPage } from './pages/ContestsPage';
import { ContestDetailsPage } from './pages/ContestDetailsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { DiscussionsPage } from './pages/DiscussionsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

export function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [param, setParam] = useState<string | undefined>(undefined);

  // Sync with browser URL hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (!hash) {
        setCurrentPage('landing');
        setParam(undefined);
        return;
      }

      const parts = hash.split('/');
      const page = parts[0];
      const pageParam = parts[1];

      if (['problems', 'problem', 'contests', 'contest-details', 'leaderboard', 'submissions', 'discussions', 'profile', 'admin'].includes(page)) {
        setCurrentPage(page);
        setParam(pageParam);
      } else {
        setCurrentPage('landing');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigate = (page: string, pageParam?: string) => {
    setCurrentPage(page);
    setParam(pageParam);
    const newHash = pageParam ? `#${page}/${pageParam}` : `#${page}`;
    window.location.hash = newHash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar currentPage={currentPage} onNavigate={navigate} />

      <main className="flex-1">
        {currentPage === 'landing' && <LandingPage onNavigate={navigate} />}
        {currentPage === 'problems' && <ProblemsPage onSelectProblem={(slug) => navigate('problem', slug)} />}
        {currentPage === 'problem' && param && (
          <ProblemWorkspacePage slug={param} onNavigate={navigate} />
        )}
        {currentPage === 'submissions' && <SubmissionsPage onNavigate={navigate} />}
        {currentPage === 'contests' && <ContestsPage onNavigate={navigate} />}
        {currentPage === 'contest-details' && param && (
          <ContestDetailsPage contestId={param} onNavigate={navigate} />
        )}
        {currentPage === 'leaderboard' && <LeaderboardPage onNavigate={navigate} />}
        {currentPage === 'discussions' && <DiscussionsPage onNavigate={navigate} />}
        {currentPage === 'profile' && <ProfilePage username={param} onNavigate={navigate} />}
        {currentPage === 'admin' && <AdminPage onNavigate={navigate} />}
      </main>

      {/* Global Auth Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
