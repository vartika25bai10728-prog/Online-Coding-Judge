import { User, Contest, Badge, Discussion, Comment, ContestLeaderboardEntry } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u-admin',
    username: 'admin',
    email: 'admin@apexjudge.dev',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Platform Administrator & Problem Curator. Keeping the judge engines running at peak performance.',
    rating: 2180,
    solvedCount: 18,
    easySolved: 8,
    mediumSolved: 8,
    hardSolved: 2,
    currentStreak: 12,
    longestStreak: 34,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'u-user',
    username: 'alex_coder',
    email: 'coder@apexjudge.dev',
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Competitive programmer, algorithm enthusiast, and software engineer.',
    rating: 1685,
    solvedCount: 9,
    easySolved: 5,
    mediumSolved: 3,
    hardSolved: 1,
    currentStreak: 5,
    longestStreak: 14,
    createdAt: '2026-02-15T12:00:00Z'
  },
  {
    id: 'u-3',
    username: 'elena_k',
    email: 'elena@example.com',
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Grandmaster | ICPC World Finalist 2024.',
    rating: 2465,
    solvedCount: 20,
    easySolved: 8,
    mediumSolved: 8,
    hardSolved: 4,
    currentStreak: 21,
    longestStreak: 45,
    createdAt: '2025-11-10T08:00:00Z'
  },
  {
    id: 'u-4',
    username: 'zenith_algo',
    email: 'zenith@example.com',
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    bio: 'Graph theory fanatic and math olympiad medalist.',
    rating: 2310,
    solvedCount: 19,
    easySolved: 8,
    mediumSolved: 8,
    hardSolved: 3,
    currentStreak: 9,
    longestStreak: 28,
    createdAt: '2025-12-01T10:00:00Z'
  },
  {
    id: 'u-5',
    username: 'byte_master',
    email: 'bm@example.com',
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Senior Backend Engineer diving into algorithmic optimization.',
    rating: 1980,
    solvedCount: 14,
    easySolved: 7,
    mediumSolved: 6,
    hardSolved: 1,
    currentStreak: 3,
    longestStreak: 18,
    createdAt: '2026-01-20T14:30:00Z'
  },
  {
    id: 'u-6',
    username: 'sarah_dev',
    email: 'sarah@example.com',
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    bio: 'CS Student preparing for FAANG interviews.',
    rating: 1840,
    solvedCount: 12,
    easySolved: 6,
    mediumSolved: 5,
    hardSolved: 1,
    currentStreak: 7,
    longestStreak: 12,
    createdAt: '2026-02-01T09:15:00Z'
  }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'b-first-solve',
    title: 'First Solve',
    description: 'Submitted an Accepted solution for your very first problem.',
    icon: 'Sparkles',
    tier: 'BRONZE'
  },
  {
    id: 'b-10-solved',
    title: 'Decathlon',
    description: 'Solved 10 algorithmic problems on Apex Judge.',
    icon: 'Award',
    tier: 'SILVER'
  },
  {
    id: 'b-50-solved',
    title: 'Master Tactician',
    description: 'Solved 50 algorithmic problems across multiple categories.',
    icon: 'ShieldAlert',
    tier: 'GOLD'
  },
  {
    id: 'b-speed-demon',
    title: 'Speed Demon',
    description: 'Submitted an Accepted solution with runtime under 25ms.',
    icon: 'Zap',
    tier: 'GOLD'
  },
  {
    id: 'b-streak-7',
    title: 'Consistent Solver',
    description: 'Maintained an active problem-solving streak for 7 consecutive days.',
    icon: 'Flame',
    tier: 'SILVER'
  },
  {
    id: 'b-contest-champ',
    title: 'Contest Podium',
    description: 'Finished in the top 3 on an official rated contest.',
    icon: 'Trophy',
    tier: 'DIAMOND'
  }
];

export const INITIAL_CONTESTS: Contest[] = [
  {
    id: 'c-42',
    title: 'Apex Biweekly Round #42',
    slug: 'apex-biweekly-round-42',
    description: 'Rated contest open to all divisions. Features 4 algorithmic challenges of increasing difficulty.',
    startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // Started 45m ago
    endTime: new Date(Date.now() + 75 * 60 * 1000).toISOString(),   // 75m remaining
    durationMinutes: 120,
    status: 'LIVE',
    problems: [
      { problemId: 'p-1', orderIndex: 1, score: 100, title: 'Two Sum', difficulty: 'EASY' },
      { problemId: 'p-4', orderIndex: 2, score: 200, title: 'Maximum Subarray', difficulty: 'MEDIUM' },
      { problemId: 'p-7', orderIndex: 3, score: 300, title: 'Coin Change', difficulty: 'MEDIUM' },
      { problemId: 'p-8', orderIndex: 4, score: 500, title: 'Trapping Rain Water', difficulty: 'HARD' }
    ],
    participantsCount: 342
  },
  {
    id: 'c-43',
    title: 'Apex Weekly Invitational #43',
    slug: 'apex-weekly-invitational-43',
    description: 'High-stakes algorithmic competition with rating multipliers. Registration is currently open.',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
    durationMinutes: 120,
    status: 'UPCOMING',
    problems: [
      { problemId: 'p-2', orderIndex: 1, score: 100, title: 'Valid Parentheses', difficulty: 'EASY' },
      { problemId: 'p-5', orderIndex: 2, score: 250, title: 'Longest Substring Without Repeating Characters', difficulty: 'MEDIUM' },
      { problemId: 'p-12', orderIndex: 3, score: 350, title: 'Search in Rotated Sorted Array', difficulty: 'MEDIUM' },
      { problemId: 'p-15', orderIndex: 4, score: 600, title: 'Median of Two Sorted Arrays', difficulty: 'HARD' }
    ],
    participantsCount: 189
  },
  {
    id: 'c-41',
    title: 'Apex Warmup Sprint #41',
    slug: 'apex-warmup-sprint-41',
    description: 'Archived sprint contest focusing on array dynamics and two pointers.',
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
    durationMinutes: 120,
    status: 'ENDED',
    problems: [
      { problemId: 'p-3', orderIndex: 1, score: 100, title: 'Best Time to Buy and Sell Stock', difficulty: 'EASY' },
      { problemId: 'p-6', orderIndex: 2, score: 250, title: 'Container With Most Water', difficulty: 'MEDIUM' },
      { problemId: 'p-14', orderIndex: 3, score: 350, title: 'Merge Intervals', difficulty: 'MEDIUM' }
    ],
    participantsCount: 512
  }
];

export const INITIAL_CONTEST_LEADERBOARD: Record<string, ContestLeaderboardEntry[]> = {
  'c-42': [
    {
      rank: 1,
      userId: 'u-3',
      username: 'elena_k',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      score: 1100,
      penaltyMinutes: 48,
      problemScores: {
        'p-1': { solved: true, attempts: 1, penaltyMinutes: 4 },
        'p-4': { solved: true, attempts: 1, penaltyMinutes: 11 },
        'p-7': { solved: true, attempts: 1, penaltyMinutes: 22 },
        'p-8': { solved: true, attempts: 2, penaltyMinutes: 48 }
      }
    },
    {
      rank: 2,
      userId: 'u-4',
      username: 'zenith_algo',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      score: 600,
      penaltyMinutes: 32,
      problemScores: {
        'p-1': { solved: true, attempts: 1, penaltyMinutes: 3 },
        'p-4': { solved: true, attempts: 1, penaltyMinutes: 9 },
        'p-7': { solved: true, attempts: 2, penaltyMinutes: 20 },
        'p-8': { solved: false, attempts: 1, penaltyMinutes: 0 }
      }
    },
    {
      rank: 3,
      userId: 'u-user',
      username: 'alex_coder',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      score: 300,
      penaltyMinutes: 18,
      problemScores: {
        'p-1': { solved: true, attempts: 1, penaltyMinutes: 5 },
        'p-4': { solved: true, attempts: 1, penaltyMinutes: 13 },
        'p-7': { solved: false, attempts: 2, penaltyMinutes: 0 },
        'p-8': { solved: false, attempts: 0, penaltyMinutes: 0 }
      }
    }
  ]
};

export const INITIAL_DISCUSSIONS: Discussion[] = [
  {
    id: 'd-1',
    problemId: 'p-1',
    problemTitle: 'Two Sum',
    userId: 'u-3',
    username: 'elena_k',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    title: 'Detailed breakdown: Why One-Pass Hash Map achieves optimal O(N) time and O(N) space',
    content: `When approaching Two Sum, many developers first consider the brute-force two nested loops running in O(N^2) time.
    
By storing elements in a hash map as we iterate, we can query complement = target - nums[i] in average O(1) time complexity. Note that in Python dict lookup is amortized O(1), and in C++ std::unordered_map provides similar performance.

Edge cases to keep in mind:
- Negative integers in nums
- Target requires using two identical values at different indices (e.g., nums=[3, 3], target=6). Storing index as we iterate handles this naturally without colliding on the same element!`,
    tags: ['Hashing', 'Algorithm Analysis', 'Python', 'C++'],
    upvotes: 42,
    upvotedBy: ['u-admin', 'u-user', 'u-5'],
    commentCount: 3,
    createdAt: '2026-03-01T14:20:00Z'
  },
  {
    id: 'd-2',
    problemId: 'p-8',
    problemTitle: 'Trapping Rain Water',
    userId: 'u-4',
    username: 'zenith_algo',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    title: 'Two Pointers vs Monotonic Stack vs Dynamic Programming comparison',
    content: `Trapping Rain Water is one of the quintessential interview questions. Here is an intuition comparison:
1. **Dynamic Programming**: Compute left_max[i] and right_max[i] in two passes -> O(N) time and O(N) space.
2. **Two Pointers**: Maintain left and right pointers moving inward from both ends -> O(N) time and strictly O(1) auxiliary space!
3. **Monotonic Stack**: Keep a decreasing stack of bar indices. Useful when you need to calculate bounded horizontal layers.

The Two Pointer approach is almost always the gold standard in competitive programming because of zero heap allocations.`,
    tags: ['Two Pointers', 'Stack', 'Optimization'],
    upvotes: 29,
    upvotedBy: ['u-admin', 'u-user'],
    commentCount: 1,
    createdAt: '2026-03-05T09:40:00Z'
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c-1',
    discussionId: 'd-1',
    userId: 'u-user',
    username: 'alex_coder',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    content: 'Brilliant explanation! The note about avoiding duplicate indices by checking the hash map before inserting the current index solved the bug I had on test case 3.',
    upvotes: 8,
    upvotedBy: ['u-3'],
    createdAt: '2026-03-01T15:10:00Z'
  },
  {
    id: 'c-2',
    discussionId: 'd-1',
    userId: 'u-5',
    username: 'byte_master',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    content: 'In Java, make sure to size the HashMap appropriately with initialCapacity if working with very large constraints to prevent rehashing overhead.',
    upvotes: 5,
    upvotedBy: ['u-user'],
    createdAt: '2026-03-02T10:15:00Z'
  }
];
