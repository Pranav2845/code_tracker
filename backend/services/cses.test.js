// backend/services/cses.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  findCSESUserId,
  fetchCSESProblems,
  fetchCSESSolvedCount,
  fetchCSESSubmissionCount,
} from './cses.js';

vi.mock('axios');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('findCSESUserId', () => {
  it('returns id when username on first page', async () => {
    const listHtml = '<table><tr><td><a href="/user/42">alice</a></td></tr></table>';
    axios.get.mockResolvedValueOnce({ data: listHtml });
    const id = await findCSESUserId('alice');
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

describe('fetchCSESProblems', () => {
  it('maps solved grid indices to problem titles', async () => {
    const listHtml = '<table>' +
      '<tr><td><a href="/problemset/task/1">P1</a></td></tr>' +
      '<tr><td><a href="/problemset/task/2">P2</a></td></tr>' +
      '<tr><td><a href="/problemset/task/3">P3</a></td></tr>' +
      '</table>';

    const gridHtml = '<div>Solved tasks: 2/3</div>' +
      '<table><tr><td class="done"></td><td></td><td class="done"></td></tr></table>';

    axios.get
      .mockResolvedValueOnce({ data: listHtml })
      .mockResolvedValueOnce({ data: gridHtml });

    const problems = await fetchCSESProblems('55');
    expect(problems).toHaveLength(2);
    expect(problems[0].title).toBe('P1');
    expect(problems[1].title).toBe('P3');
    expect(axios.get).toHaveBeenNthCalledWith(1, 'https://cses.fi/problemset/');
    expect(axios.get).toHaveBeenNthCalledWith(2, 'https://cses.fi/problemset/user/55');
  });
  
  it('returns empty array on network error', async () => {
    axios.get.mockRejectedValueOnce(new Error('fail'));
    axios.get.mockResolvedValueOnce({ data: '<table></table>' });
    const list = await fetchCSESProblems('99');
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(0);
  });
  
});

describe('fetchCSESSolvedCount', () => {
  it('reads the solved task count from the grid page', async () => {
    const gridHtml = '<div>Solved tasks: 2/400</div><table></table>';
    axios.get.mockResolvedValueOnce({ data: gridHtml });
    const count = await fetchCSESSolvedCount('42');
    expect(count).toBe(2);
    expect(axios.get).toHaveBeenCalledWith('https://cses.fi/problemset/user/42');
  });
  
  it('handles JSON script data when text is missing', async () => {
    const gridHtml =
      '<script type="application/json">{"solved_tasks":5,"total_tasks":400}</script>' +
      '<table></table>';
    axios.get.mockResolvedValueOnce({ data: gridHtml });
    const count = await fetchCSESSolvedCount('77');
    expect(count).toBe(5);
    expect(axios.get).toHaveBeenCalledWith('https://cses.fi/problemset/user/77');
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

  it('returns 0 on network error', async () => {
    axios.get.mockRejectedValueOnce(new Error('network fail'));
    const count = await fetchCSESSubmissionCount('2');
    expect(count).toBe(0);
  });
});
