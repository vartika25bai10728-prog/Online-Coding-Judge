import { User, Problem, Submission, Contest, ContestLeaderboardEntry, Discussion, Comment, SupportedLanguage } from '../types';

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

export const api = {
  // Auth
  login: (identifier: string, password: string) =>
    request<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    }),

  register: (username: string, email: string, password: string) =>
    request<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    }),

  getCurrentUser: () => request<{ user: User }>('/auth/me'),

  // Problems
  getProblems: (params?: { search?: string; difficulty?: string; tag?: string; page?: number; limit?: number; sort?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.difficulty) query.set('difficulty', params.difficulty);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.sort) query.set('sort', params.sort);
    return request<{ problems: Problem[]; total: number; page: number; limit: number; totalPages: number }>(`/problems?${query.toString()}`);
  },

  getProblemBySlug: (slug: string) => request<Problem>(`/problems/${slug}`),

  // Judge Execution
  runCode: (problemId: string, language: SupportedLanguage, code: string, customTestCases?: { input: string; expectedOutput?: string }[]) =>
    request<{ status: 'PASSED' | 'FAILED'; runtimeMs: number; results: any[] }>('/judge/run', {
      method: 'POST',
      body: JSON.stringify({ problemId, language, code, customTestCases })
    }),

  submitCode: (problemId: string, language: SupportedLanguage, code: string) =>
    request<Submission>('/submissions', {
      method: 'POST',
      body: JSON.stringify({ problemId, language, code })
    }),

  getSubmission: (id: string) => request<Submission>(`/submissions/${id}`),

  getSubmissions: (params?: { problemId?: string; userId?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.problemId) query.set('problemId', params.problemId);
    if (params?.userId) query.set('userId', params.userId);
    if (params?.limit) query.set('limit', params.limit.toString());
    return request<Submission[]>(`/submissions?${query.toString()}`);
  },

  // Contests
  getContests: () => request<Contest[]>('/contests'),
  getContest: (id: string) => request<Contest>(`/contests/${id}`),
  getContestLeaderboard: (id: string) => request<ContestLeaderboardEntry[]>(`/contests/${id}/leaderboard`),

  // Leaderboard
  getGlobalLeaderboard: () => request<any[]>('/leaderboard'),

  // User Profile
  getUserProfile: (username: string) => request<{ user: User; stats: any }>(`/users/${username}`),

  // Discussions
  getDiscussions: (problemId?: string) => {
    const q = problemId ? `?problemId=${encodeURIComponent(problemId)}` : '';
    return request<Discussion[]>(`/discussions${q}`);
  },
  getDiscussion: (id: string) => request<{ discussion: Discussion; comments: Comment[] }>(`/discussions/${id}`),
  createDiscussion: (data: { problemId?: string; title: string; content: string; tags?: string[] }) =>
    request<Discussion>('/discussions', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  voteDiscussion: (id: string) =>
    request<Discussion>(`/discussions/${id}/vote`, { method: 'POST' }),
  addComment: (discussionId: string, content: string) =>
    request<Comment>(`/discussions/${discussionId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    }),

  // Admin
  createProblem: (problemData: any) =>
    request<Problem>('/admin/problems', {
      method: 'POST',
      body: JSON.stringify(problemData)
    }),
  updateProblem: (id: string, updates: any) =>
    request<Problem>(`/admin/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),
  deleteProblem: (id: string) =>
    request<{ success: boolean }>(`/admin/problems/${id}`, {
      method: 'DELETE'
    })
};
