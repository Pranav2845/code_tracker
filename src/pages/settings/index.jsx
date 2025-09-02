// src/pages/settings/index.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import useTheme from '../../hooks/useTheme';
import Header from '../../components/ui/Header';

// Simple toggle switch (uses your design tokens)
const ToggleSwitch = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
    />
    <span className="text-base text-text-primary">{label}</span>
  </label>
);

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [theme, setTheme] = useTheme();
  const [status, setStatus] = useState({ profile: '', password: '' });

  // 1) Load current profile
  useEffect(() => {
    axios
      .get('/user/profile')
      .then((res) => setProfile({ name: res.data.name || '', email: res.data.email || '' }))
      .catch(() => setStatus((s) => ({ ...s, profile: 'Failed to load profile' })));
  }, []);

  // ✅ Auto-hide profile success message after 3s
  useEffect(() => {
    if (status.profile) {
      const timer = setTimeout(() => {
        setStatus((s) => ({ ...s, profile: '' }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status.profile]);

  // 2) Update profile
  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.patch('/user/profile', profile);
      setStatus((s) => ({ ...s, profile: 'Profile updated successfully' }));
    } catch (err) {
      setStatus((s) => ({ ...s, profile: err.response?.data?.message || 'Update failed' }));
    }
  };

  // 3) Change password
  const changePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirm) {
      setStatus((s) => ({ ...s, password: "New passwords don't match" }));
      return;
    }
    try {
      await axios.post('/user/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      setStatus((s) => ({ ...s, password: 'Password changed' }));
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setStatus((s) => ({ ...s, password: err.response?.data?.message || 'Password change failed' }));
    }
  };

  // 4) Theme preference
  const toggleTheme = (isDark) => setTheme(isDark);

  // 5) Sign out
  const signOut = () => {
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-8 py-12">
          {/* ✅ Global success message at top center (auto disappears in 3s) */}
          {status.profile && (
            <div className="mb-6 text-center text-lg font-medium text-success">
              {status.profile}
            </div>
          )}

          <h1 className="mb-10 text-4xl font-bold">Settings</h1>

          {/* Two-column responsive grid */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {/* LEFT: Profile + Preferences */}
            <div className="space-y-8">
              {/* Profile Settings card */}
              <section className="rounded-2xl border border-border/40 bg-card p-8 shadow-md">
                <h2 className="mb-6 text-2xl font-semibold">Profile Settings</h2>
                <form onSubmit={updateProfile} className="space-y-5">
                  <Input
                    id="name"
                    label="Full Name"
                    className="text-base"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  />
                  <Input
                    id="email"
                    type="email"
                    label="Email"
                    className="text-base"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  />

                  <div className="flex flex-wrap gap-4">
                    <Button type="submit" className="px-6 py-3 text-base">
                      Save Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={signOut}
                      type="button"
                      className="px-6 py-3 text-base"
                    >
                      Sign out
                    </Button>
                  </div>
                </form>
              </section>

              {/* Preferences card */}
              <section className="rounded-2xl border border-border/40 bg-card p-8 shadow-md">
                <h2 className="mb-6 text-2xl font-semibold">Preferences</h2>
                <div className="space-y-4">
                  <ToggleSwitch label="Dark Mode" checked={theme} onChange={toggleTheme} />
                  {/* Add more preferences here */}
                </div>
              </section>
            </div>

            {/* RIGHT: Change Password */}
            <aside>
              <section className="rounded-2xl border border-border/40 bg-card p-8 shadow-md">
                <h2 className="mb-6 text-2xl font-semibold">Change Password</h2>
                <form onSubmit={changePassword} className="space-y-5">
                  {status.password && (
                    <div
                      className={[
                        'rounded-md px-3 py-2 text-sm',
                        status.password.toLowerCase().includes('changed')
                          ? 'border border-success/30 bg-success/10 text-success'
                          : 'border border-error/30 bg-error/10 text-error',
                      ].join(' ')}
                    >
                      {status.password}
                    </div>
                  )}

                  <Input
                    id="currentPassword"
                    type="password"
                    label="Current Password"
                    className="text-base"
                    value={passForm.currentPassword}
                    onChange={(e) => setPassForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  />
                  <Input
                    id="newPassword"
                    type="password"
                    label="New Password"
                    className="text-base"
                    value={passForm.newPassword}
                    onChange={(e) => setPassForm((f) => ({ ...f, newPassword: e.target.value }))}
                  />
                  <Input
                    id="confirm"
                    type="password"
                    label="Confirm New Password"
                    className="text-base"
                    value={passForm.confirm}
                    onChange={(e) => setPassForm((f) => ({ ...f, confirm: e.target.value }))}
                  />

                  <Button type="submit" className="w-full py-3 text-base">
                    Change Password
                  </Button>
                </form>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
