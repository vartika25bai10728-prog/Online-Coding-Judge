import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Edit3, CheckCircle2, AlertTriangle, Cpu, HardDrive, Terminal } from 'lucide-react';
import { Problem, Difficulty } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface AdminPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingProblem, setIsCreatingProblem] = useState(false);
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [tags, setTags] = useState('Arrays, Hashing');
  const [description, setDescription] = useState('');
  const [timeLimitMs, setTimeLimitMs] = useState(2000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(256);
  const [testCases, setTestCases] = useState<{ input: string; expectedOutput: string }[]>([
    { input: '', expectedOutput: '' }
  ]);
  const [hiddenTestCases, setHiddenTestCases] = useState<{ input: string; expectedOutput: string }[]>([
    { input: '', expectedOutput: '' }
  ]);
  const [pyCode, setPyCode] = useState('# Python 3 starter code\nimport sys\n');
  const [jsCode, setJsCode] = useState('// JavaScript starter code\n');
  const [javaCode, setJavaCode] = useState('public class Solution {\n    // Solution\n}\n');
  const [cppCode, setCppCode] = useState('#include <iostream>\nusing namespace std;\n');

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await api.getProblems({ limit: 100 });
      setProblems(res.problems);
    } catch (err) {
      console.error('Failed to load admin problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleSaveProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const problemData = {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        difficulty,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        description,
        timeLimitMs: Number(timeLimitMs),
        memoryLimitMb: Number(memoryLimitMb),
        testCases: testCases.filter(t => t.input && t.expectedOutput),
        hiddenTestCases: hiddenTestCases.filter(t => t.input && t.expectedOutput),
        starterCode: {
          python: pyCode,
          javascript: jsCode,
          java: javaCode,
          cpp: cppCode
        }
      };

      if (editingProblemId) {
        await api.updateProblem(editingProblemId, problemData);
      } else {
        await api.createProblem(problemData);
      }

      setIsCreatingProblem(false);
      setEditingProblemId(null);
      resetForm();
      fetchProblems();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleDeleteProblem = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete problem "${name}"?`)) return;
    try {
      await api.deleteProblem(id);
      fetchProblems();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setDifficulty('MEDIUM');
    setTags('Arrays, Hashing');
    setDescription('');
    setTimeLimitMs(2000);
    setMemoryLimitMb(256);
    setTestCases([{ input: '', expectedOutput: '' }]);
    setHiddenTestCases([{ input: '', expectedOutput: '' }]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs mb-1">
            <Shield className="w-4 h-4" />
            <span>APEX JUDGE ADMINISTRATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">System & Problem Operations</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage algorithmic challenges, inspect isolated worker status, and configure contest parameters.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setEditingProblemId(null);
            setIsCreatingProblem(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Problem</span>
        </button>
      </div>

      {/* Infrastructure Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[10px]">JUDGE ENGINE</span>
            <span className="text-base font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE (Healthy)
            </span>
          </div>
          <Cpu className="w-6 h-6 text-slate-700" />
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[10px]">ACTIVE WORKER QUEUE</span>
            <span className="text-base font-bold text-white mt-0.5">0 Active / 0 Waiting</span>
          </div>
          <Terminal className="w-6 h-6 text-slate-700" />
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[10px]">CONTAINER SANDBOX</span>
            <span className="text-base font-bold text-cyan-400 mt-0.5">Docker cgroups v2</span>
          </div>
          <HardDrive className="w-6 h-6 text-slate-700" />
        </div>
      </div>

      {/* Problem Creation / Edit Form Modal */}
      {isCreatingProblem && (
        <div className="bg-[#111827] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">
              {editingProblemId ? 'Edit Algorithmic Problem' : 'Create New Algorithmic Problem'}
            </h2>
            <button
              onClick={() => setIsCreatingProblem(false)}
              className="text-xs text-slate-400 hover:text-white font-mono"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveProblem} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Problem Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Reverse Linked List II"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Arrays, Hashing, Dynamic Programming"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Problem Statement / Markdown</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Given an array of integers nums..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono">
              <div>
                <label className="block text-slate-300 font-sans font-medium mb-1">Time Limit (ms)</label>
                <input
                  type="number"
                  value={timeLimitMs}
                  onChange={(e) => setTimeLimitMs(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-sans font-medium mb-1">Memory Limit (MB)</label>
                <input
                  type="number"
                  value={memoryLimitMb}
                  onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>
            </div>

            {/* Test Cases */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">Public Test Cases</h3>
                <button
                  type="button"
                  onClick={() => setTestCases([...testCases, { input: '', expectedOutput: '' }])}
                  className="text-indigo-400 hover:text-indigo-300 text-xs"
                >
                  + Add Public Test Case
                </button>
              </div>

              {testCases.map((tc, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <label className="text-[10px] text-slate-500 font-mono">Input {idx + 1}:</label>
                    <input
                      type="text"
                      value={tc.input}
                      onChange={(e) => {
                        const updated = [...testCases];
                        updated[idx].input = e.target.value;
                        setTestCases(updated);
                      }}
                      placeholder="[2,7,11,15]\n9"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-mono">Expected Output {idx + 1}:</label>
                    <input
                      type="text"
                      value={tc.expectedOutput}
                      onChange={(e) => {
                        const updated = [...testCases];
                        updated[idx].expectedOutput = e.target.value;
                        setTestCases(updated);
                      }}
                      placeholder="[0,1]"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Hidden Test Cases */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">Hidden Test Cases (Isolated from Public Results)</h3>
                <button
                  type="button"
                  onClick={() => setHiddenTestCases([...hiddenTestCases, { input: '', expectedOutput: '' }])}
                  className="text-amber-400 hover:text-amber-300 text-xs"
                >
                  + Add Hidden Test Case
                </button>
              </div>

              {hiddenTestCases.map((tc, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <label className="text-[10px] text-slate-500 font-mono">Hidden Input {idx + 1}:</label>
                    <input
                      type="text"
                      value={tc.input}
                      onChange={(e) => {
                        const updated = [...hiddenTestCases];
                        updated[idx].input = e.target.value;
                        setHiddenTestCases(updated);
                      }}
                      placeholder="Large array or corner case..."
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-mono">Hidden Expected Output {idx + 1}:</label>
                    <input
                      type="text"
                      value={tc.expectedOutput}
                      onChange={(e) => {
                        const updated = [...hiddenTestCases];
                        updated[idx].expectedOutput = e.target.value;
                        setHiddenTestCases(updated);
                      }}
                      placeholder="Expected output..."
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreatingProblem(false)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-md"
              >
                Save Problem
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Problem Management Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3.5 px-4 w-12">ID</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4 w-28">Difficulty</th>
                <th className="py-3.5 px-4">Tags</th>
                <th className="py-3.5 px-4 text-center">Submissions</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {problems.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-bold">{p.id}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-white">
                    <button
                      onClick={() => onNavigate('problem', p.slug)}
                      className="hover:underline text-indigo-300"
                    >
                      {p.title}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        p.difficulty === 'EASY'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : p.difficulty === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-rose-950 text-rose-400 border-rose-800'
                      }`}
                    >
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{p.tags.join(', ')}</td>
                  <td className="py-3 px-4 text-center text-slate-300">
                    {p.totalAccepted || 0} / {p.totalSubmissions || 0}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDeleteProblem(p.id, p.title)}
                        className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-400 transition-colors"
                        title="Delete Problem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
