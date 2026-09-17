import React, { useState, useRef, useEffect } from 'react';
import { PROBLEMS, Problem, INITIAL_SUBMISSIONS as SUBMISSIONS, Submission, LEADERBOARD } from './problems';
import { evaluateCode, RunSummary } from './evaluator';

interface OutputLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  text: string;
}

export default function App() {
  const [history, setHistory] = useState<OutputLine[]>([
    {
      id: 'init-1',
      type: 'info',
      text: '============================================================\n  APEX ONLINE CODING JUDGE - TERMINAL EDITION (v1.0)\n  First Year Student Project\n============================================================\nType "help" for a list of commands, or "problems" to view problems.\n'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [currentProblem, setCurrentProblem] = useState<Problem>(PROBLEMS[0]);
  const [language, setLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>(PROBLEMS[0].starterCode['python']);
  const [submissionsList, setSubmissionsList] = useState<Submission[]>(SUBMISSIONS);

  const [editorMode, setEditorMode] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>(PROBLEMS[0].testCases[0]?.input || '');
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, editorMode]);

  const addLine = (text: string, type: OutputLine['type'] = 'output') => {
    setHistory(prev => [...prev, { id: Math.random().toString(36), type, text }]);
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (currentProblem.starterCode[newLang]) {
      setCode(currentProblem.starterCode[newLang]);
    }
  };

  const selectProblem = (prob: Problem) => {
    setCurrentProblem(prob);
    setCode(prob.starterCode[language] || prob.starterCode['python'] || '');
    setCustomInput(prob.testCases[0]?.input || '');
    setRunSummary(null);
  };

  const executeRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      const summary = evaluateCode(currentProblem, code, language);
      setRunSummary(summary);
      setIsRunning(false);

      let log = `\n--- RUN RESULTS: ${currentProblem.title} [${language}] ---\n`;
      summary.results.forEach((r, idx) => {
        log += `Testcase ${idx + 1}: ${r.passed ? 'PASSED' : 'FAILED'} (${r.runtime}ms)\n`;
        log += `  Input:    ${r.input.replace(/\n/g, ' ')}\n`;
        log += `  Expected: ${r.expected}\n`;
        log += `  Actual:   ${r.actual}\n`;
        if (r.error) log += `  Error:    ${r.error}\n`;
      });
      log += `Total Runtime: ${summary.totalRuntime}ms\nResult: ${summary.passedCount}/${summary.totalCount} passed\n`;
      addLine(log, summary.verdict === 'ACCEPTED' ? 'success' : 'error');
    }, 400);
  };

  const executeSubmit = () => {
    setIsRunning(true);
    setTimeout(() => {
      const summary = evaluateCode(currentProblem, code, language);
      setRunSummary(summary);
      setIsRunning(false);

      const subId = 'sub-' + (submissionsList.length + 101);
      const newSub: Submission = {
        id: subId,
        problemId: currentProblem.id,
        problemTitle: currentProblem.title,
        language,
        verdict: summary.verdict,
        runtime: summary.totalRuntime,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setSubmissionsList(prev => [newSub, ...prev]);

      let log = `\n============================================================\n`;
      log += `SUBMISSION RESULT [#${subId}]\n`;
      log += `Problem:  ${currentProblem.title} (#${currentProblem.id})\n`;
      log += `Language: ${language}\n`;
      log += `Verdict:  ${summary.verdict}\n`;
      log += `Passed:   ${summary.passedCount} / ${summary.totalCount} tests\n`;
      log += `Runtime:  ${summary.totalRuntime} ms\n`;
      log += `============================================================\n`;

      addLine(log, summary.verdict === 'ACCEPTED' ? 'success' : 'error');
    }, 600);
  };

  const handleCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    addLine(`student@judge:~$ ${trimmed}`, 'input');
    setCommandHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts[1];

    switch (cmd) {
      case 'help':
        addLine(
          `AVAILABLE COMMANDS:\n` +
          `  problems, ls          - List all available problems\n` +
          `  view <id>, cat <id>   - View problem description and testcases\n` +
          `  solve <id>            - Open the code editor for a problem\n` +
          `  editor                - Toggle code editor mode on/off\n` +
          `  run                   - Run code against test cases\n` +
          `  submit                - Submit code for evaluation\n` +
          `  submissions           - View recent submission records\n` +
          `  leaderboard           - Display student leaderboard rankings\n` +
          `  lang <python|cpp|...> - Switch active programming language\n` +
          `  clear, cls            - Clear the terminal screen\n` +
          `  about                 - About this college project\n`
        );
        break;

      case 'problems':
      case 'ls':
        let probList = 'ID   TITLE                   DIFFICULTY\n';
        probList += '--------------------------------------------------\n';
        PROBLEMS.forEach(p => {
          const idStr = p.id.toString().padEnd(4, ' ');
          const titleStr = p.title.padEnd(24, ' ');
          probList += `${idStr} ${titleStr} ${p.difficulty}\n`;
        });
        probList += '\nType "view <id>" (e.g. "view 1") or "solve <id>" to start.\n';
        addLine(probList);
        break;

      case 'view':
      case 'cat':
        if (!arg) {
          addLine('Error: Please provide problem ID. Example: view 1', 'error');
          break;
        }
        const probToView = PROBLEMS.find(p => p.id === parseInt(arg, 10) || p.slug === arg.toLowerCase());
        if (!probToView) {
          addLine(`Error: Problem "${arg}" not found. Type "problems" for list.`, 'error');
          break;
        }
        let detail = `\n============================================================\n`;
        detail += `PROBLEM #${probToView.id}: ${probToView.title} [${probToView.difficulty}]\n`;
        detail += `============================================================\n\n`;
        detail += `DESCRIPTION:\n${probToView.description}\n\n`;
        detail += `INPUT FORMAT:\n${probToView.inputFormat}\n\n`;
        detail += `OUTPUT FORMAT:\n${probToView.outputFormat}\n\n`;
        detail += `CONSTRAINTS:\n` + probToView.constraints.map(c => `  - ${c}`).join('\n') + `\n\n`;
        detail += `EXAMPLES:\n`;
        probToView.examples.forEach((ex, i) => {
          detail += `Example ${i + 1}:\n  Input:  ${ex.input.replace(/\n/g, ' ')}\n  Output: ${ex.output}\n`;
        });
        detail += `\nType "solve ${probToView.id}" to code solution.\n`;
        addLine(detail);
        break;

      case 'solve':
        if (arg) {
          const target = PROBLEMS.find(p => p.id === parseInt(arg, 10) || p.slug === arg.toLowerCase());
          if (!target) {
            addLine(`Error: Problem "${arg}" not found. Type "problems" for list.`, 'error');
            break;
          }
          selectProblem(target);
          setEditorMode(true);
          addLine(`Opened editor for Problem #${target.id}: ${target.title}. You can write your solution below.`);
        } else {
          setEditorMode(true);
          addLine(`Opened editor for Problem #${currentProblem.id}: ${currentProblem.title}.`);
        }
        break;

      case 'editor':
        setEditorMode(!editorMode);
        addLine(`Editor mode ${!editorMode ? 'enabled' : 'disabled'}.`);
        break;

      case 'lang':
        if (!arg) {
          addLine(`Current language is: ${language}. Options: python, javascript, cpp, java`);
          break;
        }
        const lowerLang = arg.toLowerCase();
        if (['python', 'javascript', 'cpp', 'java'].includes(lowerLang)) {
          handleLanguageChange(lowerLang);
          addLine(`Language changed to ${lowerLang}. Starter template loaded.`);
        } else {
          addLine(`Unsupported language "${arg}". Supported: python, javascript, cpp, java`, 'error');
        }
        break;

      case 'run':
        addLine(`Running solution for Problem #${currentProblem.id}: ${currentProblem.title}...`);
        executeRun();
        break;

      case 'submit':
        addLine(`Submitting solution for Problem #${currentProblem.id}: ${currentProblem.title}...`);
        executeSubmit();
        break;

      case 'submissions':
        let subText = 'SUB_ID   PROBLEM             LANG     VERDICT      TIME\n';
        subText += '----------------------------------------------------------\n';
        submissionsList.forEach(s => {
          const idStr = s.id.padEnd(8, ' ');
          const titleStr = s.problemTitle.substring(0, 18).padEnd(19, ' ');
          const langStr = s.language.padEnd(8, ' ');
          const verdictStr = s.verdict.padEnd(12, ' ');
          subText += `${idStr} ${titleStr} ${langStr} ${verdictStr} ${s.runtime}ms\n`;
        });
        addLine(subText);
        break;

      case 'leaderboard':
        let lbText = 'RANK  USERNAME        SOLVED  RATING\n';
        lbText += '------------------------------------\n';
        LEADERBOARD.forEach(u => {
          const rankStr = String(u.rank).padEnd(5, ' ');
          const nameStr = u.name.padEnd(15, ' ');
          const solvedStr = String(u.solved).padEnd(7, ' ');
          lbText += `${rankStr} ${nameStr} ${solvedStr} ${u.rating}\n`;
        });
        addLine(lbText);
        break;

      case 'clear':
      case 'cls':
        setHistory([]);
        break;

      case 'about':
        addLine(
          'Apex Online Judge (Terminal Edition)\n' +
          'A simple coding judge made by a first year computer science student.\n' +
          'Built with React, TypeScript, and a text terminal interface.\n' +
          'Supports multi-language problem verification and custom testcases.\n'
        );
        break;

      default:
        addLine(`Command not recognized: "${trimmed}". Type "help" for available commands.`, 'error');
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIndex = historyIndex + 1;
        if (nextIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInputVal('');
        } else {
          setHistoryIndex(nextIndex);
          setInputVal(commandHistory[nextIndex]);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d10] text-[#c9d1d9] p-2 sm:p-4 font-mono text-sm flex flex-col justify-between">
      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col border border-[#30363d] bg-[#0d1117] rounded shadow-lg overflow-hidden">
        <div className="bg-[#161b22] px-4 py-2 border-b border-[#30363d] flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-[#ff5f56]" />
            <span className="inline-block w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="inline-block w-3 h-3 rounded-full bg-[#27c93f]" />
            <span className="text-xs text-[#8b949e] ml-2 font-bold">student@judge-terminal: ~</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setEditorMode(false)}
              className={`px-2 py-0.5 rounded border ${
                !editorMode ? 'bg-[#21262d] text-white border-[#8b949e]' : 'text-[#8b949e] border-transparent hover:text-white'
              }`}
            >
              Terminal
            </button>
            <button
              onClick={() => setEditorMode(true)}
              className={`px-2 py-0.5 rounded border ${
                editorMode ? 'bg-[#21262d] text-white border-[#8b949e]' : 'text-[#8b949e] border-transparent hover:text-white'
              }`}
            >
              Editor
            </button>
          </div>
        </div>

        <div className="bg-[#0d1117] px-4 py-2 border-b border-[#21262d] flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => handleCommand('help')}
            className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-white rounded border border-[#30363d]"
          >
            help
          </button>
          <button
            onClick={() => handleCommand('problems')}
            className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-white rounded border border-[#30363d]"
          >
            problems
          </button>
          <button
            onClick={() => handleCommand(`solve ${currentProblem.id}`)}
            className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] rounded border border-[#30363d]"
          >
            solve #{currentProblem.id}
          </button>
          <button
            onClick={executeRun}
            disabled={isRunning}
            className="px-2 py-1 bg-[#238636] hover:bg-[#2ea043] text-white rounded font-bold disabled:opacity-50"
          >
            {isRunning ? 'running...' : 'run'}
          </button>
          <button
            onClick={executeSubmit}
            disabled={isRunning}
            className="px-2 py-1 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded font-bold disabled:opacity-50"
          >
            {isRunning ? 'judging...' : 'submit'}
          </button>
          <button
            onClick={() => handleCommand('submissions')}
            className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-white rounded border border-[#30363d]"
          >
            submissions
          </button>
          <button
            onClick={() => handleCommand('leaderboard')}
            className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-white rounded border border-[#30363d]"
          >
            leaderboard
          </button>
          <button
            onClick={() => handleCommand('clear')}
            className="px-2 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-white rounded border border-[#30363d]"
          >
            clear
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto max-h-[70vh] flex flex-col gap-4">
          {editorMode && (
            <div className="border border-[#30363d] rounded bg-[#0b0e14] p-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#21262d] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#58a6ff] font-bold">
                    Problem #{currentProblem.id}: {currentProblem.title}
                  </span>
                  <span className="text-xs text-[#8b949e]">({currentProblem.difficulty})</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[#8b949e]">Problem:</span>
                    <select
                      value={currentProblem.id}
                      onChange={(e) => {
                        const p = PROBLEMS.find(item => item.id === Number(e.target.value));
                        if (p) selectProblem(p);
                      }}
                      className="bg-[#161b22] text-white border border-[#30363d] rounded px-1.5 py-1 text-xs"
                    >
                      {PROBLEMS.map(p => (
                        <option key={p.id} value={p.id}>
                          #{p.id} {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[#8b949e]">Language:</span>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="bg-[#161b22] text-white border border-[#30363d] rounded px-1.5 py-1 text-xs"
                    >
                      <option value="python">Python 3</option>
                      <option value="javascript">JavaScript</option>
                      <option value="cpp">C++ 17</option>
                      <option value="java">Java 21</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-[#8b949e] mb-1 flex justify-between">
                  <span>Source Code ({language}):</span>
                  <button
                    onClick={() => setCode(currentProblem.starterCode[language] || '')}
                    className="text-[#58a6ff] hover:underline"
                  >
                    reset code
                  </button>
                </div>
                <textarea
                  rows={14}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  className="w-full bg-[#0d1117] text-[#58a6ff] p-3 rounded border border-[#30363d] font-mono text-xs focus:outline-none focus:border-[#58a6ff] resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#8b949e] block mb-1">Custom Test Input:</span>
                  <textarea
                    rows={2}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="w-full bg-[#0d1117] text-white p-2 rounded border border-[#30363d] font-mono text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[#8b949e] block mb-1">Expected Output:</span>
                  <div className="w-full bg-[#161b22] text-[#7ee787] p-2 rounded border border-[#30363d] font-mono text-xs min-h-[50px]">
                    {currentProblem.testCases[0]?.expected || 'true'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#21262d]">
                <div className="flex gap-2">
                  <button
                    onClick={executeRun}
                    disabled={isRunning}
                    className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-xs font-bold disabled:opacity-50"
                  >
                    {isRunning ? 'Running...' : 'Run Test Cases'}
                  </button>
                  <button
                    onClick={executeSubmit}
                    disabled={isRunning}
                    className="px-4 py-1.5 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded text-xs font-bold disabled:opacity-50"
                  >
                    {isRunning ? 'Submitting...' : 'Submit Solution'}
                  </button>
                </div>

                <button
                  onClick={() => setEditorMode(false)}
                  className="text-xs text-[#8b949e] hover:text-white"
                >
                  Close Editor
                </button>
              </div>

              {runSummary && (
                <div
                  className={`p-3 rounded border text-xs font-mono ${
                    runSummary.verdict === 'ACCEPTED'
                      ? 'bg-[#042111] border-[#238636] text-[#7ee787]'
                      : 'bg-[#2b1013] border-[#da3633] text-[#f85149]'
                  }`}
                >
                  <div className="font-bold">Verdict: {runSummary.verdict}</div>
                  <div>Tests Passed: {runSummary.passedCount} / {runSummary.totalCount}</div>
                  <div>Runtime: {runSummary.totalRuntime} ms</div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1">
            {history.map((line) => (
              <div
                key={line.id}
                className={`whitespace-pre-wrap leading-relaxed ${
                  line.type === 'input'
                    ? 'text-[#7ee787] font-semibold'
                    : line.type === 'error'
                    ? 'text-[#f85149]'
                    : line.type === 'success'
                    ? 'text-[#7ee787]'
                    : line.type === 'info'
                    ? 'text-[#58a6ff]'
                    : 'text-[#c9d1d9]'
                }`}
              >
                {line.text}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>

        <div className="bg-[#161b22] px-4 py-2 border-t border-[#30363d] flex items-center gap-2">
          <span className="text-[#7ee787] font-bold select-none">student@judge:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command (e.g. 'help', 'problems', 'solve 1')..."
            className="flex-1 bg-transparent border-none text-[#c9d1d9] focus:outline-none font-mono text-sm"
            autoFocus
          />
        </div>
      </div>

      <footer className="text-center text-xs text-[#8b949e] py-2">
        <span>Apex Online Coding Judge • Terminal Edition • Student Project</span>
      </footer>
    </div>
  );
}
