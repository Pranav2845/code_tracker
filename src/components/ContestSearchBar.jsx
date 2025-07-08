// src/components/ContestSearchBar.jsx

import React from 'react';
import Input from './ui/Input';

function ContestSearchBar({ value, onChange, className = '' }) {
  return (
    <Input
      variant="search"
      placeholder="Search contests..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  );
}

export default ContestSearchBar;