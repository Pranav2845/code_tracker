// src/pages/contests/index.jsx

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Header from '../../components/ui/Header';
import ContestSearchBar from '../../components/ContestSearchBar';
import PlatformFilter from '../../components/PlatformFilter';
import UpcomingContestsList from '../../components/UpcomingContestsList';
import ContestCalendar from '../../components/ContestCalendar';

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  useEffect(() => {
    axios
      .get('/contests')
      .then((res) => {
        setContests(Array.isArray(res.data?.upcoming) ? res.data.upcoming : []);
      })
      .catch(() => setError('Failed to load contests'))
      .finally(() => setIsLoading(false));
  }, []);

  // Unique platform names for dropdown
  const platforms = useMemo(
    () => Array.from(new Set(contests.map((c) => c.platform))),
    [contests],
  );

  // Filter by search and selected platforms
  const filtered = useMemo(() => {
    return contests.filter((c) => {
      if (
        selectedPlatforms.length > 0 &&
        !selectedPlatforms.includes(c.platform)
      ) {
        return false;
      }
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [contests, selectedPlatforms, search]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">Contests</h1>
        {isLoading ? (
          <div className="h-32 bg-background animate-pulse rounded" />
        ) : error ? (
          <div className="p-4 bg-surface border rounded text-text-secondary">
            {error}
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <ContestSearchBar
                value={search}
                onChange={setSearch}
                className="md:w-64"
              />
              <PlatformFilter
                options={platforms}
                selected={selectedPlatforms}
                onChange={setSelectedPlatforms}
              />
            </div>

            {/* Upcoming contests list (sidebar style) */}
            <UpcomingContestsList contests={filtered} />

            {/* Calendar view */}
            <ContestCalendar contests={filtered} />
          </>
        )}
      </main>
    </div>
  );
};

export default Contests;
