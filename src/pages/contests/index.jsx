// src/pages/contests/index.jsx
import React, { useState, useMemo, useEffect } from 'react';
import Header from '../../components/ui/Header';
import ContestSearchBar from '../../components/ContestSearchBar';
import ContestCalendar from '../../components/ContestCalendar';
import { fetchContests } from '../../api/contests';

const Contests = () => {
  const [search, setSearch] = useState('');
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

  const filtered = useMemo(() => {
       const term = search.trim().toLowerCase();
    if (!term) return contests;
    return contests.filter((c) =>
      c.name.toLowerCase().includes(term)
    );
  }, [contests, search]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 py-7 flex flex-col">
        <h1 className="text-3xl font-bold mb-5">Contests</h1>
        <div className="mb-6 flex justify-between items-center">
          <ContestSearchBar value={search} onChange={setSearch} className="max-w-md" />
        </div>
        {/* Responsive calendar fills the available space */}
        <div style={{ flex: 1, minHeight: 550 }}>
          <ContestCalendar contests={filtered} />
        </div>
      </main>
    </div>
  );
};

export default Contests;
