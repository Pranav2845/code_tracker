import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  fetchCodingNinjasSolvedCount,
  fetchCodingNinjasSubmissionCount,
  fetchCodingNinjasContributionStats,
  fetchCodingNinjasProblems,
} from './codingninjas.js';

vi.mock('axios', () => {
  const instance = {
    get: vi.fn(),
    post: vi.fn(),
  };
  return { default: { ...instance, create: vi.fn(() => instance) } };
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe('fetchCodingNinjasSolvedCount', () => {
  it('uses token endpoint when token provided', async () => {
    axios.get.mockResolvedValueOnce({ data: { stats: { totalSolved: 10 } } });
    const count = await fetchCodingNinjasSolvedCount('user', 'jwt123');
    expect(count).toBe(10);
    expect(axios.get).toHaveBeenCalledWith(
      'https://www.naukri.com/code360/api/v1/user/me/stats',
      { headers: { Authorization: 'Bearer jwt123' } }
    );
  });

  it('falls back to search endpoint when no token', async () => {
    axios.get.mockResolvedValueOnce({
      data: { results: [{ stats: { totalSolved: 5 } }] },
    });
    const count = await fetchCodingNinjasSolvedCount('user');
    expect(count).toBe(5);
    expect(axios.get).toHaveBeenCalledWith(
      'https://www.naukri.com/code360/api/v1/user/search?username=user&fields=profile,stats'
    );
  });

  it('falls back to search endpoint when token request fails', async () => {
    axios.get
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({
        data: { results: [{ stats: { totalSolved: 7 } }] },
      });
    const count = await fetchCodingNinjasSolvedCount('u2', 'jwt');
    expect(count).toBe(7);
    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      'https://www.naukri.com/code360/api/v1/user/me/stats',
      { headers: { Authorization: 'Bearer jwt' } }
    );
    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      'https://www.naukri.com/code360/api/v1/user/search?username=u2&fields=profile,stats'
    );
  });

  it('falls back to user_details when search fails', async () => {
    axios.get
      .mockRejectedValueOnce(new Error('search fail'))
      .mockResolvedValueOnce({
        data: {
          data: {
            dsa_domain_data: { problem_count_data: { total_count: 6 } },
          },
        },
      });
    const count = await fetchCodingNinjasSolvedCount('name');
    expect(count).toBe(6);
    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      'https://www.naukri.com/code360/api/v1/user/search?username=name&fields=profile,stats'
    );
    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      'https://www.naukri.com/code360/api/v3/public_section/profile/user_details?uuid=name&app_context=publicsection&naukri_request=true'
    );
  });
});

describe('fetchCodingNinjasContributionStats', () => {
  it('fetches uuid then stats', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { user_details: { uuid: 'uid123' } } } })
      .mockResolvedValueOnce({
        data: { data: { total_submission_count: 12, type_count_map: { '0': 6, '2': 6 } } },
      });
    const result = await fetchCodingNinjasContributionStats('user');
    expect(result.totalSubmissionCount).toBe(12);
    expect(result.typeCountMap['0']).toBe(6);
    expect(result.typeCountMap['2']).toBe(6);
  });

  it('returns zero counts when uuid missing', async () => {
    axios.get.mockResolvedValueOnce({ data: {} });
    const result = await fetchCodingNinjasContributionStats('user');
    expect(result.totalSubmissionCount).toBe(0);
    expect(result.typeCountMap).toEqual({});
  });
});

describe('fetchCodingNinjasSubmissionCount', () => {
  it('fetches uuid then total count', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { user_details: { uuid: 'u1' } } } })
      .mockResolvedValueOnce({ data: { data: { total_submission_count: 5 } } });
    const count = await fetchCodingNinjasSubmissionCount('foo');
    expect(count).toBe(5);
  });

  it('returns zero when uuid missing', async () => {
    axios.get.mockResolvedValueOnce({ data: {} });
    const count = await fetchCodingNinjasSubmissionCount('bar');
    expect(count).toBe(0);
  });
});

describe('fetchCodingNinjasProblems', () => {
  it('stops after max pages when results repeat', async () => {
    const sample = Array.from({ length: 100 }, (_, i) => ({ problemId: i }));
    axios.get.mockResolvedValue({ data: { solvedProblems: sample } });

    const problems = await fetchCodingNinjasProblems('foo');
    expect(problems.length).toBe(2000); // 20 pages * 100 each
    expect(axios.get).toHaveBeenCalledTimes(20);
  });
});
