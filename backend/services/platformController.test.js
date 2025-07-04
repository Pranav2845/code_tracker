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
    create: vi.fn()
  }
}));

vi.mock('../services/leetcode.js', () => ({
  fetchLeetCodeProblems: vi.fn().mockResolvedValue([
    { id: '1', title: 'Test', difficulty: 'Easy', tags: [], solvedAt: new Date() }
  ])
}));

const PlatformAccount = (await import('../models/PlatformAccount.js')).default;
const User = (await import('../models/User.js')).default;
const Problem = (await import('../models/Problem.js')).default;
await import('../services/leetcode.js');
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
    Problem.create.mockResolvedValue({});

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