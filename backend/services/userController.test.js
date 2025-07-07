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
    fetchCodeChefSolvedCount: vi.fn(),
  fetchCodeChefProblems: vi.fn()
}));
vi.mock('../services/contests.js', () => ({
  fetchUpcomingContests: vi.fn()
}));

const Problem = (await import('../models/Problem.js')).default;
const { getUserStats, getCodeChefSolvedProblems } = await import('../controllers/userController.js');
const { fetchCSESSolvedCount } = await import('../services/cses.js');
const { fetchCodeChefProblems } = await import('../services/codechef.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getCodeChefSolvedProblems', () => {
  it('returns list of problems', async () => {
    fetchCodeChefProblems.mockResolvedValue([
      { id: 'A', title: 'Alpha', url: 'u' },
      { id: 'B', title: 'Beta', url: 'v' }
    ]);

    const req = { params: { username: 'chef' } };
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

    await getCodeChefSolvedProblems(req, res);

    expect(fetchCodeChefProblems).toHaveBeenCalledWith('chef');
    expect(res.json).toHaveBeenCalledWith({
      problems: [
        { id: 'A', title: 'Alpha', url: 'u' },
        { id: 'B', title: 'Beta', url: 'v' }
      ]
    });
  });

  it('handles fetch errors', async () => {
    fetchCodeChefProblems.mockRejectedValue(new Error('fail'));
    const req = { params: { username: 'bad' } };
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

    await getCodeChefSolvedProblems(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Failed to fetch CodeChef problems'
    });
  });
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