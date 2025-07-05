import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/ui/Header';
import EventTracker from '../dashboard/components/EventTracker';

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/contests')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        setContests(list);
      })
      .catch(() => setError('Failed to load contests'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Upcoming Contests</h1>
        {isLoading ? (
          <div className="h-32 bg-background animate-pulse rounded" />
        ) : error ? (
          <div className="p-4 bg-surface border rounded text-text-secondary">{error}</div>
        ) : (
          <EventTracker contests={contests} />
        )}
      </main>
    </div>
  );
};

export default Contests;