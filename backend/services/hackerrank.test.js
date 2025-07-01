import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import * as hr from './hackerrank.js';

vi.mock('axios');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('fetchHackerRankSolvedCount', () => {
  it('returns solved_challenges from API when available', async () => {
    axios.get.mockResolvedValueOnce({ data: { model: { solved_challenges: 4 } } });
    const count = await hr.fetchHackerRankSolvedCount('user');
    expect(count).toBe(4);
    expect(axios.get).toHaveBeenCalledWith(
      'https://www.hackerrank.com/rest/contests/master/hackers/user/profile'
    );
  });

  it('invokes scraper when solved_challenges missing', async () => {
    axios.get.mockResolvedValueOnce({ data: { model: {} } });
    const spy = vi
      .spyOn(hr, 'fetchHackerRankProblems')
      .mockResolvedValueOnce([1, 2]);
    const count = await hr.fetchHackerRankSolvedCount('bob');
    expect(spy).toHaveBeenCalledWith('bob');
    expect(count).toBe(2);
  });

  it('invokes scraper when API request fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('fail'));
    const spy = vi
      .spyOn(hr, 'fetchHackerRankProblems')
      .mockResolvedValueOnce([{}, {}, {}]);
    const count = await hr.fetchHackerRankSolvedCount('err');
    expect(spy).toHaveBeenCalledWith('err');
    expect(count).toBe(3);
  });
  });

describe('fetchHackerRankProblems', () => {
  it('returns empty array on 403', async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 403 } });
    const list = await hr.fetchHackerRankProblems('user');
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(0);
  });

  it('propagates other errors', async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(hr.fetchHackerRankProblems('foo')).rejects.toBeTruthy();
  });
});