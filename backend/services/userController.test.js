// File: backend/controllers/userController.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../models/Problem.js', () => ({
  default: { aggregate: vi.fn() }
}));

vi.mock('../models/User.js', () => ({ default: {} }));
vi.mock('../models/PlatformAccount.js', () => ({ default: {} }));

vi.mock('../services/leetcode.js', () => ({
  fetchLeetCodeSolvedCount: vi.fn()
}));
vi.mock('../services/codeforces.js', () => ({
  fetchCFSolvedCount: vi.fn()
}));
vi.mock('../services/cses.js', () => ({
  fetchCSESSolvedCount: vi.fn(),
  fetchCSESSubmissionCount: vi.fn()
}));
vi.mock('../services/gfg.js', () => ({
  fetchGFGSolvedCount: vi.fn()
}));
vi.mock('../services/code360.js', () => ({
  fetchCode360SolvedCount: vi.fn(),
  fetchCode360ContributionStats: vi.fn(),
  fetchCode360ProfileTotalCount: vi.fn(),
  fetchCode360Problems: vi.fn()
}));
vi.mock('../services/hackerrank.js', () => ({
  fetchHackerRankSolvedCount: vi.fn()
}));
vi.mock('../services/codechef.js', () => ({
  fetchCodeChefSolvedCount: vi.fn()
}));
vi.mock('../services/contests.js', () => ({
  fetchUpcomingContests: vi.fn()
}));

const Problem = (await import('../models/Problem.js')).default;
const { getUserStats } = await import('../controllers/userController.js');
const { fetchCSESSolvedCount } = await import('../services/cses.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getUserStats', () => {
  it('uses live CSES solved count', async () => {
    Problem.aggregate
      .mockResolvedValueOnce([{ _id: 'cses', count: 5 }])
      .mockResolvedValueOnce([{ count: 3 }]);
    fetchCSESSolvedCount.mockResolvedValueOnce(8);

    const req = { user: { _id: 'u1', platforms: { cses: { handle: 'alice' } } } };
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

    await getUserStats(req, res);

    expect(fetchCSESSolvedCount).toHaveBeenCalledWith('alice');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        totalSolved: 8,
        activeDays: 3,
        byPlatform: expect.arrayContaining([
          expect.objectContaining({ _id: 'cses', count: 8 })
        ])
      })
    );
  });
});