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
  
  it('uses search when token request times out', async () => {
    axios.get
      .mockRejectedValueOnce(Object.assign(new Error('timeout'), { code: 'ECONNABORTED' }))
      .mockResolvedValueOnce({ data: { results: [{ stats: { totalSolved: 11 } }] } });
    const count = await fetchCodingNinjasSolvedCount('tuser', 'tok');
    expect(count).toBe(11);
    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      'https://www.naukri.com/code360/api/v1/user/me/stats',
      { headers: { Authorization: 'Bearer tok' } }
    );
    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      'https://www.naukri.com/code360/api/v1/user/search?username=tuser&fields=profile,stats'
    );
  });

  it('falls back to user_details after search timeout', async () => {
    axios.get
      .mockRejectedValueOnce(Object.assign(new Error('timeout'), { code: 'ECONNABORTED' }))
      .mockResolvedValueOnce({
        data: { data: { dsa_domain_data: { problem_count_data: { total_count: 9 } } } },
      });
    const count = await fetchCodingNinjasSolvedCount('nuser');
    expect(count).toBe(9);
    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      'https://www.naukri.com/code360/api/v1/user/search?username=nuser&fields=profile,stats'
    );
    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      'https://www.naukri.com/code360/api/v3/public_section/profile/user_details?uuid=nuser&app_context=publicsection&naukri_request=true'
    );
  });

  it('returns zero when all endpoints fail', async () => {
    axios.get.mockRejectedValue(new Error('timeout'));
    const count = await fetchCodingNinjasSolvedCount('fail', 'tok');
    expect(count).toBe(0);
    expect(axios.get).toHaveBeenCalledTimes(3);
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

    it('falls back to search when user_details has no uuid', async () => {
    axios.get
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: { results: [{ profile: { uuid: 'u2' } }] } })
      .mockResolvedValueOnce({ data: { data: { total_submission_count: 3, type_count_map: {} } } });

    const result = await fetchCodingNinjasContributionStats('foo');
    expect(result.totalSubmissionCount).toBe(3);
    expect(axios.get).toHaveBeenCalledTimes(3);
    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      'https://www.naukri.com/code360/api/v3/public_section/profile/user_details?uuid=foo&app_context=publicsection&naukri_request=true'
    );
    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      'https://www.naukri.com/code360/api/v1/user/search?username=foo&fields=profile'
    );
  });

  it('returns zero counts when uuid missing', async () => {
    axios.get.mockResolvedValueOnce({ data: {} });
    const result = await fetchCodingNinjasContributionStats('user');
    expect(result.totalSubmissionCount).toBe(0);
    expect(result.typeCountMap).toEqual({});
  });
  
  it('returns zero when user_details request fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('timeout'));
    const result = await fetchCodingNinjasContributionStats('bad');
    expect(result.totalSubmissionCount).toBe(0);
    expect(result.typeCountMap).toEqual({});
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('returns zero when uuid lookup fails after search error', async () => {
    axios.get
      .mockResolvedValueOnce({ data: {} })
      .mockRejectedValueOnce(new Error('search timeout'));
    const result = await fetchCodingNinjasContributionStats('missing');
    expect(result.totalSubmissionCount).toBe(0);
    expect(result.typeCountMap).toEqual({});
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('returns zero when contributions request fails', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { data: { user_details: { uuid: 'x' } } } })
      .mockRejectedValueOnce(new Error('timeout'));
    const result = await fetchCodingNinjasContributionStats('x');
    expect(result.totalSubmissionCount).toBe(0);
    expect(result.typeCountMap).toEqual({});
    expect(axios.get).toHaveBeenCalledTimes(2);
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
  it('parses mock data when MOCK_CODINGNINJAS=true', async () => {
    process.env.MOCK_CODINGNINJAS = 'true';
    vi.resetModules();
    const { fetchCodingNinjasProblems: fetchMock } = await import('./codingninjas.js');
    const problems = await fetchMock('any');
    expect(problems.length).toBeGreaterThanOrEqual(12);
    expect(problems.every((p) => p.solvedAt instanceof Date)).toBe(true);
    expect(axios.get).not.toHaveBeenCalled();
    delete process.env.MOCK_CODINGNINJAS;
  });