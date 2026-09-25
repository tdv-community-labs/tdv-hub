/**
 * TDV Hub — SSO Broker Script
 * Handles cross-origin postMessage SSO for the TDV Ecosystem.
 * Extracted from sso-broker.html inline <script> block.
 *
 * Security: Uses explicit origin allowlist instead of broad regex.
 */
(function () {
  'use strict';

  // === STRICT ORIGIN ALLOWLIST ===
  // Only explicitly listed origins are permitted. No regex — no wildcards.
  const ALLOWED_ORIGINS = new Set([
    'https://tdv-e-school.vercel.app',
    'https://school-minifootball-tournament.vercel.app',
    'https://tdv-mafia.vercel.app',
    'https://tdv-games.vercel.app',
    'https://tdv-hub.vercel.app',
  ]);

  /**
   * Returns true if the given origin is in the allowlist,
   * or if the hostname is localhost / 127.0.0.1 (dev only).
   * @param {string} origin
   * @returns {boolean}
   */
  function isOriginAllowed(origin) {
    if (!origin) return false;
    if (ALLOWED_ORIGINS.has(origin)) return true;
    // localhost dev only
    try {
      const u = new URL(origin);
      return u.hostname === 'localhost' || u.hostname === '127.0.0.1';
    } catch {
      return false;
    }
  }

  const SESSION_KEY = 'tdv_ecosystem_session_v1';
  const USERS_KEY = 'tdv_registered_users_v1';

  const DEFAULT_SEEDED_USERS = [
    {
      userId: 'tdv-seed-orxan',
      username: 'orxan',
      fullName: 'Orxan Əliyev',
      grade: 10,
      schoolClass: '10A',
      role: 'player',
      pin: '1000',
      avatar: '⚽'
    },
    {
      userId: 'tdv-seed-murad',
      username: 'murad',
      fullName: 'Murad Məmmədov',
      grade: 11,
      schoolClass: '11B',
      role: 'player',
      pin: '1100',
      avatar: '⚡'
    },
    {
      userId: 'tdv-seed-elvin',
      username: 'elvin_coach',
      fullName: 'Elvin Müəllim',
      grade: 0,
      schoolClass: 'Məşqçi',
      role: 'coach',
      pin: '2026',
      avatar: '👨‍🏫'
    },
    {
      userId: 'tdv-seed-admin',
      username: 'admin',
      fullName: 'TDV İnzibatçı',
      grade: 0,
      schoolClass: 'Rəhbərlik',
      role: 'admin',
      pin: 'admin2026',
      avatar: '👑'
    }
  ];

  function getStoredUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch (e) {}
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_SEEDED_USERS));
    return DEFAULT_SEEDED_USERS;
  }

  window.addEventListener('message', function (event) {
    if (!isOriginAllowed(event.origin)) return;

    const data = event.data;
    if (!data || !data.type) return;

    try {
      if (data.type === 'TDV_SSO_PING') {
        event.source.postMessage({ type: 'TDV_SSO_PONG' }, event.origin);

      } else if (data.type === 'TDV_SSO_GET') {
        const rawSession = localStorage.getItem(SESSION_KEY);
        const users = getStoredUsers();
        let session = null;
        if (rawSession) {
          try {
            const parsed = JSON.parse(rawSession);
            if (parsed && parsed.expiresAt > Date.now()) {
              const userMatch = users.find(
                u => u && u.username &&
                     u.username.toLowerCase() === (parsed.username || '').toLowerCase()
              );
              if (userMatch) {
                session = parsed;
              } else {
                console.warn('[Broker] Ghost session purged:', parsed.username);
                localStorage.removeItem(SESSION_KEY);
              }
            } else {
              localStorage.removeItem(SESSION_KEY);
            }
          } catch (e) {}
        }
        event.source.postMessage({
          type: 'TDV_SSO_DATA',
          session: session,
          users: users,
          requestId: data.requestId
        }, event.origin);

      } else if (data.type === 'TDV_SSO_SET') {
        if (data.session) {
          localStorage.setItem(
            SESSION_KEY,
            typeof data.session === 'string' ? data.session : JSON.stringify(data.session)
          );
        }
        if (data.users) {
          const currentUsers = getStoredUsers();
          const incomingUsers = Array.isArray(data.users)
            ? data.users
            : (typeof data.users === 'string' ? JSON.parse(data.users) : [data.users]);
          const userMap = new Map();
          currentUsers.forEach(u => { if (u && u.username) userMap.set(u.username.toLowerCase(), u); });
          incomingUsers.forEach(u => { if (u && u.username) userMap.set(u.username.toLowerCase(), u); });
          const merged = Array.from(userMap.values());
          localStorage.setItem(USERS_KEY, JSON.stringify(merged));
        }
        event.source.postMessage({ type: 'TDV_SSO_SAVED', requestId: data.requestId }, event.origin);

      } else if (data.type === 'TDV_SSO_LOGOUT') {
        localStorage.removeItem(SESSION_KEY);
        event.source.postMessage({ type: 'TDV_SSO_LOGGED_OUT', requestId: data.requestId }, event.origin);
      }
    } catch (err) {
      console.warn('[SSO Broker Error]:', err);
    }
  });

  // Notify parent that broker is ready.
  // We use '*' here because we do not know the parent's origin at load time.
  // All subsequent messages use explicit event.origin for replies.
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'TDV_SSO_BROKER_READY' }, '*');
    }
  } catch (e) {}
})();
