import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

// Simple toggle switch if you don't have one in your ui
const ToggleSwitch = ({ label, checked, onChange }) => (
  <label className="flex items-center space-x-2 mb-4">
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
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [theme, setTheme] = useState(localStorage.getItem('theme') === 'dark');
  const [status, setStatus] = useState({ profile: '', password: '' });

  // 1️⃣ Load current profile
  useEffect(() => {
    axios.get('/user/profile')
      .then(res => setProfile({ name: res.data.name || '', email: res.data.email || '' }))
      .catch(err => setStatus(s => ({ ...s, profile: 'Failed to load profile' })));
  }, []);

  // 2️⃣ Handle profile update
  const updateProfile = async e => {
    e.preventDefault();
    try {
      await axios.patch('/user/profile', profile);
      setStatus(s => ({ ...s, profile: 'Profile updated successfully' }));
    } catch (err) {
      setStatus(s => ({ ...s, profile: err.response?.data?.message || 'Update failed' }));
    }
  };

  // 3️⃣ Handle password change
  const changePassword = async e => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirm) {
      setStatus(s => ({ ...s, password: "New passwords don't match" }));
      return;
    }
    try {
      await axios.post('/user/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      setStatus(s => ({ ...s, password: 'Password changed' }));
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setStatus(s => ({ ...s, password: err.response?.data?.message || 'Password change failed' }));
    }
  };

  // 4️⃣ Toggle theme
  const toggleTheme = isDark => {
    setTheme(isDark);
    document.documentElement.classList[isDark ? 'add' : 'remove']('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  // 5️⃣ Sign out
  const signOut = () => {
     sessionStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
        <form onSubmit={updateProfile} className="space-y-4">
          {status.profile && <p className="text-sm text-success">{status.profile}</p>}
          <Input
            id="name"
            label="Full Name"
            value={profile.name}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
          />
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            value={profile.email}
            onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
          />
          <Button type="submit">Save Profile</Button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Change Password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          {status.password && <p className="text-sm text-error">{status.password}</p>}
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            label="Current Password"
            value={passForm.currentPassword}
            onChange={e => setPassForm(f => ({ ...f, currentPassword: e.target.value }))}
          />
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            label="New Password"
            value={passForm.newPassword}
            onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))}
          />
          <Input
            id="confirm"
            name="confirm"
            type="password"
            label="Confirm New Password"
            value={passForm.confirm}
            onChange={e => setPassForm(f => ({ ...f, confirm: e.target.value }))}
          />
          <Button type="submit">Change Password</Button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Preferences</h2>
        <ToggleSwitch
          label="Dark Mode"
          checked={theme}
          onChange={toggleTheme}
        />
      </section>

      <section>
        <Button variant="outline" onClick={signOut}>Sign out</Button>
      </section>
    </div>
  );
}
