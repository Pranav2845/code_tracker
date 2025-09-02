// src/components/ui/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Icon from "../AppIcon";
import useTheme from "../../hooks/useTheme";
import axios from "axios";

function Header({ variant = "default" }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useTheme();
  const [user, setUser] = useState({ name: "", email: "", photo: "" });
  const navigate = useNavigate();
  const profileRef = useRef();

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

  const toggleProfileMenu = () => setIsProfileMenuOpen((prev) => !prev);
  const closeProfileMenu = () => setIsProfileMenuOpen(false);

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

  // Load profile on mount (cache -> API)
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

    axios
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

  // React to Settings updates
  useEffect(() => {
    const onProfileUpdated = (e) => {
      setUser((prev) => {
        const next = { ...prev, ...e.detail };
        sessionStorage.setItem("userProfile", JSON.stringify(next));
        return next;
      });
    };
    window.addEventListener("profile:updated", onProfileUpdated);
    return () => window.removeEventListener("profile:updated", onProfileUpdated);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        closeProfileMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user.name || "User";
  const initials = getInitials(user.name || user.email);

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

          {/* Right Icons + Profile */}
          <div className="flex items-center relative" ref={profileRef}>
            <button
              type="button"
              className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background"
              aria-label="View notifications"
            >
              <Icon name="Bell" size={20} />
            </button>

            <button
              type="button"
              className="p-2 ml-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background"
              aria-label="Toggle dark mode"
              onClick={() => setIsDark((d) => !d)}
            >
              <Icon name={isDark ? "Moon" : "Sun"} size={20} />
            </button>

            <div className="relative ml-3 flex items-center space-x-2 p-2">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                  onError={() => {
                    // if the absolute URL is unreachable, fall back to initials
                    setUser((prev) => {
                      const next = { ...prev, photo: "" };
                      sessionStorage.setItem("userProfile", JSON.stringify(next));
                      return next;
                    });
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-medium">
                  {initials}
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
                    {displayName}
                  </span>
                  <Icon name="ChevronDown" size={16} className="hidden lg:block" />
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
