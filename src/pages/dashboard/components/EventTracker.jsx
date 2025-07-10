import React from 'react';
import { formatDateIST } from '../../../utils/contestEventUtils.js';

const EventTracker = ({ contests, title = 'Upcoming Contests', emptyText = 'No upcoming contests' }) => {
  if (!Array.isArray(contests) || contests.length === 0) {
    return (
      <div className="p-4 bg-surface border rounded text-text-secondary">
        {emptyText}
      </div>
    );
  }
  return (
    <div className="bg-surface border rounded p-4 shadow-sm">
      <h2 className="font-semibold mb-2">{title}</h2>
      <ul className="divide-y divide-border">
        {contests.map((c) => (
          <li key={`${c.platform}-${c.name}`} className="py-2 flex justify-between items-center">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-text-secondary">
                {formatDateIST(c.startTime)}
              </p>
            </div>
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm"
            >
              Join
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventTracker;
