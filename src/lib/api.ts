import { User, Problem, Submission, Contest, ContestLeaderboardEntry, Discussion, Comment, SupportedLanguage } from '../types';
import { staticStore } from './staticStore';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('apex_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class ApiError extends Error {
  status: number;
  error: string;
  timestamp: string;
  path: string;

  constructor(data: any) {
    super(data.message || 'An error occurred');
    this.status = data.status || 500;
    this.error = data.error || 'API_ERROR';
    this.timestamp = data.timestamp || new Date().toISOString();
    this.path = data.path || '';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers as Record<string, string> || {})
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errData;
    try {
      errData = await res.json();
    } catch {
      errData = { message: res.statusText, status: res.status };
    }
    throw new ApiError(errData);
  }

  return res.json();
}

// Wrapper that falls back to staticStore when deployed on static hosts like GitHub Pages
async function tryApiOrFallback<T>(apiCall: () => Promise<T>, fallbackCall: () => T | Promise<T>): Promise<T> {
  try {
    return await apiCall();
  } catch (err: any) {
    // If backend returned 404/500/network error (typical on static GitHub Pages hosting where no Node server runs)
    console.warn('[Apex Judge] Backend unavailable or static deployment detected. Using client-side storage engine.');
    return await fallbackCall();
  }
}

export const api = {
  // Auth
  login: (identifier: string, password: string) =>
    tryApiOrFallback(
      () => request<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      }),
      () => staticStore.login(identifier)
    ),

  register: (username: string, email: string, password: string) =>
    tryApiOrFallback(
      () => request<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
      }),
      () => staticStore.register(username, email)
    ),

  getCurrentUser: () =>
    tryApiOrFallback(
      () => request<{ user: User }>('/auth/me'),
      () => staticStore.getCurrentUser()
    ),

  // Problems
  getProblems: (params?: { search?: string; difficulty?: string; tag?: string; page?: number; limit?: number; sort?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.difficulty) query.set('difficulty', params.difficulty);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.sort) query.set('sort', params.sort);
    return tryApiOrFallback(
      () => request<{ problems: Problem[]; total: number; page: number; limit: number; totalPages: number }>(`/problems?${query.toString()}`),
      () => staticStore.getProblems(params)
    );
  },

  getProblemBySlug: (slug: string) =>
    tryApiOrFallback(
      () => request<Problem>(`/problems/${slug}`),
      () => staticStore.getProblemBySlug(slug)
    ),

  // Judge Execution
  runCode: (problemId: string, language: SupportedLanguage, code: string, customTestCases?: { input: string; expectedOutput?: string }[]) =>
    tryApiOrFallback(
      () => request<{ status: 'PASSED' | 'FAILED'; runtimeMs: number; results: any[] }>('/judge/run', {
        method: 'POST',
        body: JSON.stringify({ problemId, language, code, customTestCases })
      }),
      () => staticStore.runCode(problemId, language, code, customTestCases)
    ),

  submitCode: (problemId: string, language: SupportedLanguage, code: string) =>
    tryApiOrFallback(
      () => request<Submission>('/submissions', {
        method: 'POST',
        body: JSON.stringify({ problemId, language, code })
      }),
      () => staticStore.submitCode(problemId, language, code)
    ),

  getSubmission: (id: string) =>
    tryApiOrFallback(
      () => request<Submission>(`/submissions/${id}`),
      () => staticStore.getSubmission(id)
    ),

  getSubmissions: (params?: { problemId?: string; userId?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.problemId) query.set('problemId', params.problemId);
    if (params?.userId) query.set('userId', params.userId);
    if (params?.limit) query.set('limit', params.limit.toString());
    return tryApiOrFallback(
      () => request<Submission[]>(`/submissions?${query.toString()}`),
      () => staticStore.getSubmissions(params)
    );
  },

  // Contests
  getContests: () =>
    tryApiOrFallback(
      () => request<Contest[]>('/contests'),
      () => staticStore.getContests()
    ),
  getContest: (id: string) =>
    tryApiOrFallback(
      () => request<Contest>(`/contests/${id}`),
      () => staticStore.getContest(id)
    ),
  getContestLeaderboard: (id: string) =>
    tryApiOrFallback(
      () => request<ContestLeaderboardEntry[]>(`/contests/${id}/leaderboard`),
      () => staticStore.getContestLeaderboard(id)
    ),

  // Leaderboard
  getGlobalLeaderboard: () =>
    tryApiOrFallback(
      () => request<any[]>('/leaderboard'),
      () => staticStore.getGlobalLeaderboard()
    ),

  // User Profile
  getUserProfile: (username: string) =>
    tryApiOrFallback(
      () => request<{ user: User; stats: any }>(`/users/${username}`),
      () => staticStore.getUserProfile(username)
    ),

  // Discussions
  getDiscussions: (problemId?: string) => {
    const q = problemId ? `?problemId=${encodeURIComponent(problemId)}` : '';
    return tryApiOrFallback(
      () => request<Discussion[]>(`/discussions${q}`),
      () => staticStore.getDiscussions(problemId)
    );
  },
  getDiscussion: (id: string) =>
    tryApiOrFallback(
      () => request<{ discussion: Discussion; comments: Comment[] }>(`/discussions/${id}`),
      () => staticStore.getDiscussion(id)
    ),
  createDiscussion: (data: { problemId?: string; title: string; content: string; tags?: string[] }) =>
    tryApiOrFallback(
      () => request<Discussion>('/discussions', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
      () => staticStore.createDiscussion(data)
    ),
  voteDiscussion: (id: string) =>
    tryApiOrFallback(
      () => request<Discussion>(`/discussions/${id}/vote`, { method: 'POST' }),
      () => staticStore.voteDiscussion(id)
    ),
  addComment: (discussionId: string, content: string) =>
    tryApiOrFallback(
      () => request<Comment>(`/discussions/${discussionId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content })
      }),
      () => staticStore.addComment(discussionId, content)
    ),

  // Admin
  createProblem: (problemData: any) =>
    tryApiOrFallback(
      () => request<Problem>('/admin/problems', {
        method: 'POST',
        body: JSON.stringify(problemData)
      }),
      () => staticStore.createProblem(problemData)
    ),
  updateProblem: (id: string, updates: any) =>
    tryApiOrFallback(
      () => request<Problem>(`/admin/problems/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      }),
      () => staticStore.updateProblem(id, updates)
    ),
  deleteProblem: (id: string) =>
    tryApiOrFallback(
      () => request<{ success: boolean }>(`/admin/problems/${id}`, {
        method: 'DELETE'
      }),
      () => staticStore.deleteProblem(id)
    )
};
