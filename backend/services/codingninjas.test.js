import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  fetchCodingNinjasProblems,
  fetchCodingNinjasSolvedCount,
  fetchCodingNinjasContributionStats,
  fetchCodingNinjasSubmissionCount,
} from './codingninjas.js';

vi.mock('axios');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('fetchCodingNinjasSolvedCount', () => {
  it('returns solved count on success', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { user_id: 'u1' } } })
      .mockResolvedValueOnce({ data: { data: { solved_count: 5 } } });
    const count = await fetchCodingNinjasSolvedCount('alice');
    expect(count).toBe(5);
    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/profile/user_details'),
      expect.anything()
    );
    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/profile/contributions'),
      expect.anything()
    );
  });

  it('retries lookup when first attempt fails', async () => {
    axios.get
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({ data: { data: { user_id: 'u2' } } })
      .mockResolvedValueOnce({ data: { data: { solved_count: 3 } } });
    const count = await fetchCodingNinjasSolvedCount('bob');
    expect(count).toBe(3);
    expect(axios.get).toHaveBeenCalledTimes(3);
  });

  it('returns 0 on error', async () => {
    axios.get.mockRejectedValue(new Error('nope'));
    const count = await fetchCodingNinjasSolvedCount('err');
    expect(count).toBe(0);
  });
});

describe('fetchCodingNinjasContributionStats', () => {
  it('returns contributions object', async () => {
    const stats = { solved_count: 7, submission_count: 10 };
    axios.get
      .mockResolvedValueOnce({ data: { data: { user_id: 'ux' } } })
      .mockResolvedValueOnce({ data: { data: stats } });
    const result = await fetchCodingNinjasContributionStats('user');
    expect(result).toEqual(stats);
  });
});

describe('fetchCodingNinjasSubmissionCount', () => {
  it('returns submission count from contributions', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { user_id: 'uid' } } })
      .mockResolvedValueOnce({ data: { data: { submission_count: 9 } } });
    const count = await fetchCodingNinjasSubmissionCount('id');
    expect(count).toBe(9);
  });

  it('returns 0 on network error', async () => {
    axios.get.mockRejectedValue(new Error('bad'));
    const count = await fetchCodingNinjasSubmissionCount('fail');
    expect(count).toBe(0);
  });
});

describe('fetchCodingNinjasProblems', () => {
  it('maps problem data', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { user_id: 'uu' } } })
      .mockResolvedValueOnce({
        data: {
          data: {
            problems: [
              {
                id: 1,
                title: 'Prob',
                difficulty: 'Easy',
                tags: ['dp'],
                solved_at: '2024-01-01T00:00:00Z',
              },
            ],
          },
        },
      });
    const list = await fetchCodingNinjasProblems('user');
    expect(list.length).toBe(1);
    expect(list[0].title).toBe('Prob');
    expect(list[0].solvedAt instanceof Date).toBe(true);
  });

   it('scrapes profile page when API fails', async () => {
    const html = `
      <script id="__NEXT_DATA__" type="application/json">{"problems":[{"id":5,"title":"Scraped"}]}</script>
    `;
    axios.get
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockRejectedValueOnce(new Error('fail3'))
      .mockResolvedValueOnce({ data: html });
    const list = await fetchCodingNinjasProblems('scraper');
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('Scraped');
  });

  it('throws when lookup fails', async () => {
    axios.get.mockRejectedValue(new Error('fail'));
    await expect(fetchCodingNinjasProblems('x')).rejects.toThrow();
  });
});