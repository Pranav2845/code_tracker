// File: backend/services/codechef.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchCodeChefSolvedCount, fetchCodeChefProblems } from './codechef.js';

vi.mock('axios');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('fetchCodeChefSolvedCount', () => {
  it('parses solved count from profile page', async () => {
    const html = '<section class="rating-data-section problems-solved">Total Problems Solved: 42</section>';
    axios.get.mockResolvedValueOnce({ data: html });
    const count = await fetchCodeChefSolvedCount('alice');
    expect(count).toBe(42);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/users/alice'));
  });

  it('returns 0 when count missing', async () => {
    const html = '<section class="rating-data-section problems-solved"></section>';
    axios.get.mockResolvedValueOnce({ data: html });
    const count = await fetchCodeChefSolvedCount('bob');
    expect(count).toBe(0);
  });

  it('throws when page not found', async () => {
    axios.get.mockResolvedValueOnce({ data: '<div></div>' });
    await expect(fetchCodeChefSolvedCount('bad')).rejects.toThrow('User not found');
  });
});

describe('fetchCodeChefProblems', () => {
  it('scrapes solved problems', async () => {
    const html = `
      <section class="rating-data-section problems-solved">
        <a href="/problems/ABC">Alpha</a>
        <a href="/problems/XYZ">Xyz</a>
      </section>`;
    axios.get.mockResolvedValueOnce({ data: html });
    const list = await fetchCodeChefProblems('alice');
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe('ABC');
    expect(list[0].title).toBe('Alpha');
    expect(list[0].url).toMatch(/ABC/);
    expect(list[0].solvedAt instanceof Date).toBe(true);
  });

  it('throws on network error', async () => {
    axios.get.mockRejectedValueOnce(new Error('fail'));
    await expect(fetchCodeChefProblems('err')).rejects.toThrow('User not found');
  });
});
