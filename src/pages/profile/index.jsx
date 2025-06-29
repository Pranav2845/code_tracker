// src/pages/profile/index.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    axios.get('/user/profile')
      .then(res => setProfile(res.data))
      .catch(() => setError('Failed to load profile'));
  }, []);

  if (error) return <p className="p-4 text-error">{error}</p>;
  if (!profile) return <p className="p-4">Loading…</p>;

  return (
     <div className="max-w-3xl mx-auto p-6 min-h-screen bg-background">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <div className="space-y-2">
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Joined:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
      </div>
      {/* You can expand this with form inputs to edit your name/email etc. */}
    </div>
  );
}
