import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { fetchLeetCodeContests } from './contests.js';

vi.mock('axios');

describe('fetchLeetCodeContests edge cases', () => {
  it('handles missing contest list gracefully', async () => {
    axios.get.mockResolvedValueOnce({ data: {} });
    const contests = await fetchLeetCodeContests();
    expect(Array.isArray(contests)).toBe(true);
    expect(contests).toHaveLength(0);
  });
});
