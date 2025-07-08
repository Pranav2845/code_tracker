// src/components/AddToCalendarButton.jsx

import React from 'react';
import Icon from './AppIcon';

function AddToCalendarButton({ contest }) {
  const handleClick = () => {
    if (!contest) return;
    const start = new Date(contest.startTime)
      .toISOString()
      .replace(/[-:]|\.\d{3}/g, '');
    const end = new Date(contest.endTime)
      .toISOString()
      .replace(/[-:]|\.\d{3}/g, '');
    const url =
      `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        contest.name,
      )}&dates=${start}/${end}&details=${encodeURIComponent(contest.url)}&sf=true&output=xml`;
    window.open(url, '_blank');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="p-2 rounded-md hover:bg-background text-primary"
      title="Add to Google Calendar"
    >
      <Icon name="CalendarPlus" size={18} />
    </button>
  );
}

export default AddToCalendarButton;