// src/pages/profile/index.jsx
import React from 'react';
import { useUser } from '@clerk/clerk-react';

export default function Profile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <p className="p-4">Loading…</p>;
  if (!user) return <p className="p-4 text-error">No user data</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-screen bg-background">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <div className="space-y-2">
        <p><strong>Name:</strong> {user.fullName}</p>
        <p><strong>Email:</strong> {user.emailAddresses?.[0]?.emailAddress}</p>
        <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>
      {/* You can expand this with form inputs to edit your name/email etc. */}
    </div>
  );
}
