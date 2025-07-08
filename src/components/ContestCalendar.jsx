// src/components/ContestCalendar.jsx
import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
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
        className="h-full dark:calendar-dark"
      />
    </div>
  );
}

export default ContestCalendar;