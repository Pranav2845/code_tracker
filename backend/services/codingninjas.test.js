// File: backend/services/codingninjas.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  fetchCode360Problems,
  fetchCode360SolvedCount,
  fetchCode360ContributionStats,
  fetchCode360SubmissionCount,
  fetchCode360ProfileTotalCount,
} from './code360.js';

vi.mock('axios');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('fetchCode360SolvedCount', () => {
  it('returns solved count on success', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { user_id: 'u1' } } })
      .mockResolvedValueOnce({ data: { data: { solved_count: 5 } } });
    const count = await fetchCode360SolvedCount('alice');
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

  it('uses numeric id when both numeric id and uuid exist', async () => {
    axios.get
      .mockResolvedValueOnce({
        data: { data: { profile: { user_id: 55, uuid: 'abc' } } },
      })
      .mockResolvedValueOnce({ data: { data: { solved_count: 2 } } });
    const count = await fetchCode360SolvedCount('mix');
    expect(count).toBe(2);
    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('user_id=55'),
      expect.anything()
    );
  });

  it('retries lookup when first attempt fails', async () => {
    axios.get
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({ data: { data: { user_id: 'u2' } } })
      .mockResolvedValueOnce({ data: { data: { solved_count: 3 } } });
    const count = await fetchCode360SolvedCount('bob');
    expect(count).toBe(3);
    expect(axios.get).toHaveBeenCalledTimes(3);
  });

  it('returns 0 on error', async () => {

    axios.get.mockRejectedValue(new Error('nope'));
    const count = await fetchCode360SolvedCount('err');
    expect(count).toBe(0);
  });
});

describe('fetchCode360ContributionStats', () => {
  it('returns contributions object', async () => {
    const stats = { solved_count: 7, submission_count: 10 };
    axios.get
      .mockResolvedValueOnce({ data: { data: { user_id: 'ux' } } })
      .mockResolvedValueOnce({ data: { data: stats } });
    const result = await fetchCode360ContributionStats('user');
    expect(result).toEqual(stats);
  });
});

describe('fetchCode360SubmissionCount', () => {
  it('returns submission count from contributions', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { user_id: 'uid' } } })
      .mockResolvedValueOnce({ data: { data: { submission_count: 9 } } });
    const count = await fetchCode360SubmissionCount('id');
    expect(count).toBe(9);
  });

  it('returns 0 on network error', async () => {
    axios.get.mockRejectedValue(new Error('bad'));
    const count = await fetchCode360SubmissionCount('fail');
    expect(count).toBe(0);
  });
});

describe('fetchCode360Problems', () => {
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
    const list = await fetchCode360Problems('user');
    expect(list.length).toBe(1);
    expect(list[0].title).toBe('Prob');
    expect(list[0].solvedAt instanceof Date).toBe(true);
  });

  it('handles problemName field', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { user_id: 'pname' } } })
      .mockResolvedValueOnce({
        data: {
          data: {
            problems: [
              {
                problemName: 'ByName',
                difficulty: 'Hard',
              },
            ],
          },
        },
      });

    const list = await fetchCode360Problems('pname');
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('ByName');
    expect(list[0].id).toBe('ByName');
  });

   it('maps problemId level and topics fields', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { user_id: 'pid' } } })
      .mockResolvedValueOnce({
        data: {
          data: {
            problems: [
              {
                problemId: 9,
                level: 'Medium',
                topics: ['graph'],
                solved_at: '2024-01-02T00:00:00Z',
              },
            ],
          },
        },
      });

    const list = await fetchCode360Problems('pid');
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('9');
    expect(list[0].difficulty).toBe('Medium');
    expect(list[0].tags).toEqual(['graph']);
    expect(list[0].title).toBe('');
  });

  it('detects nested arrays with slug field', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { user_id: 'sid' } } })
      .mockResolvedValueOnce({
        data: {
          data: {
            wrapper: {
              arr: [
                {
                  slug: 'slug-problem',
                  level: 'Hard',
                },
              ],
            },
          },
        },
      });

    const list = await fetchCode360Problems('sid');
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('slug-problem');
    expect(list[0].title).toBe('slug-problem');
    expect(list[0].difficulty).toBe('Hard');
  });
  it('reads nested problems from API response', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { user_id: 'nid' } } })
      
      .mockResolvedValueOnce({
        data: {
          data: {
            outer: {
              inner: {
                list: [
                  {
                    id: 2,
                    title: 'Nested',
                  },
                ],
              },
            },
          },
        },
      });

    const list = await fetchCode360Problems('nested');
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('Nested');
    expect(axios.get).toHaveBeenCalledTimes(2);
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
    const list = await fetchCode360Problems('scraper');
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('Scraped');
  });

   it('scrapes profile page when API returns empty list', async () => {
    const html = `
      <script id="__NEXT_DATA__" type="application/json">{"problems":[{"id":7,"title":"Fallback"}]}</script>
    `;
    axios.get
      .mockResolvedValueOnce({ data: { data: { user_id: 'uid' } } })
      .mockResolvedValueOnce({ data: { data: { problems: [] } } })
      .mockResolvedValueOnce({ data: html });
    const list = await fetchCode360Problems('empty');
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('Fallback');
  });

  it('throws when lookup fails', async () => {
    axios.get.mockRejectedValue(new Error('fail'));
    await expect(fetchCode360Problems('x')).rejects.toThrow();
  });
});

describe('fetchCode360ProfileTotalCount', () => {
  it('returns total count on success', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        data: {
          profile: {
            dsa_domain_data: { problem_count_data: { total_count: 42 } },
          },
        },
      },
    });
    const count = await fetchCode360ProfileTotalCount('alpha');
    expect(count).toBe(42);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/profile/user_details'),
      expect.anything()
    );
  });

  it('returns null on request error', async () => {
    axios.get.mockRejectedValueOnce(new Error('oops'));
    const result = await fetchCode360ProfileTotalCount('err');
    expect(result).toBeNull();
  });
});