import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Cpu, Filter, Eye, X, Terminal, Code2 } from 'lucide-react';
import { Submission } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface SubmissionsPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const SubmissionsPage: React.FC<SubmissionsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');
  const [filterLang, setFilterLang] = useState<string>('ALL');
  const [onlyMine, setOnlyMine] = useState(false);
  const [inspectSubmission, setInspectSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const params = onlyMine && user ? { userId: user.id, limit: 50 } : { limit: 50 };
        const data = await api.getSubmissions(params);
        setSubmissions(data);
      } catch (err) {
        console.error('Failed to load submissions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [onlyMine, user]);

  const filtered = submissions.filter((s) => {
    if (filterVerdict !== 'ALL' && s.verdict !== filterVerdict) return false;
    if (filterLang !== 'ALL' && s.language !== filterLang) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Submissions</h1>
          <p className="text-sm text-slate-400 mt-1">
            Recent code submissions and evaluation verdicts.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setOnlyMine(!onlyMine)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              onlyMine
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {onlyMine ? 'Showing: My Submissions' : 'Show Only My Submissions'}
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
          <span className="text-slate-500">Verdict:</span>
          <select
            value={filterVerdict}
            onChange={(e) => setFilterVerdict(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Verdicts</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="WRONG_ANSWER">Wrong Answer</option>
            <option value="TIME_LIMIT_EXCEEDED">Time Limit Exceeded</option>
            <option value="RUNTIME_ERROR">Runtime Error</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
          <span className="text-slate-500">Language:</span>
          <select
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Languages</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Problem</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Verdict</th>
                <th className="py-3.5 px-4">Lang</th>
                <th className="py-3.5 px-4">Runtime</th>
                <th className="py-3.5 px-4">Memory</th>
                <th className="py-3.5 px-4">Tests</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-sans">
                    No submissions found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Problem */}
                    <td className="py-3.5 px-4 font-sans font-semibold text-white">
                      <button
                        onClick={() => onNavigate('problem', s.problemSlug)}
                        className="hover:text-indigo-400 transition-colors text-left"
                      >
                        {s.problemTitle}
                      </button>
                    </td>

                    {/* User */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <button
                        onClick={() => onNavigate('profile', s.username)}
                        className="hover:underline text-indigo-300 font-medium"
                      >
                        {s.username}
                      </button>
                    </td>

                    {/* Verdict */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded font-bold text-[11px] border ${
                          s.verdict === 'ACCEPTED'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                            : s.verdict === 'WRONG_ANSWER'
                            ? 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                            : 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                        }`}
                      >
                        {s.verdict}
                      </span>
                    </td>

                    {/* Language */}
                    <td className="py-3.5 px-4 uppercase text-slate-400 font-semibold">{s.language}</td>

                    {/* Runtime */}
                    <td className="py-3.5 px-4 text-slate-300">{s.runtimeMs ? `${s.runtimeMs} ms` : '-'}</td>

                    {/* Memory */}
                    <td className="py-3.5 px-4 text-slate-300">{s.memoryMb ? `${s.memoryMb} MB` : '-'}</td>

                    {/* Passed Tests */}
                    <td className="py-3.5 px-4 text-slate-300">
                      {s.passedTests}/{s.totalTests}
                    </td>

                    {/* Submitted At */}
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(s.createdAt).toLocaleDateString()} {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Inspect Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setInspectSubmission(s)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="View Submission Details & Code"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Inspector Modal */}
      {inspectSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Submission Snapshot: {inspectSubmission.problemTitle}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    By {inspectSubmission.username} • {inspectSubmission.language.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectSubmission(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-2 p-4 bg-slate-950 border-b border-slate-800 text-xs font-mono text-center">
              <div>
                <span className="text-slate-500 block text-[10px]">VERDICT</span>
                <span className="font-bold text-emerald-400">{inspectSubmission.verdict}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">RUNTIME</span>
                <span className="font-bold text-white">{inspectSubmission.runtimeMs} ms</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">MEMORY</span>
                <span className="font-bold text-white">{inspectSubmission.memoryMb} MB</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">TESTS</span>
                <span className="font-bold text-white">
                  {inspectSubmission.passedTests} / {inspectSubmission.totalTests}
                </span>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-4 flex-1 overflow-y-auto">
              <p className="text-xs font-mono text-slate-400 mb-1.5">Submitted Source Code:</p>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                {inspectSubmission.code}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
