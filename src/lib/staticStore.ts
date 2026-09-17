import {
  User,
  Problem,
  Submission,
  Contest,
  ContestLeaderboardEntry,
  Discussion,
  Comment,
  SupportedLanguage,
  TestCaseResult,
  Verdict
} from '../types';
import { INITIAL_PROBLEMS, FullProblem } from '../data/problemsData';
import {
  INITIAL_USERS,
  INITIAL_CONTESTS,
  INITIAL_CONTEST_LEADERBOARD,
  INITIAL_DISCUSSIONS,
  INITIAL_COMMENTS
} from '../data/seedData';

// Storage Keys
const STORAGE_PREFIX = 'apex_static_';
const KEY_PROBLEMS = `${STORAGE_PREFIX}problems`;
const KEY_USERS = `${STORAGE_PREFIX}users`;
const KEY_SUBMISSIONS = `${STORAGE_PREFIX}submissions`;
const KEY_DISCUSSIONS = `${STORAGE_PREFIX}discussions`;
const KEY_COMMENTS = `${STORAGE_PREFIX}comments`;
const KEY_CURRENT_USER = `${STORAGE_PREFIX}current_user_id`;

// Initialize Local Storage if not present
function loadFromStorage<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function saveToStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Storage might be restricted
  }
}

// Ensure initial seed
export function initStaticStore(): void {
  if (!localStorage.getItem(KEY_PROBLEMS)) {
    saveToStorage(KEY_PROBLEMS, INITIAL_PROBLEMS);
  }
  if (!localStorage.getItem(KEY_USERS)) {
    saveToStorage(KEY_USERS, INITIAL_USERS);
  }
  if (!localStorage.getItem(KEY_DISCUSSIONS)) {
    saveToStorage(KEY_DISCUSSIONS, INITIAL_DISCUSSIONS);
  }
  if (!localStorage.getItem(KEY_COMMENTS)) {
    saveToStorage(KEY_COMMENTS, INITIAL_COMMENTS);
  }
  if (!localStorage.getItem(KEY_CURRENT_USER)) {
    saveToStorage(KEY_CURRENT_USER, 'u-user'); // Default to alex_coder
  }
  if (!localStorage.getItem(KEY_SUBMISSIONS)) {
    // Seed sample submissions
    const sampleSubs: Submission[] = [
      {
        id: 'sub-init-1',
        problemId: 'p-1',
        problemSlug: 'two-sum',
        problemTitle: 'Two Sum',
        userId: 'u-user',
        username: 'alex_coder',
        language: 'java',
        code: `import java.util.HashMap;\nimport java.util.Map;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int comp = target - nums[i];\n            if (map.containsKey(comp)) return new int[]{map.get(comp), i};\n            map.put(nums[i], i);\n        }\n        return new int[]{0, 1};\n    }\n}`,
        status: 'COMPLETED',
        verdict: 'ACCEPTED',
        runtimeMs: 4,
        memoryMb: 34.2,
        passedTests: 5,
        totalTests: 5,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    saveToStorage(KEY_SUBMISSIONS, sampleSubs);
  }
}

// Run initial store setup
if (typeof window !== 'undefined') {
  initStaticStore();
}

export const staticStore = {
  login(identifier: string): { user: User; accessToken: string; refreshToken: string } {
    const users = loadFromStorage<User[]>(KEY_USERS, INITIAL_USERS);
    let user = users.find(u => u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase());
    if (!user) {
      user = users[1] || users[0]; // fallback to demo user
    }
    saveToStorage(KEY_CURRENT_USER, user.id);
    return {
      user,
      accessToken: 'static_token_' + user.id,
      refreshToken: 'static_refresh_' + user.id
    };
  },

  register(username: string, email: string): { user: User; accessToken: string; refreshToken: string } {
    const users = loadFromStorage<User[]>(KEY_USERS, INITIAL_USERS);
    const newUser: User = {
      id: `u-${Date.now()}`,
      username,
      email,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: 'Competitive programmer and algorithm enthusiast.',
      rating: 1500,
      solvedCount: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      currentStreak: 1,
      longestStreak: 1,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveToStorage(KEY_USERS, users);
    saveToStorage(KEY_CURRENT_USER, newUser.id);
    return {
      user: newUser,
      accessToken: 'static_token_' + newUser.id,
      refreshToken: 'static_refresh_' + newUser.id
    };
  },

  getCurrentUser(): { user: User } {
    const users = loadFromStorage<User[]>(KEY_USERS, INITIAL_USERS);
    const currId = loadFromStorage<string>(KEY_CURRENT_USER, 'u-user');
    const user = users.find(u => u.id === currId) || users[1] || users[0];
    return { user };
  },

  getProblems(params?: { search?: string; difficulty?: string; tag?: string; page?: number; limit?: number; sort?: string }) {
    let list: Problem[] = loadFromStorage<FullProblem[]>(KEY_PROBLEMS, INITIAL_PROBLEMS);
    if (params?.difficulty && params.difficulty !== 'ALL') {
      list = list.filter(p => p.difficulty === params.difficulty);
    }
    if (params?.tag && params.tag !== 'All') {
      list = list.filter(p => p.tags.includes(params.tag!));
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }
    const page = params?.page || 1;
    const limit = params?.limit || 100;
    const start = (page - 1) * limit;
    const paged = list.slice(start, start + limit);
    return {
      problems: paged,
      total: list.length,
      page,
      limit,
      totalPages: Math.ceil(list.length / limit)
    };
  },

  getProblemBySlug(slug: string): Problem {
    const list = loadFromStorage<FullProblem[]>(KEY_PROBLEMS, INITIAL_PROBLEMS);
    const prob = list.find(p => p.slug === slug || p.id === slug);
    if (!prob) {
      throw new Error(`Problem not found: ${slug}`);
    }
    return prob;
  },

  runCode(problemId: string, language: SupportedLanguage, code: string, customTestCases?: { input: string; expectedOutput?: string }[]) {
    const list = loadFromStorage<FullProblem[]>(KEY_PROBLEMS, INITIAL_PROBLEMS);
    const prob = list.find(p => p.id === problemId || p.slug === problemId);
    
    const cases = customTestCases && customTestCases.length > 0 
      ? customTestCases 
      : (prob?.examples.map(e => ({ input: e.input, expectedOutput: e.output })) || [{ input: '', expectedOutput: '' }]);

    const results: TestCaseResult[] = cases.map((tc, idx) => {
      const passed = !code.includes('throw') && !code.includes('error') && code.length > 20;
      return {
        testIndex: idx + 1,
        isPublic: true,
        passed,
        input: tc.input,
        expectedOutput: tc.expectedOutput || '',
        actualOutput: passed ? (tc.expectedOutput || 'Output') : 'Wrong Answer or Syntax Error',
        runtimeMs: Math.floor(8 + Math.random() * 25)
      };
    });

    const allPassed = results.every(r => r.passed);
    return {
      status: (allPassed ? 'PASSED' : 'FAILED') as 'PASSED' | 'FAILED',
      runtimeMs: Math.max(...results.map(r => r.runtimeMs)),
      results
    };
  },

  submitCode(problemId: string, language: SupportedLanguage, code: string): Submission {
    const list = loadFromStorage<FullProblem[]>(KEY_PROBLEMS, INITIAL_PROBLEMS);
    const prob = list.find(p => p.id === problemId || p.slug === problemId);
    const currentUser = this.getCurrentUser().user;

    const isAccepted = !code.includes('throw') && !code.includes('SyntaxError') && code.length > 30;
    const verdict: Verdict = isAccepted ? 'ACCEPTED' : 'WRONG_ANSWER';
    const totalTests = 5;
    const passedTests = isAccepted ? totalTests : Math.floor(Math.random() * 3);

    const submission: Submission = {
      id: `sub-${Date.now()}`,
      problemId: prob?.id || problemId,
      problemSlug: prob?.slug || problemId,
      problemTitle: prob?.title || 'Problem',
      userId: currentUser.id,
      username: currentUser.username,
      language,
      code,
      status: 'COMPLETED',
      verdict,
      runtimeMs: isAccepted ? Math.floor(12 + Math.random() * 40) : 0,
      memoryMb: Math.floor(30 + Math.random() * 12),
      passedTests,
      totalTests,
      createdAt: new Date().toISOString()
    };

    const subs = loadFromStorage<Submission[]>(KEY_SUBMISSIONS, []);
    subs.unshift(submission);
    saveToStorage(KEY_SUBMISSIONS, subs);

    if (isAccepted && prob) {
      const users = loadFromStorage<User[]>(KEY_USERS, INITIAL_USERS);
      const u = users.find(x => x.id === currentUser.id);
      if (u) {
        u.solvedCount = (u.solvedCount || 0) + 1;
        if (prob.difficulty === 'EASY') u.easySolved = (u.easySolved || 0) + 1;
        if (prob.difficulty === 'MEDIUM') u.mediumSolved = (u.mediumSolved || 0) + 1;
        if (prob.difficulty === 'HARD') u.hardSolved = (u.hardSolved || 0) + 1;
        saveToStorage(KEY_USERS, users);
      }
    }

    return submission;
  },

  getSubmission(id: string): Submission {
    const subs = loadFromStorage<Submission[]>(KEY_SUBMISSIONS, []);
    const sub = subs.find(s => s.id === id);
    if (!sub) throw new Error('Submission not found');
    return sub;
  },

  getSubmissions(params?: { problemId?: string; userId?: string; limit?: number }): Submission[] {
    let subs = loadFromStorage<Submission[]>(KEY_SUBMISSIONS, []);
    if (params?.problemId) {
      subs = subs.filter(s => s.problemId === params.problemId || s.problemSlug === params.problemId);
    }
    if (params?.userId) {
      subs = subs.filter(s => s.userId === params.userId);
    }
    if (params?.limit) {
      subs = subs.slice(0, params.limit);
    }
    return subs;
  },

  getContests(): Contest[] {
    return INITIAL_CONTESTS;
  },

  getContest(id: string): Contest {
    const c = INITIAL_CONTESTS.find(x => x.id === id || x.slug === id);
    if (!c) throw new Error('Contest not found');
    return c;
  },

  getContestLeaderboard(id: string): ContestLeaderboardEntry[] {
    return INITIAL_CONTEST_LEADERBOARD[id] || INITIAL_CONTEST_LEADERBOARD['c-42'] || [];
  },

  getGlobalLeaderboard(): any[] {
    const users = loadFromStorage<User[]>(KEY_USERS, INITIAL_USERS);
    return [...users]
      .sort((a, b) => b.rating - a.rating)
      .map((u, i) => ({
        rank: i + 1,
        user: u,
        rating: u.rating,
        solvedCount: u.solvedCount
      }));
  },

  getUserProfile(username: string) {
    const users = loadFromStorage<User[]>(KEY_USERS, INITIAL_USERS);
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase()) || users[0];
    const subs = this.getSubmissions({ userId: user.id });
    return {
      user,
      stats: {
        totalSubmissions: subs.length,
        acceptedSubmissions: subs.filter(s => s.verdict === 'ACCEPTED').length,
        acceptanceRate: subs.length > 0 ? Math.round((subs.filter(s => s.verdict === 'ACCEPTED').length / subs.length) * 100) : 0
      }
    };
  },

  getDiscussions(problemId?: string): Discussion[] {
    let list = loadFromStorage<Discussion[]>(KEY_DISCUSSIONS, INITIAL_DISCUSSIONS);
    if (problemId) {
      list = list.filter(d => d.problemId === problemId);
    }
    return list;
  },

  getDiscussion(id: string): { discussion: Discussion; comments: Comment[] } {
    const list = loadFromStorage<Discussion[]>(KEY_DISCUSSIONS, INITIAL_DISCUSSIONS);
    const disc = list.find(d => d.id === id);
    if (!disc) throw new Error('Discussion not found');
    const comments = loadFromStorage<Comment[]>(KEY_COMMENTS, INITIAL_COMMENTS).filter(c => c.discussionId === id);
    return { discussion: disc, comments };
  },

  createDiscussion(data: { problemId?: string; title: string; content: string; tags?: string[] }): Discussion {
    const list = loadFromStorage<Discussion[]>(KEY_DISCUSSIONS, INITIAL_DISCUSSIONS);
    const user = this.getCurrentUser().user;
    const newDisc: Discussion = {
      id: `d-${Date.now()}`,
      problemId: data.problemId,
      problemTitle: data.problemId ? 'Discussion' : undefined,
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      title: data.title,
      content: data.content,
      tags: data.tags || ['General'],
      upvotes: 1,
      upvotedBy: [user.id],
      commentCount: 0,
      createdAt: new Date().toISOString()
    };
    list.unshift(newDisc);
    saveToStorage(KEY_DISCUSSIONS, list);
    return newDisc;
  },

  voteDiscussion(id: string): Discussion {
    const list = loadFromStorage<Discussion[]>(KEY_DISCUSSIONS, INITIAL_DISCUSSIONS);
    const disc = list.find(d => d.id === id);
    if (!disc) throw new Error('Discussion not found');
    const user = this.getCurrentUser().user;
    if (disc.upvotedBy.includes(user.id)) {
      disc.upvotedBy = disc.upvotedBy.filter(uid => uid !== user.id);
      disc.upvotes = Math.max(0, disc.upvotes - 1);
    } else {
      disc.upvotedBy.push(user.id);
      disc.upvotes += 1;
    }
    saveToStorage(KEY_DISCUSSIONS, list);
    return disc;
  },

  addComment(discussionId: string, content: string): Comment {
    const comments = loadFromStorage<Comment[]>(KEY_COMMENTS, INITIAL_COMMENTS);
    const user = this.getCurrentUser().user;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      discussionId,
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      content,
      upvotes: 0,
      upvotedBy: [],
      createdAt: new Date().toISOString()
    };
    comments.push(newComment);
    saveToStorage(KEY_COMMENTS, comments);

    const list = loadFromStorage<Discussion[]>(KEY_DISCUSSIONS, INITIAL_DISCUSSIONS);
    const disc = list.find(d => d.id === discussionId);
    if (disc) {
      disc.commentCount = (disc.commentCount || 0) + 1;
      saveToStorage(KEY_DISCUSSIONS, list);
    }

    return newComment;
  },

  createProblem(problemData: any): Problem {
    const list = loadFromStorage<FullProblem[]>(KEY_PROBLEMS, INITIAL_PROBLEMS);
    const newProb: FullProblem = {
      ...problemData,
      id: `p-${Date.now()}`,
      slug: problemData.slug || problemData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      acceptanceRate: 100,
      totalSubmissions: 0,
      totalAccepted: 0,
      timeLimitMs: problemData.timeLimitMs || 2000,
      memoryLimitMb: problemData.memoryLimitMb || 256,
      examples: problemData.examples || [],
      hiddenTestCases: problemData.hiddenTestCases || [],
      starterCode: problemData.starterCode || {
        java: '// Java 21 solution\nclass Solution {\n    public void solve() {\n    }\n}',
        python: '# Python 3 solution\ndef solve():\n    pass',
        javascript: '// JavaScript solution\nfunction solve() {\n}',
        cpp: '// C++ solution\n#include <iostream>\nusing namespace std;\nint main() {\n    return 0;\n}'
      },
      createdAt: new Date().toISOString()
    };
    list.unshift(newProb);
    saveToStorage(KEY_PROBLEMS, list);
    return newProb;
  },

  updateProblem(id: string, updates: any): Problem {
    const list = loadFromStorage<FullProblem[]>(KEY_PROBLEMS, INITIAL_PROBLEMS);
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Problem not found');
    list[idx] = { ...list[idx], ...updates };
    saveToStorage(KEY_PROBLEMS, list);
    return list[idx];
  },

  deleteProblem(id: string): { success: boolean } {
    let list = loadFromStorage<FullProblem[]>(KEY_PROBLEMS, INITIAL_PROBLEMS);
    list = list.filter(p => p.id !== id);
    saveToStorage(KEY_PROBLEMS, list);
    return { success: true };
  }
};
