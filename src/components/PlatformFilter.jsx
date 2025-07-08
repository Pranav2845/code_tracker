// src/components/PlatformFilter.jsx
import React from 'react';
import Icon from './AppIcon';

function PlatformFilter({ options = [], selected = [], onChange }) {
  const toggle = (platform) => {
    if (selected.includes(platform)) {
      onChange(selected.filter((p) => p !== platform));
    } else {
      onChange([...selected, platform]);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((p) => (
        <label key={p} className="flex items-center space-x-1 text-sm">
          <input
            type="checkbox"
            className="form-checkbox text-primary dark:bg-background dark:border-border"
            checked={selected.includes(p)}
            onChange={() => toggle(p)}
          />
          <span className="capitalize">{p}</span>
        </label>
      ))}
    </div>
  );
}

export default PlatformFilter;