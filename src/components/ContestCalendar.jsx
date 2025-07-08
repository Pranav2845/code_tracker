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

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function Toolbar({ label, onNavigate }) {
  return (
    <div className="rbc-toolbar flex justify-between items-center mb-2 px-2">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate('TODAY')}>Today</button>
      </span>
      <span className="rbc-toolbar-label font-medium">{label}</span>
      <span className="rbc-btn-group space-x-2">
        <button type="button" onClick={() => onNavigate('PREV')} aria-label="Previous month">
          <Icon name="ChevronLeft" size={16} />
        </button>
        <button type="button" onClick={() => onNavigate('NEXT')} aria-label="Next month">
          <Icon name="ChevronRight" size={16} />
        </button>
      </span>
    </div>
  );
}

function ContestCalendar({ contests = [] }) {
  const events = contests.map((c) => ({
    title: c.name,
    start: new Date(c.startTime),
    end: new Date(c.endTime),
  }));

  return (
    <div className="h-96 bg-surface border rounded">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={["month"]}
        components={{ toolbar: Toolbar }}
        className="h-full dark:calendar-dark"
      />
    </div>
  );
}

export default ContestCalendar;