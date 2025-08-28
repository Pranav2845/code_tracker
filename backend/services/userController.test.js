// File: backend/controllers/userController.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../models/Problem.js', () => ({
  default: { aggregate: vi.fn() }
}));

vi.mock('../models/User.js', () => ({ default: {} }));
vi.mock('../models/PlatformAccount.js', () => ({
  default: { find: vi.fn(), updateOne: vi.fn() }
}));

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
  fetchAllContests: vi.fn(),
  fetchUpcomingContests: vi.fn()
}));

const Problem = (await import('../models/Problem.js')).default;
const PlatformAccount = (await import('../models/PlatformAccount.js')).default;
const { getUserStats, getUserStatsLocal, getCodeChefSolvedProblems } = await import('../controllers/userController.js');
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

describe('getUserStatsLocal', () => {
  it('aggregates from Problem collection', async () => {
    // First aggregate call: byPlatform
    Problem.aggregate
      .mockResolvedValueOnce([{ _id: 'cses', count: 5 }])
      // Second aggregate call: active days
      .mockResolvedValueOnce([{ count: 3 }]);

    const req = { user: { _id: 'u1' } };
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

    await getUserStatsLocal(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        totalSolved: 5,
        activeDays: 3,
        byPlatform: expect.arrayContaining([
          expect.objectContaining({ _id: 'cses', count: 5 })
        ])
      })
    );
  });
});

describe('getUserStats', () => {
  it('returns 202 accepted', async () => {
    PlatformAccount.find.mockResolvedValue([]);
    const req = { user: { _id: 'u1' } };
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

    await getUserStats(req, res);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith({ accepted: true });
  });
});