// src/components/ui/Header.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Icon from "../AppIcon";
import useTheme from "../../hooks/useTheme";
import api from "../../api/axios";
const NOTIF_READ_KEY = "ct_notif_read_ids";

const getReadIds = () => {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(NOTIF_READ_KEY) || "[]"));
  } catch {
    return new Set();
  }
};
const setReadIds = (set) =>
  sessionStorage.setItem(NOTIF_READ_KEY, JSON.stringify([...set]));

function Header({ variant = "default" }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDark, setIsDark] = useTheme();
  const [user, setUser] = useState({ name: "", email: "", photo: "" });
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
    { name: "Platform Connection", path: "/platform-connection", icon: "Link" },
    { name: "Topic Analysis", path: "/topic-analysis", icon: "BarChart2" },
    { name: "Contests", path: "/contests", icon: "Calendar" },
    { name: "Ask AI", path: "/gemini", icon: "Star" },
  ];

  const navLinkClass =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeClass = "bg-primary-50 text-primary";
  const inactiveClass =
    "text-text-secondary hover:text-text-primary hover:bg-background";

  const toggleProfileMenu = () => setIsProfileMenuOpen((p) => !p);
  const closeProfileMenu = () => setIsProfileMenuOpen(false);
  const toggleNotifMenu = () => setIsNotifOpen((p) => !p);
  const closeNotifMenu = () => setIsNotifOpen(false);

  function handleSignOut() {
    sessionStorage.removeItem("token");
    closeProfileMenu();
    navigate("/login", { replace: true });
  }

  const getInitials = (nameOrEmail = "") => {
    if (!nameOrEmail) return "PP";
    const parts = nameOrEmail.trim().split(/\s+/).filter(Boolean);
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    const word = nameOrEmail.includes("@")
      ? nameOrEmail.split("@")[0]
      : nameOrEmail;
    return (word[0] + (word[1] || "")).toUpperCase();
  };

  // Load profile (cache -> API)
  useEffect(() => {
    const cached = sessionStorage.getItem("userProfile");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setUser({
          name: parsed.name || "",
          email: parsed.email || "",
          photo: parsed.photo || "",
        });
      } catch {}
    }

    const token = sessionStorage.getItem("token");
    if (!token) return;

      api
      .get("/user/profile")
      .then(({ data }) => {
        const next = {
          name: data?.name || "",
          email: data?.email || "",
          photo: data?.photo || "",
        };
        setUser(next);
        sessionStorage.setItem("userProfile", JSON.stringify(next));
      })
      .catch(() => {});
  }, []);

  // Fetch notifications and merge with persisted "read" state
  const fetchNotifications = useCallback(async () => {
    try {
const { data } = await api.get("/user/notifications").catch(() => ({
      }));

      // Fallback demo items if API not implemented
      const items = data?.notifications ?? [
        {
          id: "n1",
          title: "Contest reminder: Weekly #345 starts in 2h",
          href: "/contests",
          unread: true,
          time: "2h",
        },
        {
          id: "n2",
          title: "Your Codeforces handle synced successfully",
          href: "/platform-connection",
          unread: false,
          time: "yesterday",
        },
      ];

      // Apply persisted read state
      const readIds = getReadIds();
      const normalized = items.map((n) => ({
        ...n,
        // If we've marked it read before, force unread=false
        unread: !readIds.has(n.id) && (n.unread ?? true),
      }));

      setNotifications(normalized);
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // React to Settings updates (name/photo)
  useEffect(() => {
    const onProfileUpdated = (e) => {
      setUser((prev) => {
        const next = { ...prev, ...e.detail };
        sessionStorage.setItem("userProfile", JSON.stringify(next));
        return next;
      });
    };
    window.addEventListener("profile:updated", onProfileUpdated);
    return () =>
      window.removeEventListener("profile:updated", onProfileUpdated);
  }, []);

  // Close menus on outside click / Esc
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        closeProfileMenu();
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        closeNotifMenu();
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        closeProfileMenu();
        closeNotifMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const displayName = user.name || "User";
  const initials = getInitials(user.name || user.email);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = async () => {
    // Persist all current IDs as read
    const ids = new Set(getReadIds());
    notifications.forEach((n) => ids.add(n.id));
    setReadIds(ids);

    // Update UI immediately
    setNotifications((list) => list.map((n) => ({ ...n, unread: false })));

    // Best-effort server call
    try {
      await api.post("/user/notifications/mark-all-read").catch(() => {});
    } catch {}
  };

  const markOneAsRead = (id) => {
    const ids = new Set(getReadIds());
    ids.add(id);
    setReadIds(ids);
    setNotifications((list) =>
      list.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  return (
    <header className="bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between ${
            variant === "compact" ? "h-14" : "h-16"
          }`}
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:p-2 focus:bg-primary focus:text-white focus:z-50"
          >
            Skip to content
          </a>

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-white mr-2">
                <Icon name="Code" size={18} />
              </div>
              <span
                className={`font-display font-semibold text-text-primary ${
                  variant === "compact" ? "text-lg" : "text-xl"
                }`}
              >
                CodeTracker
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  navLinkClass +
                  (isActive ? " " + activeClass : " " + inactiveClass)
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Right: Notifications + Dark Mode + Profile */}
          <div className="flex items-center">
            {/* Notifications dropdown (like profile menu) */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                className="relative p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-haspopup="true"
                aria-expanded={isNotifOpen}
                onClick={toggleNotifMenu}
              >
                <Icon name="Bell" size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[10px] leading-[18px] text-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div
                  className="fixed top-16 w-80 max-w-[90vw] rounded-md shadow-lg bg-surface border border-border z-50 animate-scale-in"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
                    <span className="text-sm font-medium text-text-primary">
                      Notifications
                    </span>
                    {notifications.length > 0 && (
                      <button
                        className="text-xs text-primary hover:underline"
                        onClick={markAllAsRead}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <ul className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 && (
                      <li className="px-3 py-4 text-sm text-text-tertiary">
                        You’re all caught up. No new notifications.
                      </li>
                    )}

                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className={[
                          "px-3 py-3 flex gap-3 items-start hover:bg-background/60 cursor-pointer",
                          n.unread ? "bg-primary-50/20" : "",
                        ].join(" ")}
                        onClick={() => {
                          markOneAsRead(n.id);
                          closeNotifMenu();
                          if (n.href) navigate(n.href);
                        }}
                      >
                        <div className="mt-1">
                          <span
                            className={[
                              "inline-block w-2 h-2 rounded-full",
                              n.unread ? "bg-primary" : "bg-border",
                            ].join(" ")}
                            aria-hidden
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-text-primary">
                            {n.title}
                          </div>
                          {n.time && (
                            <div className="text-[11px] text-text-tertiary mt-0.5">
                              {n.time}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              className="p-2 ml-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label="Toggle dark mode"
              onClick={() => setIsDark((d) => !d)}
            >
              <Icon name={isDark ? "Moon" : "Sun"} size={20} />
            </button>

            {/* Profile dropdown */}
            <div
              className="relative ml-3 flex items-center space-x-2 p-2"
              ref={profileRef}
            >
              {user.photo ? (
                <img
                  src={user.photo}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                  onError={() => {
                    setUser((prev) => {
                      const next = { ...prev, photo: "" };
                      sessionStorage.setItem(
                        "userProfile",
                        JSON.stringify(next)
                      );
                      return next;
                    });
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-medium">
                  {getInitials(user.name || user.email)}
                </div>
              )}

              {variant !== "compact" && (
                <button
                  type="button"
                  className="flex items-center space-x-1 focus:outline-none"
                  aria-haspopup="true"
                  aria-expanded={isProfileMenuOpen}
                  onClick={toggleProfileMenu}
                >
                  <span className="text-sm font-medium text-text-primary hidden lg:block">
                    {user.name || "User"}
                  </span>
                  <Icon
                    name="ChevronDown"
                    size={16}
                    className="hidden lg:block"
                  />
                </button>
              )}

              {isProfileMenuOpen && (
                <div
                  className="fixed top-16 w-64 rounded-md shadow-lg py-2 bg-surface border border-border ring-1 ring-black ring-opacity-5 z-50 animate-scale-in"
                  style={{ maxHeight: "90vh", overflowY: "auto" }}
                  role="menu"
                  aria-orientation="vertical"
                >
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-text-primary hover:bg-background"
                    role="menuitem"
                    onClick={closeProfileMenu}
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-text-primary hover:bg-background"
                    role="menuitem"
                    onClick={closeProfileMenu}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background"
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden ml-3">
            <button
              type="button"
              className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <Icon name="Menu" size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                "block px-3 py-2 rounded-md text-base font-medium " +
                (isActive ? activeClass : inactiveClass)
              }
            >
              <div className="flex items-center">
                <Icon name={item.icon} size={18} className="mr-2" />
                {item.name}
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Header;
