// src/pages/settings/index.jsx
import React from 'react';
import { useUser, useClerk, UserProfile } from '@clerk/clerk-react';
import Button from '../../components/ui/Button';
import useTheme from '../../hooks/useTheme';

// Simple toggle switch if you don't have one in your ui
const ToggleSwitch = ({ label, checked, onChange }) => (
  <label className="flex items-center space-x-2 mb-4 dark:text-text-primary">
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="form-checkbox h-5 w-5 text-primary"
    />
    <span className="text-text-primary">{label}</span>
  </label>
);

export default function Settings() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [theme, setTheme] = useTheme();

  // Theme preference handled by hook
  const toggleTheme = isDark => {
    setTheme(isDark);
  };

  // Sign out via Clerk
  const handleSignOut = async () => {
    await signOut();
  };

  if (!isLoaded) return <p className="p-4">Loading…</p>;
  if (!user) return <p className="p-4 text-error">No user data</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 min-h-screen bg-background">
      <section>
        <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
        <div className="space-y-2">
          <p>
            <strong>Name:</strong> {user.fullName}
          </p>
          <p>
            <strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}
          </p>
          <p className="text-sm text-muted-foreground">
            Manage your account details and password using the profile form below.
          </p>
        </div>
      </section>

      <section>
        <UserProfile />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Preferences</h2>
        <ToggleSwitch label="Dark Mode" checked={theme} onChange={toggleTheme} />
      </section>

      <section>
        <Button variant="outline" onClick={handleSignOut}>
          Sign out
        </Button>
      </section>
    </div>
  );
}
