import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { findCSESUserId, fetchCSESCount, fetchCSESSubmissionCount } from './cses.js';

vi.mock('axios');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('findCSESUserId', () => {
  it('returns id when username on first page', async () => {
    const listHtml = '<table><tr><td><a href="/user/42">alice</a></td></tr></table>';
    axios.get.mockResolvedValueOnce({ data: listHtml });
    const id = await findCSESUserId('alice');
    // PATCH: now expects a number, not a string
    expect(id).toBe(42);
    expect(axios.get).toHaveBeenCalledWith('https://cses.fi/list/user/1');
  });

  it('returns id when username on second page', async () => {
    const page1 = '<table><tr><td><a href="/user/1">bob</a></td></tr></table>';
    const page2 = '<table><tr><td><a href="/user/99">charlie</a></td></tr></table>';
    axios.get
      .mockResolvedValueOnce({ data: page1 })
      .mockResolvedValueOnce({ data: page2 });
    const id = await findCSESUserId('charlie');
    expect(id).toBe(99);
    expect(axios.get).toHaveBeenNthCalledWith(1, 'https://cses.fi/list/user/1');
    expect(axios.get).toHaveBeenNthCalledWith(2, 'https://cses.fi/list/user/2');
  });
});

describe('fetchCSESCount', () => {
  it('counts solved problems from profile page', async () => {
    const html = `
      <a href="/problemset/task/1">One</a>
      <a href="/problemset/task/2">Two</a>
      <a href="/problemset/task/3">Three</a>`;
    axios.get.mockResolvedValueOnce({ data: html });
    const count = await fetchCSESCount('42');
    expect(count).toBe(3);
    expect(axios.get).toHaveBeenCalledWith('https://cses.fi/user/42');
  });
});

describe('fetchCSESSubmissionCount', () => {
  it('parses submission count from profile page', async () => {
    const html = '<table><tr><td>Submission count:</td><td>123</td></tr></table>';
    axios.get.mockResolvedValueOnce({ data: html });
    const count = await fetchCSESSubmissionCount('99');
    expect(count).toBe(123);
    expect(axios.get).toHaveBeenCalledWith('https://cses.fi/user/99');
  });

  it('returns 0 when count not found', async () => {
    axios.get.mockResolvedValueOnce({ data: '<div></div>' });
    const count = await fetchCSESSubmissionCount('1');
    expect(count).toBe(0);
  });
});
