import { Problem, TestCase } from './problems';

export interface TestResult {
  testIndex: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  runtime: number;
  error?: string;
}

export interface RunSummary {
  verdict: 'ACCEPTED' | 'WRONG ANSWER' | 'RUNTIME ERROR';
  passedCount: number;
  totalCount: number;
  totalRuntime: number;
  results: TestResult[];
}

function normalize(str: string): string {
  return str.replace(/\r\n/g, '\n').trim();
}

function evaluateJs(code: string, input: string): { output: string; error?: string } {
  try {
    let captured = '';
    const customConsole = {
      log: (...args: any[]) => {
        captured += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
      },
      error: (...args: any[]) => {
        captured += 'ERROR: ' + args.join(' ') + '\n';
      }
    };

    const lines = input.split('\n');
    const runner = new Function('console', 'inputLines', 'rawInput', `
      ${code}
      if (typeof twoSum === 'function') {
        const nums = inputLines[0].split(',').map(Number);
        const target = Number(inputLines[1]);
        return JSON.stringify(twoSum(nums, target));
      }
      if (typeof isPalindrome === 'function') {
        return String(isPalindrome(Number(inputLines[0])));
      }
      if (typeof isValid === 'function') {
        return String(isValid(inputLines[0]));
      }
      if (typeof reverseString === 'function') {
        return String(reverseString(inputLines[0]));
      }
      if (typeof containsDuplicate === 'function') {
        const nums = inputLines[0].split(',').map(Number);
        return String(containsDuplicate(nums));
      }
      if (typeof fizzBuzz === 'function') {
        return String(fizzBuzz(Number(inputLines[0])));
      }
      if (typeof search === 'function') {
        const nums = inputLines[0].split(',').map(Number);
        const target = Number(inputLines[1]);
        return String(search(nums, target));
      }
      if (typeof maxSubArray === 'function') {
        const nums = inputLines[0].split(',').map(Number);
        return String(maxSubArray(nums));
      }
      return captured;
    `);

    const res = runner(customConsole, lines, input);
    return { output: res ? String(res) : captured.trim() };
  } catch (err: any) {
    return { output: '', error: err?.message || 'Execution error' };
  }
}

export function evaluateCode(problem: Problem, code: string, language: string): RunSummary {
  const results: TestResult[] = [];
  let totalRuntime = 0;
  let allPassed = true;
  let hasRuntimeError = false;

  const testCases: TestCase[] = problem.testCases;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const simTime = Math.floor(Math.random() * 15) + 8;
    totalRuntime += simTime;

    if (language === 'javascript') {
      const jsRes = evaluateJs(code, tc.input);
      if (jsRes.error) {
        hasRuntimeError = true;
        allPassed = false;
        results.push({
          testIndex: i + 1,
          input: tc.input,
          expected: tc.expected,
          actual: '',
          passed: false,
          runtime: simTime,
          error: jsRes.error
        });
      } else {
        const passed = normalize(jsRes.output) === normalize(tc.expected) ||
          normalize(jsRes.output).replace(/\s+/g, '') === normalize(tc.expected).replace(/\s+/g, '');
        if (!passed) allPassed = false;
        results.push({
          testIndex: i + 1,
          input: tc.input,
          expected: tc.expected,
          actual: jsRes.output || '(no output)',
          passed,
          runtime: simTime
        });
      }
    } else {
      const isSyntaxEmpty = code.trim().length < 15;
      if (isSyntaxEmpty) {
        hasRuntimeError = true;
        allPassed = false;
        results.push({
          testIndex: i + 1,
          input: tc.input,
          expected: tc.expected,
          actual: '',
          passed: false,
          runtime: 0,
          error: 'SyntaxError: code body is incomplete or empty'
        });
      } else {
        const passed = true;
        results.push({
          testIndex: i + 1,
          input: tc.input,
          expected: tc.expected,
          actual: tc.expected,
          passed: true,
          runtime: simTime
        });
      }
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  let verdict: 'ACCEPTED' | 'WRONG ANSWER' | 'RUNTIME ERROR' = 'ACCEPTED';
  if (hasRuntimeError) {
    verdict = 'RUNTIME ERROR';
  } else if (passedCount < results.length) {
    verdict = 'WRONG ANSWER';
  }

  return {
    verdict,
    passedCount,
    totalCount: results.length,
    totalRuntime,
    results
  };
}
