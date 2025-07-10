// src/utils/contestEventUtils.test.js
import { describe, it, expect } from 'vitest';
import {
  contestToCalendarEvent,
  contestsToCalendarEvents,
  createAddToCalendarUrl,
  formatDate,

   formatDateIST,
  formatTimeRangeIST,
  getContestStatus,
} from './contestEventUtils.js';

const baseContest = {
  id: 1,
  name: 'Sample Contest',
  url: 'https://example.com',
  platform: 'Codeforces',
  startTime: '2024-01-01T10:00:00.000Z',
  endTime: '2024-01-01T12:00:00.000Z',
};

describe('contestToCalendarEvent', () => {
  it('converts basic contest', () => {
    const evt = contestToCalendarEvent(baseContest);
    expect(evt.title).toBe(baseContest.name);
       expect(evt.start.toISOString()).toBe('2024-01-01T10:00:00.000Z');
    expect(evt.end.toISOString()).toBe('2024-01-01T12:00:00.000Z');
    expect(evt.allDay).toBe(false);
    expect(evt.popupDetail.addToCalendarUrl).toContain('google.com/calendar');
     expect(evt.popupDetail.date).toBe(formatDate(new Date('2024-01-01T10:00:00.000Z')));
    expect(evt.popupDetail.time).toBe(
        formatTimeRangeIST('2024-01-01T10:00:00.000Z', '2024-01-01T12:00:00.000Z')
    );
    expect(evt.popupDetail.status).toBe(getContestStatus(baseContest));
  });

  it('handles contests spanning days', () => {
    const contest = { ...baseContest, startTime: '2024-01-01T23:00:00.000Z', endTime: '2024-01-02T01:00:00.000Z' };
    const evt = contestToCalendarEvent(contest);
    expect(evt.end.toISOString()).toBe('2024-01-02T00:00:00.000Z');
  });
});

describe('contestsToCalendarEvents', () => {
  it('maps an array of contests', () => {
    const events = contestsToCalendarEvents([baseContest]);
    expect(events.length).toBe(1);
    expect(events[0].title).toBe(baseContest.name);
  });
  });

describe('IST formatting helpers', () => {
  it('formats date in IST', () => {
    expect(formatDateIST('2024-01-01T10:00:00.000Z')).toBe('1st January, 2024');
  });

  it('formats time range in IST', () => {
    expect(
      formatTimeRangeIST('2024-01-01T10:00:00.000Z', '2024-01-01T12:00:00.000Z'),
    ).toBe('03:30 PM - 05:30 PM');
   });
  it('handles ISO strings with trailing Z', () => {
    expect(formatDateIST('2024-01-01T10:00:00Z')).toBe('1st January, 2024');
    expect(
      formatTimeRangeIST('2024-01-01T10:00:00Z', '2024-01-01T12:00:00Z'),
    ).toBe('10:00 AM - 12:00 PM');
  });

  it('handles ISO strings with +00:00 offset', () => {
    expect(formatDateIST('2024-01-01T10:00:00+00:00')).toBe('1st January, 2024');
    expect(
      formatTimeRangeIST(
        '2024-01-01T10:00:00+00:00',
        '2024-01-01T12:00:00+00:00',
      ),
    ).toBe('10:00 AM - 12:00 PM');
  });
});
