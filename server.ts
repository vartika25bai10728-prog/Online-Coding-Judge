import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { db, eventBus } from './src/server/db';
import { generateTokens, requireAuth, requireAdmin, AuthenticatedRequest } from './src/server/auth';
import { runTestCase } from './src/server/judgeEngine';
import { SupportedLanguage } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // Basic CORS and Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'apex-judge-engine' });
  });

  // ==================== AUTH APIS ====================
  app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'VALIDATION_ERROR',
        message: 'Username, email and password are required',
        path: req.originalUrl
      });
    }

    if (username.length < 3 || password.length < 6) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'VALIDATION_ERROR',
        message: 'Username must be >= 3 characters and password >= 6 characters',
        path: req.originalUrl
      });
    }

    const existing = db.getUserByEmailOrUsername(username) || db.getUserByEmailOrUsername(email);
    if (existing) {
      return res.status(409).json({
        timestamp: new Date().toISOString(),
        status: 409,
        error: 'CONFLICT',
        message: 'Username or email already in use',
        path: req.originalUrl
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const user = db.createUser({ username, email, passwordHash, role: 'USER' });
    const tokens = generateTokens(user);

    res.status(201).json({ user, ...tokens });
  });

  app.post('/api/auth/login', (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'VALIDATION_ERROR',
        message: 'Identifier and password are required',
        path: req.originalUrl
      });
    }

    const dbUser = db.getUserByEmailOrUsername(identifier);
    if (!dbUser || !bcrypt.compareSync(password, dbUser.passwordHash)) {
      return res.status(401).json({
        timestamp: new Date().toISOString(),
        status: 401,
        error: 'UNAUTHORIZED',
        message: 'Invalid credentials',
        path: req.originalUrl
      });
    }

    const { passwordHash, ...safeUser } = dbUser;
    const tokens = generateTokens(safeUser);
    res.json({ user: safeUser, ...tokens });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: req.user });
  });

  // ==================== PROBLEMS APIS ====================
  app.get('/api/problems', (req, res) => {
    const { search, difficulty, tag, page = '1', limit = '50', sort } = req.query;
    let problems = db.getProblems(false);

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      problems = problems.filter(p => p.title.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    }

    if (difficulty && typeof difficulty === 'string' && difficulty !== 'ALL') {
      problems = problems.filter(p => p.difficulty === difficulty.toUpperCase());
    }

    if (tag && typeof tag === 'string' && tag !== 'ALL') {
      problems = problems.filter(p => p.tags.includes(tag));
    }

    if (sort === 'acceptance') {
      problems.sort((a, b) => b.acceptanceRate - a.acceptanceRate);
    } else if (sort === 'difficulty') {
      const order = { EASY: 1, MEDIUM: 2, HARD: 3 };
      problems.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
    }

    const p = Math.max(1, parseInt(page as string, 10));
    const l = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const total = problems.length;
    const paginated = problems.slice((p - 1) * l, p * l);

    res.json({
      problems: paginated,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l)
    });
  });

  app.get('/api/problems/:slug', (req, res) => {
    const problem = db.getProblemBySlug(req.params.slug, false);
    if (!problem) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'NOT_FOUND',
        message: 'Problem not found',
        path: req.originalUrl
      });
    }
    res.json(problem);
  });

  // Admin Problem Management
  app.post('/api/admin/problems', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const newProblem = db.createProblem(req.body);
      res.status(201).json(newProblem);
    } catch (err: any) {
      res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'VALIDATION_ERROR',
        message: err.message,
        path: req.originalUrl
      });
    }
  });

  app.put('/api/admin/problems/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const updated = db.updateProblem(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'NOT_FOUND',
        message: 'Problem not found',
        path: req.originalUrl
      });
    }
    res.json(updated);
  });

  app.delete('/api/admin/problems/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const deleted = db.deleteProblem(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'NOT_FOUND',
        message: 'Problem not found',
        path: req.originalUrl
      });
    }
    res.json({ success: true, message: 'Problem deleted' });
  });

  // ==================== JUDGE EXECUTION APIS ====================
  // Run Code: public test cases only, synchronous, returns instant diff
  app.post('/api/judge/run', async (req, res) => {
    const { problemId, language, code, customTestCases } = req.body;
    if (!problemId || !language || !code) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'VALIDATION_ERROR',
        message: 'problemId, language and code are required',
        path: req.originalUrl
      });
    }

    const problem = db.getProblemById(problemId);
    if (!problem) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'NOT_FOUND',
        message: 'Problem not found',
        path: req.originalUrl
      });
    }

    const testsToRun = customTestCases && customTestCases.length > 0
      ? customTestCases.map((c: any, i: number) => ({ input: c.input, expectedOutput: c.expectedOutput || '', isPublic: true }))
      : (problem.testCases || []).map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput, isPublic: true }));

    const results = [];
    let allPassed = true;
    let totalRuntime = 0;

    for (let i = 0; i < testsToRun.length; i++) {
      const tc = testsToRun[i];
      const tr = await runTestCase(language as SupportedLanguage, code, tc, i + 1, problem.timeLimitMs, problem.memoryLimitMb);
      results.push(tr);
      totalRuntime += tr.runtimeMs;
      if (!tr.passed) allPassed = false;
    }

    res.json({
      status: allPassed ? 'PASSED' : 'FAILED',
      runtimeMs: Math.round(totalRuntime / results.length),
      results
    });
  });

  // Submit Code: Asynchronous Queue -> Worker -> Docker Sandbox
  app.post('/api/submissions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const { problemId, language, code } = req.body;
    if (!problemId || !language || !code) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'VALIDATION_ERROR',
        message: 'problemId, language and code are required',
        path: req.originalUrl
      });
    }

    try {
      const submission = db.queueSubmission({
        problemId,
        userId: req.user!.id,
        language,
        code
      });

      // Returns immediately with 202 Accepted and initial status
      res.status(202).json(submission);
    } catch (err: any) {
      res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'SUBMISSION_FAILED',
        message: err.message,
        path: req.originalUrl
      });
    }
  });

  app.get('/api/submissions/:id', (req, res) => {
    const sub = db.getSubmission(req.params.id, false);
    if (!sub) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'NOT_FOUND',
        message: 'Submission not found',
        path: req.originalUrl
      });
    }
    res.json(sub);
  });

  // Real-time SSE status updates for submission
  app.get('/api/submissions/:id/events', (req, res) => {
    const subId = req.params.id;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const current = db.getSubmission(subId, false);
    if (current) {
      res.write(`data: ${JSON.stringify(current)}\n\n`);
    }

    const listener = (updatedSub: any) => {
      if (updatedSub.id === subId) {
        // Safe copy without hidden test inputs
        const safeSub = db.getSubmission(subId, false);
        res.write(`data: ${JSON.stringify(safeSub)}\n\n`);
        if (updatedSub.status === 'COMPLETED') {
          res.end();
        }
      }
    };

    eventBus.on(`submission:${subId}`, listener);

    req.on('close', () => {
      eventBus.off(`submission:${subId}`, listener);
    });
  });

  app.get('/api/submissions', (req, res) => {
    const { problemId, userId, limit = '50' } = req.query;
    const subs = db.getSubmissions({
      problemId: problemId as string,
      userId: userId as string
    }).slice(0, parseInt(limit as string, 10));
    res.json(subs);
  });

  app.get('/api/users/me/submissions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const subs = db.getSubmissions({ userId: req.user!.id });
    res.json(subs);
  });

  app.get('/api/problems/:id/submissions', (req, res) => {
    const subs = db.getSubmissions({ problemId: req.params.id });
    res.json(subs);
  });

  // ==================== CONTESTS APIS ====================
  app.get('/api/contests', (req, res) => {
    res.json(db.getContests());
  });

  app.get('/api/contests/:id', (req, res) => {
    const contest = db.getContestById(req.params.id);
    if (!contest) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'NOT_FOUND',
        message: 'Contest not found',
        path: req.originalUrl
      });
    }
    res.json(contest);
  });

  app.get('/api/contests/:id/leaderboard', (req, res) => {
    const lb = db.getContestLeaderboard(req.params.id);
    res.json(lb);
  });

  app.post('/api/admin/contests', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const contest = db.createContest(req.body);
    res.status(201).json(contest);
  });

  // ==================== LEADERBOARD APIS ====================
  app.get('/api/leaderboard', (req, res) => {
    const users = db.getUsers().sort((a, b) => b.rating - a.rating || b.solvedCount - a.solvedCount);
    const ranked = users.map((u, i) => ({
      rank: i + 1,
      id: u.id,
      username: u.username,
      avatar: u.avatar,
      rating: u.rating,
      solvedCount: u.solvedCount,
      easySolved: u.easySolved,
      mediumSolved: u.mediumSolved,
      hardSolved: u.hardSolved
    }));
    res.json(ranked);
  });

  // ==================== USER PROFILE & STATS ====================
  app.get('/api/users/:username', (req, res) => {
    const user = db.getUsers().find(u => u.username.toLowerCase() === req.params.username.toLowerCase());
    if (!user) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'NOT_FOUND',
        message: 'User profile not found',
        path: req.originalUrl
      });
    }

    const allProblems = db.getProblems();
    const userSubs = db.getSubmissions({ userId: user.id });
    const acceptedSubs = userSubs.filter(s => s.verdict === 'ACCEPTED');

    // Badges calculation
    const badges = db.getBadges().map(b => {
      let unlocked = false;
      if (b.id === 'b-first-solve' && acceptedSubs.length >= 1) unlocked = true;
      if (b.id === 'b-10-solved' && user.solvedCount >= 10) unlocked = true;
      if (b.id === 'b-50-solved' && user.solvedCount >= 50) unlocked = true;
      if (b.id === 'b-speed-demon' && acceptedSubs.some(s => s.runtimeMs > 0 && s.runtimeMs <= 25)) unlocked = true;
      if (b.id === 'b-streak-7' && user.currentStreak >= 7) unlocked = true;
      if (b.id === 'b-contest-champ' && user.rating >= 2100) unlocked = true;

      return {
        ...b,
        unlockedAt: unlocked ? user.createdAt : undefined
      };
    });

    const stats = {
      solvedCount: user.solvedCount,
      totalProblems: allProblems.length,
      easySolved: user.easySolved,
      totalEasy: allProblems.filter(p => p.difficulty === 'EASY').length,
      mediumSolved: user.mediumSolved,
      totalMedium: allProblems.filter(p => p.difficulty === 'MEDIUM').length,
      hardSolved: user.hardSolved,
      totalHard: allProblems.filter(p => p.difficulty === 'HARD').length,
      acceptanceRate: userSubs.length > 0 ? Math.round((acceptedSubs.length / userSubs.length) * 1000) / 10 : 0,
      totalSubmissions: userSubs.length,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      rating: user.rating,
      rank: db.getUsers().sort((a, b) => b.rating - a.rating).findIndex(u => u.id === user.id) + 1,
      recentActivity: Array.from({ length: 60 }).map((_, i) => {
        const d = new Date(Date.now() - (59 - i) * 86400000).toISOString().split('T')[0];
        const count = i % 3 === 0 ? (i % 5) + 1 : 0;
        return { date: d, count };
      }),
      badges
    };

    res.json({ user, stats });
  });

  // ==================== DISCUSSIONS APIS ====================
  app.get('/api/discussions', (req, res) => {
    const { problemId } = req.query;
    res.json(db.getDiscussions(problemId as string));
  });

  app.get('/api/discussions/:id', (req, res) => {
    const disc = db.getDiscussionById(req.params.id);
    if (!disc) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'NOT_FOUND',
        message: 'Discussion not found',
        path: req.originalUrl
      });
    }
    const comments = db.getComments(disc.id);
    res.json({ discussion: disc, comments });
  });

  app.post('/api/discussions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const { problemId, title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'VALIDATION_ERROR',
        message: 'Title and content are required',
        path: req.originalUrl
      });
    }

    const disc = db.createDiscussion({
      problemId,
      userId: req.user!.id,
      title,
      content,
      tags
    });
    res.status(201).json(disc);
  });

  app.post('/api/discussions/:id/vote', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const updated = db.voteDiscussion(req.params.id, req.user!.id);
    if (!updated) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'NOT_FOUND',
        message: 'Discussion not found',
        path: req.originalUrl
      });
    }
    res.json(updated);
  });

  app.post('/api/discussions/:id/comments', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'VALIDATION_ERROR',
        message: 'Comment content is required',
        path: req.originalUrl
      });
    }

    try {
      const comment = db.addComment({
        discussionId: req.params.id,
        userId: req.user!.id,
        content
      });
      res.status(201).json(comment);
    } catch (err: any) {
      res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: 'OPERATION_FAILED',
        message: err.message,
        path: req.originalUrl
      });
    }
  });

  // Global Exception Handling Filter for unhandled routes/errors
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Server error:', err);
    res.status(err.status || 500).json({
      timestamp: new Date().toISOString(),
      status: err.status || 500,
      error: err.name || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An internal error occurred on the judge server',
      path: req.originalUrl
    });
  });

  // Vite middleware for frontend serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Apex Judge] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
