// backend/services/codechef.test.js
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
  it('scrapes recent problems from recent activity JSON', async () => {
    // Only mock the new recent-activity JSON structure, not the old profile HTML!
    const snippet =
      '<tr><td><span data-epoch="1700000000"></span></td><td><a href="/problems/ABC">ABC</a></td></tr>';
    const pageHtml =
      '<div class="problem-statement"><h3 class="notranslate">Find maximum in an Array</h3></div>';

    // First mock is for recent activity, second for the problem page
    axios.get.mockResolvedValueOnce({ data: { content: snippet } });
    axios.get.mockResolvedValueOnce({ data: pageHtml });

    const list = await fetchCodeChefProblems('alice');
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('ABC');
    expect(list[0].title).toBe('Find maximum in an Array');
    expect(list[0].url).toMatch(/ABC/);
    expect(list[0].solvedAt instanceof Date).toBe(true);
    expect(list[0].solvedAt.getTime()).toBe(1700000000 * 1000);
  });

  it('falls back to <title> when h3.notranslate missing', async () => {
    const snippet =
      '<tr><td><span data-epoch="1700000100"></span></td><td><a href="/problems/DEF">DEF</a></td></tr>';
    const pageHtml = '<title>Problem - Add Two Numbers | CodeChef</title>';
    axios.get.mockResolvedValueOnce({ data: { content: snippet } });
    axios.get.mockResolvedValueOnce({ data: pageHtml });

    const list = await fetchCodeChefProblems('alice');
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('Add Two Numbers');
  });

  it('throws on network error', async () => {
    axios.get.mockRejectedValueOnce(new Error('fail'));
    await expect(fetchCodeChefProblems('err')).rejects.toThrow('User not found');
  });
});
