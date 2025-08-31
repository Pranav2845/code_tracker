// src/pages/settings/index.jsx
import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirm: '',
  });
  const [theme, setTheme] = useTheme();
  const [passwordStatus, setPasswordStatus] = useState('');

  // Handle password change
  const changePassword = async e => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirm) {
      setPasswordStatus("New passwords don't match");
      return;
    }
    try {
      await axios.post('/user/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      setPasswordStatus('Password changed');
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPasswordStatus(err.response?.data?.message || 'Password change failed');
    }
  };

  // Theme preference handled by hook
  const toggleTheme = isDark => {
    setTheme(isDark);
  };

  // Sign out
  const signOut = () => {
    sessionStorage.removeItem('token');
    navigate('/sign-in');
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
            Profile updates are managed via Clerk&apos;s hosted pages.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Change Password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          {passwordStatus && <p className="text-sm text-error">{passwordStatus}</p>}
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            label="Current Password"
            labelClassName="dark:text-text-primary"
            value={passForm.currentPassword}
            onChange={e => setPassForm(f => ({ ...f, currentPassword: e.target.value }))}
          />
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            label="New Password"
            labelClassName="dark:text-text-primary"
            value={passForm.newPassword}
            onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))}
          />
          <Input
            id="confirm"
            name="confirm"
            type="password"
            label="Confirm New Password"
            labelClassName="dark:text-text-primary"
            value={passForm.confirm}
            onChange={e => setPassForm(f => ({ ...f, confirm: e.target.value }))}
          />
          <Button type="submit">Change Password</Button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Preferences</h2>
        <ToggleSwitch label="Dark Mode" checked={theme} onChange={toggleTheme} />
      </section>

      <section>
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </section>
    </div>
  );
}
