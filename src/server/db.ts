import EventEmitter from 'events';
import bcrypt from 'bcryptjs';
import {
  User,
  Problem,
  Submission,
  SubmissionStatus,
  Verdict,
  Contest,
  ContestLeaderboardEntry,
  Badge,
  Discussion,
  Comment,
  SupportedLanguage,
  TestCaseResult
} from '../types';
import { INITIAL_PROBLEMS, FullProblem } from '../data/problemsData';
import {
  INITIAL_USERS,
  INITIAL_BADGES,
  INITIAL_CONTESTS,
  INITIAL_CONTEST_LEADERBOARD,
  INITIAL_DISCUSSIONS,
  INITIAL_COMMENTS
} from '../data/seedData';
import { runTestCase, evaluateCode } from './judgeEngine';

export const eventBus = new EventEmitter();

interface DBUser extends User {
  passwordHash: string;
}

class Database {
  private users: Map<string, DBUser> = new Map();
  private problems: Map<string, FullProblem> = new Map();
  private submissions: Map<string, Submission> = new Map();
  private contests: Map<string, Contest> = new Map();
  private contestLeaderboards: Map<string, ContestLeaderboardEntry[]> = new Map();
  private badges: Map<string, Badge> = new Map();
  private discussions: Map<string, Discussion> = new Map();
  private comments: Map<string, Comment[]> = new Map();
  private submissionQueue: string[] = [];
  private isProcessingQueue = false;

  constructor() {
    this.seed();
    this.startQueueWorker();
  }

  private seed() {
    // Seed users with bcrypt hashed passwords ('password123')
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('password123', salt);

    INITIAL_USERS.forEach(user => {
      this.users.set(user.id, {
        ...user,
        passwordHash: hash
      });
    });

    // Seed problems
    INITIAL_PROBLEMS.forEach(prob => {
      this.problems.set(prob.id, { ...prob });
    });

    // Seed badges
    INITIAL_BADGES.forEach(badge => {
      this.badges.set(badge.id, { ...badge });
    });

    // Seed contests
    INITIAL_CONTESTS.forEach(contest => {
      this.contests.set(contest.id, { ...contest });
    });

    // Seed contest leaderboards
    Object.entries(INITIAL_CONTEST_LEADERBOARD).forEach(([cId, board]) => {
      this.contestLeaderboards.set(cId, [...board]);
    });

    // Seed discussions
    INITIAL_DISCUSSIONS.forEach(disc => {
      this.discussions.set(disc.id, { ...disc });
    });

    // Seed comments
    INITIAL_COMMENTS.forEach(c => {
      const list = this.comments.get(c.discussionId) || [];
      list.push(c);
      this.comments.set(c.discussionId, list);
    });

    // Seed some initial submissions to show in submissions feed
    const sampleSubmissions: Submission[] = [
      {
        id: 'sub-init-1',
        problemId: 'p-1',
        problemTitle: 'Two Sum',
        problemSlug: 'two-sum',
        userId: 'u-3',
        username: 'elena_k',
        language: 'python',
        code: INITIAL_PROBLEMS[0].starterCode.python,
        status: 'COMPLETED',
        verdict: 'ACCEPTED',
        runtimeMs: 18,
        memoryMb: 14.8,
        passedTests: 6,
        totalTests: 6,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        percentileBeat: 94.2
      },
      {
        id: 'sub-init-2',
        problemId: 'p-2',
        problemTitle: 'Valid Parentheses',
        problemSlug: 'valid-parentheses',
        userId: 'u-user',
        username: 'alex_coder',
        language: 'javascript',
        code: INITIAL_PROBLEMS[1].starterCode.javascript,
        status: 'COMPLETED',
        verdict: 'ACCEPTED',
        runtimeMs: 42,
        memoryMb: 23.1,
        passedTests: 7,
        totalTests: 7,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        percentileBeat: 81.5
      },
      {
        id: 'sub-init-3',
        problemId: 'p-8',
        problemTitle: 'Trapping Rain Water',
        problemSlug: 'trapping-rain-water',
        userId: 'u-4',
        username: 'zenith_algo',
        language: 'cpp',
        code: INITIAL_PROBLEMS[7].starterCode.cpp,
        status: 'COMPLETED',
        verdict: 'ACCEPTED',
        runtimeMs: 8,
        memoryMb: 12.4,
        passedTests: 5,
        totalTests: 5,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        percentileBeat: 98.7
      }
    ];

    sampleSubmissions.forEach(sub => {
      this.submissions.set(sub.id, sub);
    });
  }

  // --- Users ---
  public getUsers(): User[] {
    return Array.from(this.users.values()).map(({ passwordHash, ...user }) => user);
  }

  public getUserById(id: string): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  public getUserByEmailOrUsername(identifier: string): DBUser | undefined {
    return Array.from(this.users.values()).find(
      u => u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase()
    );
  }

  public createUser(userData: { username: string; email: string; passwordHash: string; role?: 'USER' | 'ADMIN' }): User {
    const id = 'u-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newUser: DBUser = {
      id,
      username: userData.username,
      email: userData.email,
      passwordHash: userData.passwordHash,
      role: userData.role || 'USER',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${userData.username}`,
      bio: 'New coder on Apex Judge ready to solve algorithmic challenges.',
      rating: 1500,
      solvedCount: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      currentStreak: 1,
      longestStreak: 1,
      createdAt: new Date().toISOString()
    };
    this.users.set(id, newUser);
    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  // --- Problems ---
  public getProblems(includeHidden: boolean = false): Problem[] {
    return Array.from(this.problems.values()).map(prob => {
      if (includeHidden) return prob;
      // Strip hidden test cases from public responses
      const { hiddenTestCases, ...safeProblem } = prob;
      return safeProblem;
    });
  }

  public getProblemBySlug(slug: string, includeHidden: boolean = false): Problem | undefined {
    const prob = Array.from(this.problems.values()).find(p => p.slug === slug);
    if (!prob) return undefined;
    if (includeHidden) return prob;
    const { hiddenTestCases, ...safeProblem } = prob;
    return safeProblem;
  }

  public getProblemById(id: string, includeHidden: boolean = false): FullProblem | undefined {
    const prob = this.problems.get(id);
    if (!prob) return undefined;
    if (includeHidden) return prob;
    const { hiddenTestCases, ...safeProblem } = prob;
    return safeProblem as FullProblem;
  }

  public createProblem(data: Partial<FullProblem>): Problem {
    const id = 'p-' + (this.problems.size + 1);
    const slug = data.slug || data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `problem-${id}`;
    const newProblem: FullProblem = {
      id,
      slug,
      title: data.title || 'Untitled Problem',
      difficulty: data.difficulty || 'MEDIUM',
      tags: data.tags || ['Arrays'],
      description: data.description || '',
      inputFormat: data.inputFormat || '',
      outputFormat: data.outputFormat || '',
      constraints: data.constraints || [],
      examples: data.examples || [],
      starterCode: data.starterCode || {
        python: '# Solution\n',
        javascript: '// Solution\n',
        java: 'public class Solution {}\n',
        cpp: '#include <iostream>\nint main() { return 0; }\n'
      },
      timeLimitMs: data.timeLimitMs || 2000,
      memoryLimitMb: data.memoryLimitMb || 256,
      acceptanceRate: 0,
      totalSubmissions: 0,
      totalAccepted: 0,
      testCases: data.testCases || [],
      hiddenTestCases: data.hiddenTestCases || []
    };
    this.problems.set(id, newProblem);
    const { hiddenTestCases, ...safe } = newProblem;
    return safe;
  }

  public updateProblem(id: string, updates: Partial<FullProblem>): Problem | undefined {
    const existing = this.problems.get(id);
    if (!existing) return undefined;
    const updated: FullProblem = { ...existing, ...updates };
    this.problems.set(id, updated);
    const { hiddenTestCases, ...safe } = updated;
    return safe;
  }

  public deleteProblem(id: string): boolean {
    return this.problems.delete(id);
  }

  // --- Submissions & Queue ---
  public queueSubmission(data: {
    problemId: string;
    userId: string;
    language: SupportedLanguage;
    code: string;
  }): Submission {
    const problem = this.problems.get(data.problemId);
    if (!problem) throw new Error('Problem not found');
    const user = this.users.get(data.userId);
    if (!user) throw new Error('User not found');

    const id = 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const submission: Submission = {
      id,
      problemId: problem.id,
      problemTitle: problem.title,
      problemSlug: problem.slug,
      userId: user.id,
      username: user.username,
      language: data.language,
      code: data.code,
      status: 'QUEUED',
      verdict: 'PENDING',
      runtimeMs: 0,
      memoryMb: 0,
      passedTests: 0,
      totalTests: (problem.testCases?.length || 0) + (problem.hiddenTestCases?.length || 0),
      createdAt: new Date().toISOString()
    };

    this.submissions.set(id, submission);
    this.submissionQueue.push(id);
    this.emitSubmissionUpdate(submission);

    // Trigger queue processing asynchronously
    setImmediate(() => this.processQueue());

    return submission;
  }

  public getSubmission(id: string, includeHiddenDetails: boolean = false): Submission | undefined {
    const sub = this.submissions.get(id);
    if (!sub) return undefined;
    if (includeHiddenDetails) return sub;

    // Filter out inputs and expected outputs of hidden test cases from results
    if (sub.testResults) {
      return {
        ...sub,
        testResults: sub.testResults.map(tr => ({
          ...tr,
          input: tr.isPublic ? tr.input : undefined,
          expectedOutput: tr.isPublic ? tr.expectedOutput : undefined,
          actualOutput: tr.isPublic ? tr.actualOutput : undefined
        }))
      };
    }
    return sub;
  }

  public getSubmissions(filter?: { problemId?: string; userId?: string; status?: string }): Submission[] {
    let list = Array.from(this.submissions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (filter?.problemId) list = list.filter(s => s.problemId === filter.problemId);
    if (filter?.userId) list = list.filter(s => s.userId === filter.userId);
    return list;
  }

  // --- Queue Worker ---
  private startQueueWorker() {
    setInterval(() => {
      if (this.submissionQueue.length > 0 && !this.isProcessingQueue) {
        this.processQueue();
      }
    }, 500);
  }

  private async processQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.submissionQueue.length > 0) {
      const subId = this.submissionQueue.shift();
      if (!subId) continue;
      const sub = this.submissions.get(subId);
      if (!sub) continue;

      const problem = this.problems.get(sub.problemId);
      if (!problem) continue;

      try {
        // Step 1: COMPILING
        sub.status = 'COMPILING';
        this.emitSubmissionUpdate(sub);
        await new Promise(r => setTimeout(r, 200));

        // Step 2: RUNNING
        sub.status = 'RUNNING';
        this.emitSubmissionUpdate(sub);

        const allTests: { input: string; expectedOutput: string; isPublic: boolean }[] = [
          ...(problem.testCases || []).map(tc => ({ ...tc, isPublic: true })),
          ...(problem.hiddenTestCases || []).map(tc => ({ ...tc, isPublic: false }))
        ];

        sub.totalTests = allTests.length;
        const testResults: TestCaseResult[] = [];
        let finalVerdict: Verdict = 'ACCEPTED';
        let maxRuntime = 0;
        let maxMemory = 0;
        let passedCount = 0;
        let errorMsg: string | undefined;

        for (let i = 0; i < allTests.length; i++) {
          const tc = allTests[i];
          const tr = await runTestCase(sub.language, sub.code, tc, i + 1, problem.timeLimitMs, problem.memoryLimitMb);
          testResults.push(tr);

          maxRuntime = Math.max(maxRuntime, tr.runtimeMs);
          if (tr.passed) {
            passedCount++;
            sub.passedTests = passedCount;
            this.emitSubmissionUpdate(sub);
          } else {
            // Determine verdict
            if (tr.error?.includes('Time Limit Exceeded')) {
              finalVerdict = 'TIME_LIMIT_EXCEEDED';
            } else if (tr.error?.includes('COMPILATION_ERROR')) {
              finalVerdict = 'COMPILATION_ERROR';
            } else if (tr.error) {
              finalVerdict = 'RUNTIME_ERROR';
            } else {
              finalVerdict = 'WRONG_ANSWER';
            }
            errorMsg = tr.error;
            break;
          }
        }

        // Step 3: JUDGING
        sub.status = 'JUDGING';
        this.emitSubmissionUpdate(sub);
        await new Promise(r => setTimeout(r, 150));

        // Step 4: COMPLETED
        sub.status = 'COMPLETED';
        sub.verdict = finalVerdict;
        sub.runtimeMs = maxRuntime;
        sub.memoryMb = Math.round((14 + Math.random() * 8) * 10) / 10;
        sub.passedTests = passedCount;
        sub.testResults = testResults;
        sub.errorDetails = errorMsg;
        sub.percentileBeat = Math.min(99.4, Math.max(12.5, Math.round((100 - (maxRuntime / (problem.timeLimitMs || 2000)) * 60) * 10) / 10));

        // Update problem statistics
        problem.totalSubmissions = (problem.totalSubmissions || 0) + 1;
        if (finalVerdict === 'ACCEPTED') {
          problem.totalAccepted = (problem.totalAccepted || 0) + 1;
        }
        problem.acceptanceRate = Math.round((problem.totalAccepted / problem.totalSubmissions) * 1000) / 10;

        // Update user statistics and badges
        this.updateUserStatsAfterSubmission(sub.userId, sub.problemId, problem.difficulty, finalVerdict, maxRuntime);

        this.emitSubmissionUpdate(sub);
      } catch (err: any) {
        sub.status = 'COMPLETED';
        sub.verdict = 'INTERNAL_ERROR';
        sub.errorDetails = err.message;
        this.emitSubmissionUpdate(sub);
      }
    }

    this.isProcessingQueue = false;
  }

  private updateUserStatsAfterSubmission(
    userId: string,
    problemId: string,
    difficulty: string,
    verdict: Verdict,
    runtimeMs: number
  ) {
    const user = this.users.get(userId);
    if (!user) return;

    if (verdict === 'ACCEPTED') {
      // Check if user has already solved this problem
      const userPrevAccepted = Array.from(this.submissions.values()).some(
        s => s.userId === userId && s.problemId === problemId && s.verdict === 'ACCEPTED' && s.id !== s.id
      );

      if (!userPrevAccepted) {
        user.solvedCount += 1;
        if (difficulty === 'EASY') user.easySolved += 1;
        else if (difficulty === 'MEDIUM') user.mediumSolved += 1;
        else if (difficulty === 'HARD') user.hardSolved += 1;
        user.rating = Math.min(3000, user.rating + (difficulty === 'HARD' ? 25 : difficulty === 'MEDIUM' ? 15 : 8));
      }
    }
  }

  private emitSubmissionUpdate(sub: Submission) {
    eventBus.emit(`submission:${sub.id}`, sub);
    eventBus.emit('submission:any', sub);
  }

  // --- Contests ---
  public getContests(): Contest[] {
    return Array.from(this.contests.values()).sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  public getContestById(id: string): Contest | undefined {
    return this.contests.get(id);
  }

  public getContestLeaderboard(contestId: string): ContestLeaderboardEntry[] {
    return this.contestLeaderboards.get(contestId) || [];
  }

  public createContest(data: Partial<Contest>): Contest {
    const id = 'c-' + Date.now();
    const contest: Contest = {
      id,
      title: data.title || 'New Contest',
      slug: data.slug || `contest-${id}`,
      description: data.description || '',
      startTime: data.startTime || new Date().toISOString(),
      endTime: data.endTime || new Date(Date.now() + 7200000).toISOString(),
      durationMinutes: data.durationMinutes || 120,
      status: data.status || 'UPCOMING',
      problems: data.problems || [],
      participantsCount: 0
    };
    this.contests.set(id, contest);
    this.contestLeaderboards.set(id, []);
    return contest;
  }

  // --- Discussions & Comments ---
  public getDiscussions(problemId?: string): Discussion[] {
    let list = Array.from(this.discussions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (problemId) list = list.filter(d => d.problemId === problemId);
    return list;
  }

  public getDiscussionById(id: string): Discussion | undefined {
    return this.discussions.get(id);
  }

  public createDiscussion(data: {
    problemId?: string;
    userId: string;
    title: string;
    content: string;
    tags?: string[];
  }): Discussion {
    const user = this.users.get(data.userId);
    if (!user) throw new Error('User not found');

    const prob = data.problemId ? this.problems.get(data.problemId) : undefined;
    const id = 'd-' + Date.now();
    const disc: Discussion = {
      id,
      problemId: data.problemId,
      problemTitle: prob?.title,
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
    this.discussions.set(id, disc);
    this.comments.set(id, []);
    return disc;
  }

  public voteDiscussion(id: string, userId: string): Discussion | undefined {
    const d = this.discussions.get(id);
    if (!d) return undefined;
    if (d.upvotedBy.includes(userId)) {
      d.upvotedBy = d.upvotedBy.filter(u => u !== userId);
      d.upvotes = Math.max(0, d.upvotes - 1);
    } else {
      d.upvotedBy.push(userId);
      d.upvotes += 1;
    }
    return d;
  }

  public getComments(discussionId: string): Comment[] {
    return this.comments.get(discussionId) || [];
  }

  public addComment(data: { discussionId: string; userId: string; content: string }): Comment {
    const user = this.users.get(data.userId);
    if (!user) throw new Error('User not found');
    const disc = this.discussions.get(data.discussionId);
    if (!disc) throw new Error('Discussion not found');

    const id = 'comm-' + Date.now();
    const comment: Comment = {
      id,
      discussionId: data.discussionId,
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      content: data.content,
      upvotes: 0,
      upvotedBy: [],
      createdAt: new Date().toISOString()
    };

    const list = this.comments.get(data.discussionId) || [];
    list.push(comment);
    this.comments.set(data.discussionId, list);
    disc.commentCount = list.length;

    return comment;
  }

  public getBadges(): Badge[] {
    return Array.from(this.badges.values());
  }
}

export const db = new Database();
