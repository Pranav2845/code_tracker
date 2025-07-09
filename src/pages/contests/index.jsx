// src/pages/contests/index.jsx
import React, { useState, useMemo, useEffect } from 'react';
import Header from '../../components/ui/Header';
import ContestSearchBar from '../../components/ContestSearchBar';
import ContestCalendar from '../../components/ContestCalendar';
import UpcomingContestsList from '../../components/UpcomingContestsList';
import PlatformFilter from '../../components/PlatformFilter';
import { fetchContests } from '../../api/contests';

const Contests = () => {
  const [search, setSearch] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [contests, setContests] = useState([]);

  useEffect(() => {
    fetchContests()
      .then((data) => {
        setContests(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to load contests:', err);
      });
  }, []);

    const platformOptions = useMemo(
    () => Array.from(new Set(contests.map((c) => c.platform))).sort(),
    [contests]
  );

  const filtered = useMemo(() => {
       const term = search.trim().toLowerCase();
    return contests.filter((c) => {
      const matchesSearch = !term || c.name.toLowerCase().includes(term);
      const matchesPlatform =
        selectedPlatforms.length === 0 ||
        selectedPlatforms.includes(c.platform);
      return matchesSearch && matchesPlatform;
    });
  }, [contests, search, selectedPlatforms]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 py-7 flex flex-col">
        <h1 className="text-3xl font-bold mb-5">Contests</h1>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <ContestSearchBar value={search} onChange={setSearch} className="max-w-md" />
          <PlatformFilter
            options={platformOptions}
            selected={selectedPlatforms}
            onChange={setSelectedPlatforms}
          />
        </div>
                <div className="grid gap-8 lg:grid-cols-3 flex-1" style={{ minHeight: 550 }}>
          <div className="lg:col-span-1 overflow-y-auto">
            <UpcomingContestsList contests={filtered} />
          </div>
          <div className="lg:col-span-2">
            <ContestCalendar contests={filtered} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contests;
