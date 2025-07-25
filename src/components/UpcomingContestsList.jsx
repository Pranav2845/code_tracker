// src/components/UpcomingContestsList.jsx
import React from 'react';
import AddToCalendarButton from './AddToCalendarButton';
import PlatformLogo from './PlatformLogo';
import { formatDateIST } from '../utils/contestEventUtils.js';
function UpcomingContestsList({ contests = [], past = false }) {
   const list = Array.isArray(contests) ? contests : [];

  if (list.length === 0) {
    return (
      <div className="p-4 bg-surface border rounded text-text-secondary">
        {past ? 'No past contests' : 'No upcoming contests'}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border bg-surface border rounded">
      {list.map((c) => (
        <li
          key={c.id || `${c.platform}-${c.name}-${c.startTime}`}
          className="p-4 flex justify-between items-center"
        >
          <div className="flex items-start space-x-2">
            <PlatformLogo platform={c.platform} className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-text-secondary">
                {formatDateIST(c.startTime)} - {c.platform}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm"
            >
              Join
            </a>
            <AddToCalendarButton contest={c} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default UpcomingContestsList;
