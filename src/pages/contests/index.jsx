import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../components/ui/Header';
import EventTracker from '../dashboard/components/EventTracker';

const Contests = () => {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/contests')
      .then(res => {
        setUpcoming(Array.isArray(res.data?.upcoming) ? res.data.upcoming : []);
        setPast(Array.isArray(res.data?.past) ? res.data.past : []);
      })
      .catch(() => setError('Failed to load contests'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Contests</h1>
        {isLoading ? (
          <div className="h-32 bg-background animate-pulse rounded" />
        ) : error ? (
          <div className="p-4 bg-surface border rounded text-text-secondary">{error}</div>
        ) : (
          <>
            <div className="mb-6">
              <EventTracker
                contests={upcoming}
                title="Upcoming Contests"
                emptyText="No upcoming contests"
              />
            </div>
            <EventTracker
              contests={past}
              title="Past Contests"
              emptyText="No past contests"
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Contests;
