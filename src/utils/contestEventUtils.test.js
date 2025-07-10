import { describe, it, expect } from 'vitest';
import { contestToCalendarEvent, contestsToCalendarEvents, createAddToCalendarUrl } from './contestEventUtils.js';

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
    expect(evt.start.toISOString()).toBe(baseContest.startTime);
    expect(evt.end.toISOString()).toBe(baseContest.endTime);
    expect(evt.allDay).toBe(false);
    expect(evt.popupDetail.addToCalendarUrl).toContain('google.com/calendar');
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