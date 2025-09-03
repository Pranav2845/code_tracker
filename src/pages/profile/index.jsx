// src/pages/profile/index.jsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import api from '../../api/axios';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';

const PLATFORM_LOGOS = {
  leetcode: '/assets/images/leetcode.png',
  codeforces: '/assets/images/codeforces.png',
  hackerrank: '/assets/images/hackerrank.webp',
  gfg: '/assets/images/gfg.png',
  code360: '/assets/images/codingninjas.jpeg',
  codechef: '/assets/images/codechef.png',
};

const profileUrlFor = (id, handle) => {
  if (!handle) return null;
  switch (id) {
    case 'leetcode':   return `https://leetcode.com/${handle}/`;
    case 'codeforces': return `https://codeforces.com/profile/${handle}`;
    case 'hackerrank': return `https://www.hackerrank.com/profile/${handle}`;
    case 'gfg':        return `https://auth.geeksforgeeks.org/user/${handle}/`;
    case 'code360':    return `https://www.naukri.com/code360/profile/${handle}`;
    case 'codechef':   return `https://www.codechef.com/users/${handle}`;
    default:           return null;
  }
};

function getInitials(nameOrEmail = '') {
  if (!nameOrEmail) return 'PP';
  const parts = nameOrEmail.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  const word = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail;
  return (word[0] + (word[1] || '')).toUpperCase();
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/user/profile');

        const normalized = {
          name: data?.name || 'User',
          email: data?.email || '',
          photo: data?.photo || '', // expect absolute URL from backend
          createdAt: data?.createdAt ? new Date(data.createdAt) : null,
          platforms: data?.platforms || {},
        };

        // keep header/sessionStorage in sync
        const cachedRaw = sessionStorage.getItem('userProfile');
        let cached = {};
        try { cached = cachedRaw ? JSON.parse(cachedRaw) : {}; } catch {}
        const nextCache = { ...cached, name: normalized.name, email: normalized.email, photo: normalized.photo };
        sessionStorage.setItem('userProfile', JSON.stringify(nextCache));
        window.dispatchEvent(new CustomEvent('profile:updated', { detail: nextCache }));

        setUser(normalized);

        const order = ['leetcode', 'codeforces', 'hackerrank', 'gfg', 'code360', 'codechef'];
        const list = order.map((id) => {
          const handle = normalized.platforms?.[id]?.handle || '';
          return {
            id,
            name:
              id === 'gfg' ? 'GeeksforGeeks' :
              id === 'code360' ? 'Code 360 by Coding Ninjas' :
              id.charAt(0).toUpperCase() + id.slice(1),
            logo: PLATFORM_LOGOS[id],
            handle,
            isConnected: Boolean(handle),
            url: profileUrlFor(id, handle),
          };
        });
        setPlatforms(list);
      } catch (e) {
        console.error(e);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const connectedCount = useMemo(
    () => platforms.filter((p) => p.isConnected).length,
    [platforms]
  );

  if (error) return <p className="p-4 text-error">{error}</p>;
  if (loading || !user) return <p className="p-4">Loading…</p>;

  const initials = getInitials(user.name || user.email);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pb-24">
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

          {/* Profile card (with photo) */}
          <section className="bg-card text-card-foreground border border-border/40 rounded-2xl p-6 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Profile</h1>

            <div className="grid gap-6 md:grid-cols-[auto,1fr] items-start">
              {/* Avatar */}
              <div className="flex items-center md:items-start justify-center">
                {user.photo ? (
                  <img
                     src={user.photo}
                     alt="Profile"
                     className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border border-border/50 shadow-md"
                     onError={(e) => {
                       e.currentTarget.style.display = 'none';
                       const fallback = e.currentTarget.nextSibling;
                       if (fallback) fallback.style.display = 'flex';
                     }}
                   />
                ) : null}
                {/* Fallback bubble (hidden if photo exists and loads) */}
                <div
                  className={`${
                    user.photo ? 'hidden' : 'flex'
                  } w-28 h-28 md:w-32 md:h-32 rounded-full bg-primary-100 text-primary font-semibold items-center justify-center ring-2 ring-border/60`}
                >
                  <span className="text-2xl">{initials}</span>
                </div>
              </div>

              {/* Details */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-text-tertiary">Name</span>
                    <p className="text-base font-medium">{user.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-text-tertiary">Email</span>
                    <p className="text-base font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-text-tertiary">Joined</span>
                    <p className="text-base font-medium">
                      {user.createdAt ? user.createdAt.toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-text-tertiary">Connections</span>
                    <p className="text-base font-medium">
                      {connectedCount} / {platforms.length} connected
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Platforms grid */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Problem Solving Stats</h2>
              <span className="text-xs text-text-tertiary">
                Click a connected platform to open profile
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {platforms.map((p) => {
                const Tag = p.isConnected && p.url ? 'a' : 'div';
                const tagProps = p.isConnected && p.url
                  ? { href: p.url, target: '_blank', rel: 'noreferrer' }
                  : {};

                return (
                  <Tag
                    key={p.id}
                    {...tagProps}
                    className={[
                      'group bg-card border border-border/40 rounded-xl p-4',
                      'hover:shadow-md transition-shadow flex items-center gap-3',
                      p.isConnected ? 'cursor-pointer' : 'opacity-80'
                    ].join(' ')}
                  >
                    <img
                      src={p.logo}
                      alt={`${p.name} logo`}
                      className="w-10 h-10 rounded-md object-contain shrink-0"
                    />
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-text-tertiary">
                        {p.isConnected ? p.handle : 'Not connected'}
                      </div>
                    </div>
                  </Tag>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
