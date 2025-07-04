// File: backend/services/codechef.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchCodeChefSolvedCount } from './codechef.js';

vi.mock('axios');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('fetchCodeChefSolvedCount', () => {
  it('returns count from API when available', async () => {
    axios.post.mockResolvedValueOnce({ data: { result: { data: { access_token: 't' } } } });
    axios.get.mockResolvedValueOnce({
      data: {
        result: {
          data: { content: { fully_solved: { count: 4 } } }
        }
      }
    });
    const count = await fetchCodeChefSolvedCount('user');
    expect(count).toBe(4);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/users/user'),
      expect.objectContaining({ headers: { Authorization: 'Bearer t' } })
    );
  });

  it('falls back to summing list lengths', async () => {
    axios.post.mockResolvedValueOnce({ data: { result: { data: { access_token: 't2' } } } });
    axios.get.mockResolvedValueOnce({
      data: {
        result: {
          data: {
            content: { fully_solved: { school: ['A', 'B'], practice: ['C'] } }
          }
        }
      }
    });
    const count = await fetchCodeChefSolvedCount('bob');
    expect(count).toBe(3);
  });

  it('returns 0 on request error', async () => {
    axios.post.mockResolvedValueOnce({ data: { result: { data: { access_token: 't' } } } });
    axios.get.mockRejectedValueOnce(new Error('fail'));
    const count = await fetchCodeChefSolvedCount('err');
    expect(count).toBe(0);
  });
});