// src/components/ContestCalendar.jsx
import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import Icon from './AppIcon';
import Image from './AppImage';
import AddToCalendarButton from './AddToCalendarButton';
import PlatformLogo from './PlatformLogo';
import '../styles/calendar.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const PLATFORM_COLORS = {
  leetcode: 'var(--color-leetcode)',
  codeforces: 'var(--color-codeforces)',
  gfg: 'var(--color-gfg)',
  cses: 'var(--color-cses)',
  codechef: 'var(--color-codechef)',
  code360: 'var(--color-code360)',
};

const PLATFORM_LOGOS = {
  leetcode: '/assets/images/leetcode.png',
  codeforces: '/assets/images/codeforces.png',
  gfg: '/assets/images/gfg.png',
  cses: '/assets/images/cses_.png',
  codechef: '/assets/images/codechef.jpeg',
  code360: '/assets/images/codingninjas.jpeg',
};

// Custom toolbar as before
function Toolbar({ label, onNavigate }) {
  return (
    <div className="rbc-toolbar flex justify-between items-center mb-4 px-4 pt-2 pb-3 bg-transparent">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate('TODAY')} className="font-semibold">
          Today
        </button>
      </span>
      <span className="rbc-toolbar-label font-semibold text-lg select-none">{label}</span>
      <span className="rbc-btn-group flex gap-2">
        <button type="button" onClick={() => onNavigate('PREV')} aria-label="Previous month">
          <Icon name="ChevronLeft" size={20} />
        </button>
        <button type="button" onClick={() => onNavigate('NEXT')} aria-label="Next month">
          <Icon name="ChevronRight" size={20} />
        </button>
      </span>
    </div>
  );
}

function Event({ event }) {
  const start = new Date(event.start).toLocaleString();
  const end = new Date(event.end).toLocaleString();
  return (
    <div className="calendar-event flex items-center space-x-1 relative group">
      <Image
        src={PLATFORM_LOGOS[event.platform]}
        alt={event.platform}
        className="w-4 h-4"
      />
      <span className="truncate">{event.title}</span>
      {/* Tooltip on hover */}
      <div className="event-tooltip absolute left-0 z-10 hidden group-hover:block bg-surface shadow-xl border rounded p-3 min-w-[220px] text-xs">
        <p className="font-semibold mb-1">{event.title}</p>
        <p className="text-xs opacity-80 mb-2">
          {start} - {end}
        </p>
        <div className="flex items-center space-x-2">
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline text-sm"
          >
            Join
          </a>
          <AddToCalendarButton contest={event.originalData} />
        </div>
      </div>
    </div>
  );
}

function ContestCalendar({ contests = [] }) {
  const events = contests.map((c) => ({
    id: c.id,
    title: c.name,
    start: new Date(c.startTime),
    end: new Date(c.endTime),
    url: c.url,
    platform: c.platform,
    originalData: c,
  }));

  const eventPropGetter = (event) => {
    const color = PLATFORM_COLORS[event.platform] || 'var(--color-primary)';
    return {
      style: { backgroundColor: color },
      className: event.platform,
    };
  };

  return (
    // Only take full available space (let parent control height)
    <div className="calendar-wrapper" style={{ width: '100%', height: '100%' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={["month"]}
        components={{ toolbar: Toolbar, event: Event }}
        eventPropGetter={eventPropGetter}
        className="calendar-full dark:calendar-dark"
        style={{ width: '100%', height: '100%', minHeight: '500px', background: 'none', border: 'none' }}
      />
    </div>
  );
}

export default ContestCalendar;
