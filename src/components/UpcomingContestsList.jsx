// src/components/UpcomingContestsList.jsx
import React from 'react';
import AddToCalendarButton from './AddToCalendarButton';

function UpcomingContestsList({ contests = [] }) {
  if (!Array.isArray(contests) || contests.length === 0) {
     return null;
  }

  return (
    <ul className="divide-y divide-border bg-surface border rounded">
      {contests.map((c) => (
        <li
          key={c.id || `${c.platform}-${c.name}-${c.startTime}`}
          className="p-4 flex justify-between items-center"
        >
          <div>
            <p className="font-medium">{c.name}</p>
            <p className="text-xs text-text-secondary">
              {new Date(c.startTime).toLocaleString()} - {c.platform}
            </p>
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