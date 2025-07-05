import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../models/PlatformAccount.js', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn()
  }
}));

vi.mock('../models/User.js', () => ({
  default: {
    findByIdAndUpdate: vi.fn()
  }
}));

vi.mock('../models/Problem.js', () => ({
  default: {
    deleteMany: vi.fn(),
    insertMany: vi.fn(),
  }
}));

vi.mock('../services/leetcode.js', () => ({
  fetchLeetCodeProblems: vi.fn().mockResolvedValue([
    { id: '1', title: 'Test', difficulty: 'Easy', tags: [], solvedAt: new Date() }
  ])
}));

vi.mock('../services/codechef.js', () => ({
  fetchCodeChefProblems: vi.fn().mockResolvedValue([
    { id: 'A', title: 'Alpha', difficulty: 'Easy', tags: [], solvedAt: new Date(), url: 'u' }
  ]),
  fetchCodeChefSolvedCount: vi.fn().mockResolvedValue(1),
}));

vi.mock('../services/cses.js', () => ({
  fetchCSESProblems: vi.fn().mockResolvedValue([
    { id: '10', title: 'Task', difficulty: 'Unknown', tags: [], solvedAt: new Date(), url: 'c' }
  ]),
  fetchCSESSolvedCount: vi.fn().mockResolvedValue(2),
}));

const PlatformAccount = (await import('../models/PlatformAccount.js')).default;
const User = (await import('../models/User.js')).default;
const Problem = (await import('../models/Problem.js')).default;
await import('../services/leetcode.js');
await import('../services/codechef.js');
await import('../services/cses.js');
const { syncPlatform } = await import('../controllers/platformController.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('syncPlatform handle trimming', () => {
  it('saves trimmed handle', async () => {
    PlatformAccount.findOne.mockResolvedValue(null);
    PlatformAccount.create.mockResolvedValue({});
    User.findByIdAndUpdate.mockResolvedValue(null);
    Problem.deleteMany.mockResolvedValue(null);
    Problem.insertMany.mockResolvedValue([{}]);

    const req = {
      user: { _id: 'u1', email: 'a@test.com' },
      params: { platform: 'leetcode' },
      body: { handle: '  alice  ' }
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await syncPlatform(req, res);

    expect(PlatformAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({ handle: 'alice' })
    );
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('u1', {
      $set: { 'platforms.leetcode.handle': 'alice' }
    });
  });
});

describe('syncPlatform problem insertion', () => {
  it('stores CodeChef problems', async () => {
    PlatformAccount.findOne.mockResolvedValue(null);
    PlatformAccount.create.mockResolvedValue({});
    User.findByIdAndUpdate.mockResolvedValue(null);
    Problem.insertMany.mockResolvedValue([{}]);

    const req = {
      user: { _id: 'u1', email: 'a@test.com' },
      params: { platform: 'codechef' },
      body: { handle: 'chef' },
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await syncPlatform(req, res);

    expect(Problem.insertMany).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ importedCount: 1 })
    );
  });

  it('stores CSES problems', async () => {
    PlatformAccount.findOne.mockResolvedValue(null);
    PlatformAccount.create.mockResolvedValue({});
    User.findByIdAndUpdate.mockResolvedValue(null);
    Problem.insertMany.mockResolvedValue([{}]);

    const req = {
      user: { _id: 'u2', email: 'b@test.com' },
      params: { platform: 'cses' },
      body: { handle: '123' },
    };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

    await syncPlatform(req, res);

    expect(Problem.insertMany).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ importedCount: 1 })
    );
  });
});
