export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  avatar: string;
  bio: string;
  rating: number;
  solvedCount: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type SupportedLanguage = 'python' | 'javascript' | 'java' | 'cpp';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  explanation?: string;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: Example[];
  starterCode: Record<SupportedLanguage, string>;
  timeLimitMs: number;
  memoryLimitMb: number;
  acceptanceRate: number;
  totalSubmissions: number;
  totalAccepted: number;
  testCases?: TestCase[]; // Only public test cases sent to normal users
}

export type SubmissionStatus = 'QUEUED' | 'COMPILING' | 'RUNNING' | 'JUDGING' | 'COMPLETED';

export type Verdict =
  | 'PENDING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'INTERNAL_ERROR';

export interface TestCaseResult {
  testIndex: number;
  isPublic: boolean;
  passed: boolean;
  runtimeMs: number;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  error?: string;
}

export interface Submission {
  id: string;
  problemId: string;
  problemTitle: string;
  problemSlug: string;
  userId: string;
  username: string;
  language: SupportedLanguage;
  code: string;
  status: SubmissionStatus;
  verdict: Verdict;
  runtimeMs: number;
  memoryMb: number;
  passedTests: number;
  totalTests: number;
  errorDetails?: string;
  createdAt: string;
  testResults?: TestCaseResult[];
  percentileBeat?: number;
}

export interface Contest {
  id: string;
  title: string;
  slug: string;
  description: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: 'UPCOMING' | 'LIVE' | 'ENDED';
  problems: {
    problemId: string;
    orderIndex: number;
    score: number;
    title: string;
    difficulty: Difficulty;
  }[];
  participantsCount: number;
}

export interface ContestLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  score: number;
  penaltyMinutes: number;
  problemScores: Record<string, { solved: boolean; attempts: number; penaltyMinutes: number }>;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
  unlockedAt?: string;
}

export interface Discussion {
  id: string;
  problemId?: string;
  problemTitle?: string;
  userId: string;
  username: string;
  userAvatar: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  upvotedBy: string[];
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  discussionId: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  upvotes: number;
  upvotedBy: string[];
  createdAt: string;
}

export interface UserStats {
  solvedCount: number;
  totalProblems: number;
  easySolved: number;
  totalEasy: number;
  mediumSolved: number;
  totalMedium: number;
  hardSolved: number;
  totalHard: number;
  acceptanceRate: number;
  totalSubmissions: number;
  currentStreak: number;
  longestStreak: number;
  rating: number;
  rank: number;
  recentActivity: { date: string; count: number }[];
  badges: Badge[];
}
