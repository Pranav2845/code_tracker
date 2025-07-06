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
  it('fetches paginated submissions', async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          data: {
            problem_submissions: [
              {
                offering_id: 1,
                problem_name: 'A',
                solved_at: '2024-01-01T00:00:00Z',
                link: 'l1',
              },
            ],
            total_pages: 2,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            problem_submissions: [
              {
                offering_id: 2,
                problem_name: 'B',
                link: 'l2',
              },
            ],
            total_pages: 2,
          },
        },
      });

    const list = await fetchCode360Problems('name');
    expect(list).toHaveLength(2);
    expect(list[0].title).toBe('A');
    expect(list[1].id).toBe('2');
    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/view_solved_problems?page=1'),
      expect.anything()
    );
    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/view_solved_problems?page=2'),
      expect.anything()
    );
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
