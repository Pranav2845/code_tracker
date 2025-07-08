// src/components/ContestCalendar.jsx
import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import Icon from './AppIcon';
import '../styles/calendar.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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
  return (
    <div className="flex flex-col">
      <a
        href={event.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        {event.title}
      </a>
      {event.start && (
        <time className="text-xs opacity-75">
          {new Date(event.start).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </time>
      )}
    </div>
  );
}

function ContestCalendar({ contests = [] }) {
  const events = contests.map((c) => ({
    title: c.name,
    start: new Date(c.startTime),
    end: new Date(c.endTime),
    url: c.url,
    platform: c.platform,
  }));

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
        className="calendar-full dark:calendar-dark"
        style={{ width: '100%', height: '100%', minHeight: '500px', background: 'none', border: 'none' }}
      />
    </div>
  );
}

export default ContestCalendar;
