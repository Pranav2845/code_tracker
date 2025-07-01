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
      'https://www.hackerrank.com/rest/contests/master/hackers/user/profile',
      expect.anything() // to account for AXIOS_OPTS
    );
  });

  it('scrapes unique accepted submissions when solved_challenges missing', async () => {
    const html = `
      <table><tbody>
        <tr><td>P1</td><td></td><td></td><td>Accepted</td></tr>
        <tr><td>P2</td><td></td><td></td><td>Accepted</td></tr>
        <tr><td>P1</td><td></td><td></td><td>Accepted</td></tr>
      </tbody></table>`;
    axios.get
      .mockResolvedValueOnce({ data: { model: {} } })
      .mockResolvedValueOnce({ data: html });
    const count = await hr.fetchHackerRankSolvedCount('bob');
    expect(count).toBe(2); // Only P1 and P2 are unique
  });

  it('scrapes submissions when API request fails', async () => {
    const html = `
      <table><tbody>
        <tr><td>P1</td><td></td><td></td><td>Accepted</td></tr>
      </tbody></table>`;
    axios.get
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({ data: html });
    const count = await hr.fetchHackerRankSolvedCount('err');
    expect(count).toBe(1); // Only P1
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
