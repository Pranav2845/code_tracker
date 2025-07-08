import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchAllContests, fetchUpcomingContests } from './contests.js';

vi.mock('axios');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('fetchAllContests', () => {
  it('separates upcoming and past contests', async () => {
    const future = new Date(Date.now() + 3600_000).toISOString();
    const past = new Date(Date.now() - 3600_000).toISOString();
    axios.get.mockResolvedValueOnce({ data: [
      { name: 'Future', site: 'CF', url: 'u', start_time: future, end_time: future },
      { name: 'Past', site: 'CF', url: 'p', start_time: past, end_time: past }
    ] });
    const res = await fetchAllContests();
    expect(Array.isArray(res.upcoming)).toBe(true);
    expect(Array.isArray(res.past)).toBe(true);
    expect(res.upcoming[0].name).toBe('Future');
    expect(res.past[0].name).toBe('Past');
  });
});

describe('fetchUpcomingContests', () => {
  it('filters and maps upcoming contests', async () => {
    const future = new Date(Date.now() + 3600_000).toISOString();
    const past = new Date(Date.now() - 3600_000).toISOString();
    axios.get.mockResolvedValueOnce({ data: [
      { name: 'Future', site: 'CF', url: 'u', start_time: future, end_time: future },
      { name: 'Past', site: 'CF', url: 'p', start_time: past, end_time: past }
    ] });
    const res = await fetchUpcomingContests();
    expect(res.length).toBe(1);
    expect(res[0].name).toBe('Future');
    expect(res[0].site).toBe('CF');
    expect(res[0].startTime instanceof Date).toBe(true);
    expect(axios.get).toHaveBeenCalledWith('https://kontests.net/api/v1/all');
  });

  it('sorts contests by start time', async () => {
    const soon = new Date(Date.now() + 3600_000).toISOString();
    const later = new Date(Date.now() + 7200_000).toISOString();
    axios.get.mockResolvedValueOnce({ data: [
      { name: 'B', site: 'CF', url: '', start_time: later, end_time: later },
      { name: 'A', site: 'CF', url: '', start_time: soon, end_time: soon }
    ] });
    const list = await fetchUpcomingContests();
    expect(list[0].name).toBe('A');
    expect(list[1].name).toBe('B');
  });

  it('returns empty array on error', async () => {
    axios.get.mockRejectedValueOnce(new Error('fail'));
    const list = await fetchUpcomingContests();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(0);
  });
});