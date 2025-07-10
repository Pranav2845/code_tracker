// src/components/AddToCalendarButton.jsx

import React from 'react';
import Icon from './AppIcon';
import { createAddToCalendarUrl } from '../utils/contestEventUtils.js';
function AddToCalendarButton({ contest }) {
  const handleClick = () => {
    if (!contest) return;
        const url = createAddToCalendarUrl(contest);

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