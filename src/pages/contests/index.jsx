import React, { useState, useMemo, useEffect } from 'react';
import Header from '../../components/ui/Header';
import ContestSearchBar from '../../components/ContestSearchBar';
import ContestCalendar from '../../components/ContestCalendar';
import UpcomingContestsList from '../../components/UpcomingContestsList';
import PlatformFilter from '../../components/PlatformFilter';
import { fetchContests } from '../../api/contests';
import { parseContestTimeToUTC } from '../../utils/contestEventUtils.js';

// Utility to split contests into upcoming and ongoing (past removed)
function splitContests(contests, now) {
  const all = Array.isArray(contests)
    ? contests
    : Array.isArray(contests?.upcoming)
    ? contests.upcoming
    : [];

  const upcoming = [];
  const ongoing = [];
  const nowMs = typeof now === 'number' ? now : new Date(now).getTime();

  for (const c of all) {
    const startMs = parseContestTimeToUTC(c.startTime).getTime();
    const endMs = parseContestTimeToUTC(c.endTime).getTime();

    if (endMs < nowMs) {
      continue; // ✅ Skip past contests
    } else if (startMs > nowMs) {
      upcoming.push(c); // ✅ Future contests
    } else {
      ongoing.push(c); // ✅ Running right now
    }
  }

  return { upcoming, ongoing };
}

const Contests = () => {
  const [search, setSearch] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [contests, setContests] = useState({ upcoming: [] });
  const [now, setNow] = useState(Date.now());

  // Update "now" every minute to keep contest states fresh
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Fetch contests from API
  useEffect(() => {
    fetchContests()
      .then((data) => {
        setContests({
          upcoming: Array.isArray(data.upcoming) ? data.upcoming : [],
        });
      })
      .catch((err) => {
        console.error('Failed to load contests:', err);
      });
  }, []);

  // Split fetched contests into upcoming and ongoing
  const { upcoming, ongoing } = useMemo(
    () => splitContests(contests, now),
    [contests, now]
  );

  // List of unique platforms from filtered contests
  const platformOptions = useMemo(() => {
    const raw = [...upcoming, ...ongoing];
    return Array.from(new Set(raw.map((c) => c.platform))).sort();
  }, [upcoming, ongoing]);

  // Filtered list for contest sidebar (by search + platform)
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = [...upcoming, ...ongoing];
    return list.filter((c) => {
      const matchesSearch = !term || c.name.toLowerCase().includes(term);
      const matchesPlatform =
        selectedPlatforms.length === 0 ||
        selectedPlatforms.includes(c.platform);
      return matchesSearch && matchesPlatform;
    });
  }, [upcoming, ongoing, search, selectedPlatforms]);

  // Filtered contests for calendar view
  const calendarContests = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = [...upcoming, ...ongoing];
    return list.filter((c) => {
      const matchesSearch = !term || c.name.toLowerCase().includes(term);
      const matchesPlatform =
        selectedPlatforms.length === 0 ||
        selectedPlatforms.includes(c.platform);
      return matchesSearch && matchesPlatform;
    });
  }, [upcoming, ongoing, search, selectedPlatforms]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 py-7 flex flex-col">
        <h1 className="text-3xl font-bold mb-5">Contests</h1>

        {/* Search + Filter */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <ContestSearchBar value={search} onChange={setSearch} className="max-w-md" />
          <PlatformFilter
            options={platformOptions}
            selected={selectedPlatforms}
            onChange={setSelectedPlatforms}
          />
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-3 flex-1" style={{ minHeight: 550 }}>
          <div className="lg:col-span-1 overflow-y-auto">
            <UpcomingContestsList contests={filtered} past={false} />
          </div>
          <div className="lg:col-span-2">
            <ContestCalendar contests={calendarContests} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contests;
