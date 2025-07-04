import React from 'react';

const EventTracker = ({ contests }) => {
  if (!Array.isArray(contests) || contests.length === 0) {
    return (
      <div className="p-4 bg-surface border rounded text-text-secondary">
        No upcoming contests
      </div>
    );
  }
  return (
    <div className="bg-surface border rounded p-4 shadow-sm">
      <h2 className="font-semibold mb-2">Upcoming Contests</h2>
      <ul className="divide-y divide-border">
        {contests.map((c) => (
          <li key={`${c.site}-${c.name}`} className="py-2 flex justify-between items-center">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-text-secondary">
                {new Date(c.startTime).toLocaleString()}
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