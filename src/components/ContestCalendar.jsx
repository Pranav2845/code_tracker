// src/components/ContestCalendar.jsx
import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import Icon from './AppIcon';
import Image from './AppImage';
import AddToCalendarButton from './AddToCalendarButton';
import {
  contestsToCalendarEvents,
  formatDateIST,
  formatTimeRangeIST,
} from '../utils/contestEventUtils.js';
import PlatformLogo from './PlatformLogo';
import ContestDetailModal from './ContestDetailModal';
import '../styles/calendar.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Platform logos for event icons
const PLATFORM_LOGOS = {
  leetcode: '/assets/images/leetcode.png',
  codeforces: '/assets/images/codeforces.png',
  gfg: '/assets/images/gfg.png',
  cses: '/assets/images/cses_.png',
  codechef: '/assets/images/codechef.png',
  atcoder: '/assets/images/atcoder.webp',

  code360: '/assets/images/codingninjas.jpeg',
  hackerrank: '/assets/images/hackerrank.webp',
};

// Custom toolbar
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
  const dateLabel = formatDateIST(event.start);
  const timeLabel = formatTimeRangeIST(
    event.originalData.startTime,
    event.originalData.endTime,
  );
  return (
    <button
      type="button"
      className="calendar-event w-full flex items-center space-x-1 relative group text-left"
    >
      <Image
        src={PLATFORM_LOGOS[event.platform?.toLowerCase()]}
        alt={event.platform}
        className="w-4 h-4"
      />
      <span className="truncate">{event.title}</span>
      {/* Tooltip on hover */}
      <div className="event-tooltip absolute left-0 z-10 hidden group-hover:block bg-surface shadow-xl border rounded p-3 min-w-[220px] text-xs">
        <p className="font-semibold mb-1">{event.title}</p>
        <p className="text-xs opacity-80 mb-2">
          {dateLabel} | {timeLabel}
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
    </button>
  );
}

function ContestCalendar({ contests = [] }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const events = contestsToCalendarEvents(contests);

  // REMOVE eventPropGetter for single color scheme!
  // const eventPropGetter = (event) => { ... }

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const closeModal = () => setSelectedEvent(null);

  return (
    <div className="calendar-wrapper" style={{ width: '100%', height: '100%' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={["month"]}
        showAllEvents
        components={{ toolbar: Toolbar, event: Event }}
        // REMOVE eventPropGetter for single color:
        // eventPropGetter={eventPropGetter}
        className="calendar-full dark:calendar-dark"
        style={{ width: '100%', height: '100%', minHeight: '500px', background: 'none', border: 'none' }}
        onSelectEvent={handleSelectEvent}
      />
      <ContestDetailModal event={selectedEvent} onClose={closeModal} />
    </div>
  );
}

export default ContestCalendar;
