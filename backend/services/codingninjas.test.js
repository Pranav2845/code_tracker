import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchCodingNinjasSolvedCount } from './codingninjas.js';

vi.mock('axios');

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
});