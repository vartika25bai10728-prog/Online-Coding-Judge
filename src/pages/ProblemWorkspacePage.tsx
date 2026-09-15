import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileCode,
  ListOrdered,
  MessageSquare,
  HelpCircle,
  ChevronRight,
  Plus,
  Trash2,
  Share2,
  ExternalLink
} from 'lucide-react';
import { Problem, SupportedLanguage, Submission, TestCaseResult } from '../types';
import { MonacoCodeEditor } from '../components/MonacoCodeEditor';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface ProblemWorkspacePageProps {
  slug: string;
  onNavigate: (page: string, param?: string) => void;
}

export const ProblemWorkspacePage: React.FC<ProblemWorkspacePageProps> = ({ slug, onNavigate }) => {
  const { user, openAuthModal } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [leftTab, setLeftTab] = useState<'description' | 'submissions' | 'discussions' | 'solutions'>('description');
  
  // Editor State
  const [language, setLanguage] = useState<SupportedLanguage>('java');
  const [code, setCode] = useState<string>('');
  
  // Console & Execution State
  const [activeConsoleTab, setActiveConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState<number>(0);
  const [customTestCases, setCustomTestCases] = useState<{ input: string; expectedOutput?: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<{ status: 'PASSED' | 'FAILED'; runtimeMs: number; results: TestCaseResult[] } | null>(null);
  
  // Submission & SSE State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [pastSubmissions, setPastSubmissions] = useState<Submission[]>([]);
  const [selectedPastSubmission, setSelectedPastSubmission] = useState<Submission | null>(null);

  // Discussions State
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [isSubmittingDiscussion, setIsSubmittingDiscussion] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch problem details
  useEffect(() => {
    const loadProblem = async () => {
      try {
        setLoading(true);
        const data = await api.getProblemBySlug(slug);
        setProblem(data);
        setCode(data.starterCode[language] || '');
        setCustomTestCases(data.testCases.map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput })));
      } catch (err) {
        console.error('Failed to load problem:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProblem();
  }, [slug]);

  // Load problem submissions when user or tab changes
  useEffect(() => {
    if (problem && user) {
      api.getSubmissions({ problemId: problem.id, userId: user.id }).then(setPastSubmissions).catch(console.error);
    }
  }, [problem, user, leftTab]);

  // Load discussions
  useEffect(() => {
    if (problem && leftTab === 'discussions') {
      api.getDiscussions(problem.id).then(setDiscussions).catch(console.error);
    }
  }, [problem, leftTab]);

  // Handle language change
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    if (problem) {
      const saved = localStorage.getItem(`apex_code_${problem.id}_${newLang}`);
      setCode(saved || problem.starterCode[newLang] || '');
    }
  };

  // Run Code (Public Testcases only, instant feedback)
  const handleRunCode = async () => {
    if (!problem) return;
    setIsRunning(true);
    setActiveConsoleTab('result');
    setRunResult(null);

    try {
      const res = await api.runCode(problem.id, language, code, customTestCases);
      setRunResult(res);
    } catch (err: any) {
      setRunResult({
        status: 'FAILED',
        runtimeMs: 0,
        results: [
          {
            testIndex: 1,
            isPublic: true,
            passed: false,
            runtimeMs: 0,
            error: err.message || 'Execution error'
          }
        ]
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Solution (Asynchronous Queue -> Worker -> Sandbox -> SSE Stream)
  const handleSubmitCode = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (!problem) return;

    setIsSubmitting(true);
    setActiveConsoleTab('result');
    setRunResult(null);
    setCurrentSubmission(null);

    // Close any previous SSE stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const initialSub = await api.submitCode(problem.id, language, code);
      setCurrentSubmission(initialSub);

      // Connect to Server-Sent Events (SSE) for real-time judge updates
      const es = new EventSource(`/api/submissions/${initialSub.id}/events`);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const updatedSub: Submission = JSON.parse(event.data);
          setCurrentSubmission(updatedSub);

          if (updatedSub.status === 'COMPLETED') {
            setIsSubmitting(false);
            es.close();

            // Fire confetti celebratory effect if accepted!
            if (updatedSub.verdict === 'ACCEPTED') {
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              });
            }

            // Refresh past submissions
            api.getSubmissions({ problemId: problem.id, userId: user.id })
              .then(setPastSubmissions)
              .catch(console.error);
          }
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      };

      es.onerror = () => {
        es.close();
        setIsSubmitting(false);
        // Fallback fetch
        api.getSubmission(initialSub.id).then(setCurrentSubmission).catch(console.error);
      };
    } catch (err: any) {
      setIsSubmitting(false);
      alert(`Submission error: ${err.message}`);
    }
  };

  const handlePostDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!problem || !newDiscussionTitle.trim() || !newDiscussionContent.trim()) return;

    setIsSubmittingDiscussion(true);
    try {
      const newD = await api.createDiscussion({
        problemId: problem.id,
        title: newDiscussionTitle,
        content: newDiscussionContent,
        tags: [problem.title, 'Algorithm']
      });
      setDiscussions([newD, ...discussions]);
      setNewDiscussionTitle('');
      setNewDiscussionContent('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingDiscussion(false);
    }
  };

  if (loading || !problem) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-mono text-slate-400">Loading problem environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-62px)] flex flex-col overflow-hidden bg-[#090d16]">
      {/* Workspace Sub-header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0c121e] border-b border-slate-800 text-xs shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('problems')}
            className="text-slate-400 hover:text-white font-medium flex items-center gap-1 transition-colors"
          >
            <span>← Problem List</span>
          </button>
          <span className="text-slate-600">/</span>
          <span className="font-bold text-white text-sm">{problem.title}</span>
          <span
            className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold border ${
              problem.difficulty === 'EASY'
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                : problem.difficulty === 'MEDIUM'
                ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
            }`}
          >
            {problem.difficulty}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            id="workspace-run-code-btn"
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-slate-300'}`} />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>

          <button
            id="workspace-submit-code-btn"
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Judging...' : 'Submit'}</span>
          </button>
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 p-2 overflow-hidden">
        {/* ================= LEFT PANEL (Problem Specs, Submissions, Discussions) ================= */}
        <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          {/* Left Panel Tabs */}
          <div className="flex items-center gap-1 px-3 pt-2 border-b border-slate-800 bg-[#0e1422] text-xs shrink-0">
            <button
              onClick={() => setLeftTab('description')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
                leftTab === 'description'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>

            <button
              onClick={() => setLeftTab('submissions')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
                leftTab === 'submissions'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Submissions ({pastSubmissions.length})</span>
            </button>

            <button
              onClick={() => setLeftTab('discussions')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
                leftTab === 'discussions'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Discussion</span>
            </button>

            <button
              onClick={() => setLeftTab('solutions')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
                leftTab === 'solutions'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hints</span>
            </button>
          </div>

          {/* Left Panel Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
            {leftTab === 'description' && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{problem.title}</h2>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded font-semibold border ${
                        problem.difficulty === 'EASY'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                          : problem.difficulty === 'MEDIUM'
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                          : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Acceptance: {problem.acceptanceRate}%
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Time Limit: {problem.timeLimitMs}ms
                    </span>
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="text-slate-300 leading-relaxed whitespace-pre-line text-sm">
                  {problem.description}
                </div>

                {/* Examples */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Examples
                  </h3>
                  {problem.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-2 text-xs font-mono"
                    >
                      <p className="font-bold text-slate-200 font-sans">Example {idx + 1}:</p>
                      <div className="bg-slate-950 p-2 rounded border border-slate-900">
                        <span className="text-slate-400">Input: </span>
                        <span className="text-emerald-300 font-semibold">{ex.input}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-900">
                        <span className="text-slate-400">Output: </span>
                        <span className="text-cyan-300 font-semibold">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div className="text-slate-400 font-sans pt-1">
                          <span className="font-semibold text-slate-300">Explanation: </span>
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Constraints
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-xs font-mono text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    {problem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {problem.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {leftTab === 'submissions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Your Submission History</h3>
                  <span className="text-xs font-mono text-slate-400">
                    {pastSubmissions.length} submissions recorded
                  </span>
                </div>

                {pastSubmissions.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    You haven't submitted a solution for this problem yet. Click "Submit" to record a submission.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pastSubmissions.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setSelectedPastSubmission(s)}
                        className={`p-3 rounded-lg border transition-colors cursor-pointer text-xs ${
                          selectedPastSubmission?.id === s.id
                            ? 'bg-indigo-950/40 border-indigo-500/50'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                              s.verdict === 'ACCEPTED'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {s.verdict}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Date(s.createdAt).toLocaleDateString()} {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
                          <span>Lang: <strong className="text-slate-300 uppercase">{s.language}</strong></span>
                          <span>Runtime: <strong className="text-slate-300">{s.runtimeMs}ms</strong></span>
                          <span>Passed: <strong className="text-slate-300">{s.passedTests}/{s.totalTests}</strong></span>
                        </div>

                        {selectedPastSubmission?.id === s.id && (
                          <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                            <p className="text-[11px] text-slate-400 font-mono">Submitted Code Snapshot:</p>
                            <pre className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
                              {s.code}
                            </pre>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setLanguage(s.language);
                                setCode(s.code);
                              }}
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono"
                            >
                              Load this code into editor →
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {leftTab === 'discussions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Community Discussion</h3>
                </div>

                {/* Post Question / Approach form */}
                <form onSubmit={handlePostDiscussion} className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2">
                  <input
                    type="text"
                    required
                    value={newDiscussionTitle}
                    onChange={(e) => setNewDiscussionTitle(e.target.value)}
                    placeholder="Discussion title or question..."
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <textarea
                    required
                    rows={2}
                    value={newDiscussionContent}
                    onChange={(e) => setNewDiscussionContent(e.target.value)}
                    placeholder="Share an optimal approach, time complexity breakdown, or question..."
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingDiscussion}
                    className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold ml-auto block transition-colors"
                  >
                    Post Discussion
                  </button>
                </form>

                {/* Discussion items list */}
                <div className="space-y-3">
                  {discussions.map((d) => (
                    <div key={d.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <img src={d.userAvatar} alt="" className="w-5 h-5 rounded-full" />
                          <span className="text-xs font-semibold text-slate-200">{d.username}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{d.title}</h4>
                      <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{d.content}</p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
                        <span>▲ {d.upvotes} Upvotes</span>
                        <span>💬 {d.commentCount} Comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {leftTab === 'solutions' && (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-indigo-200 space-y-2">
                  <h4 className="font-bold flex items-center gap-1.5 text-indigo-300">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Optimal Algorithmic Intuition
                  </h4>
                  <p>
                    For <strong className="text-white">{problem.title}</strong>, focus on analyzing time and space constraints before committing to a brute-force approach.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pt-1 font-mono">
                    <li>Target Time Complexity: O(N) or O(N log N)</li>
                    <li>Target Space Complexity: O(1) or O(N) auxiliary</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT PANEL (Monaco Code Editor + Console) ================= */}
        <div className="lg:col-span-7 flex flex-col gap-2 overflow-hidden">
          {/* Top: Monaco Code Editor */}
          <div className="flex-1 min-h-[300px] overflow-hidden">
            <MonacoCodeEditor
              problemId={problem.id}
              language={language}
              onLanguageChange={handleLanguageChange}
              starterCode={problem.starterCode}
              code={code}
              onChange={setCode}
            />
          </div>

          {/* Bottom: Console & Results Drawer */}
          <div className="h-[260px] bg-[#111827] border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-xl shrink-0">
            {/* Console Tabs */}
            <div className="flex items-center justify-between px-3 bg-[#0d1321] border-b border-slate-800 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <button
                  id="console-tab-testcases"
                  onClick={() => setActiveConsoleTab('testcase')}
                  className={`px-3 py-2 font-medium border-b-2 transition-colors ${
                    activeConsoleTab === 'testcase'
                      ? 'border-indigo-500 text-indigo-400 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Test Cases
                </button>

                <button
                  id="console-tab-results"
                  onClick={() => setActiveConsoleTab('result')}
                  className={`px-3 py-2 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeConsoleTab === 'result'
                      ? 'border-indigo-500 text-indigo-400 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Test Result</span>
                  {(isRunning || isSubmitting) && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                  {runResult && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        runResult.status === 'PASSED' ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                  )}
                  {currentSubmission?.verdict && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        currentSubmission.verdict === 'ACCEPTED' ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                  )}
                </button>
              </div>

              {activeConsoleTab === 'testcase' && (
                <button
                  id="add-custom-testcase-btn"
                  onClick={() => {
                    const newCases = [...customTestCases, { input: '', expectedOutput: '' }];
                    setCustomTestCases(newCases);
                    setSelectedTestCaseIndex(newCases.length - 1);
                  }}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Case</span>
                </button>
              )}
            </div>

            {/* Console Drawer Body */}
            <div className="flex-1 overflow-y-auto p-3 text-xs font-mono">
              {activeConsoleTab === 'testcase' && (
                <div className="space-y-3">
                  {/* Case Pill Selectors */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {customTestCases.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedTestCaseIndex(i)}
                        className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                          selectedTestCaseIndex === i
                            ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-900'
                        }`}
                      >
                        Case {i + 1}
                      </button>
                    ))}
                  </div>

                  {customTestCases[selectedTestCaseIndex] && (
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] text-slate-400">Input:</label>
                          {customTestCases.length > 1 && (
                            <button
                              onClick={() => {
                                const updated = customTestCases.filter((_, idx) => idx !== selectedTestCaseIndex);
                                setCustomTestCases(updated);
                                setSelectedTestCaseIndex(Math.max(0, selectedTestCaseIndex - 1));
                              }}
                              className="text-rose-400 hover:text-rose-300 text-[10px] flex items-center gap-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={2}
                          value={customTestCases[selectedTestCaseIndex].input}
                          onChange={(e) => {
                            const updated = [...customTestCases];
                            updated[selectedTestCaseIndex].input = e.target.value;
                            setCustomTestCases(updated);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 mb-1 block">Expected Output:</label>
                        <input
                          type="text"
                          value={customTestCases[selectedTestCaseIndex].expectedOutput || ''}
                          onChange={(e) => {
                            const updated = [...customTestCases];
                            updated[selectedTestCaseIndex].expectedOutput = e.target.value;
                            setCustomTestCases(updated);
                          }}
                          placeholder="e.g. [0,1]"
                          className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeConsoleTab === 'result' && (
                <div>
                  {/* Status Indicator & Asynchronous Stepper */}
                  {isSubmitting && currentSubmission && (
                    <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-lg mb-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-300 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                          <span>Async Judge Pipeline:</span>
                          <strong className="text-white uppercase tracking-wider font-mono">
                            {currentSubmission.status}
                          </strong>
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Tests Evaluated: {currentSubmission.passedTests} / {currentSubmission.totalTests}
                        </span>
                      </div>

                      {/* Animated Progress Bar */}
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full transition-all duration-300"
                          style={{
                            width: `${Math.max(
                              15,
                              (currentSubmission.passedTests / Math.max(1, currentSubmission.totalTests)) * 100
                            )}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Submission Finished Results */}
                  {currentSubmission && currentSubmission.status === 'COMPLETED' && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border bg-slate-900/80 border-slate-800">
                        <div className="flex items-center gap-2">
                          {currentSubmission.verdict === 'ACCEPTED' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400" />
                          )}
                          <div>
                            <p
                              className={`text-sm font-bold font-mono ${
                                currentSubmission.verdict === 'ACCEPTED' ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {currentSubmission.verdict}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {currentSubmission.passedTests} / {currentSubmission.totalTests} test cases passed
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
                          <div>
                            <span className="text-slate-500 block text-[10px]">RUNTIME</span>
                            <span className="font-bold">{currentSubmission.runtimeMs} ms</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">MEMORY</span>
                            <span className="font-bold">{currentSubmission.memoryMb} MB</span>
                          </div>
                          {currentSubmission.percentileBeat && (
                            <div className="hidden sm:block">
                              <span className="text-slate-500 block text-[10px]">BEATS</span>
                              <span className="font-bold text-emerald-400">
                                {currentSubmission.percentileBeat}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Error details if any */}
                      {currentSubmission.errorDetails && (
                        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-300 font-mono text-xs whitespace-pre-wrap">
                          {currentSubmission.errorDetails}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Run Code Results (Public Testcases) */}
                  {runResult && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span
                          className={`font-bold font-mono text-sm ${
                            runResult.status === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {runResult.status === 'PASSED' ? 'All Sample Tests Passed' : 'Test Failed'}
                        </span>
                        <span className="text-slate-400 text-xs font-mono">
                          Runtime: {runResult.runtimeMs}ms
                        </span>
                      </div>

                      <div className="space-y-2">
                        {runResult.results.map((r, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-lg border text-xs font-mono ${
                              r.passed
                                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                                : 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1 font-bold">
                              <span>Test Case {r.testIndex}:</span>
                              <span>{r.passed ? 'PASSED' : 'FAILED'} ({r.runtimeMs}ms)</span>
                            </div>

                            {r.input && (
                              <div className="mt-1 text-slate-300">
                                <span className="text-slate-500">Input: </span>
                                <span>{r.input}</span>
                              </div>
                            )}

                            {r.expectedOutput && (
                              <div className="text-slate-300">
                                <span className="text-slate-500">Expected: </span>
                                <span>{r.expectedOutput}</span>
                              </div>
                            )}

                            {r.actualOutput && (
                              <div className="text-slate-300">
                                <span className="text-slate-500">Output: </span>
                                <span className={r.passed ? 'text-emerald-400' : 'text-rose-400'}>
                                  {r.actualOutput}
                                </span>
                              </div>
                            )}

                            {r.error && (
                              <div className="mt-1 text-rose-400 font-mono text-[11px] whitespace-pre-wrap">
                                {r.error}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isRunning && !isSubmitting && !runResult && !currentSubmission && (
                    <p className="text-slate-500 text-center py-8">
                      Press "Run Code" to test on sample test cases, or "Submit" for full judging evaluation.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
