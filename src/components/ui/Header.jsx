// src/components/ui/Header.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import Icon from "../AppIcon";
import useTheme from "../../hooks/useTheme";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";

function Header({ variant = "default" }) {
  const [isDark, setIsDark] = useTheme();
  const { user } = useUser();

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

          {/* Brand */}
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

          {/* Right side: notifications, theme, auth */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background"
              aria-label="View notifications"
            >
              <Icon name="Bell" size={20} />
            </button>

            <button
              type="button"
              className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background"
              aria-label="Toggle dark mode"
              onClick={() => setIsDark((d) => !d)}
            >
              <Icon name={isDark ? "Moon" : "Sun"} size={20} />
            </button>

            {/* Auth area */}
            <SignedOut>
              <div className="flex items-center gap-2 ml-2">
                <SignInButton mode="modal">
                  <button className="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-background">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-3 py-1.5 rounded-md bg-primary text-white text-sm hover:opacity-90">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center gap-2 ml-2">
                {variant !== "compact" && (
                  <span className="text-sm font-medium text-text-primary hidden lg:block">
                    {user?.fullName || user?.primaryEmailAddress?.emailAddress}
                  </span>
                )}
                <UserButton
                  appearance={{
                    elements: { userButtonAvatarBox: "w-8 h-8" },
                  }}
                />
              </div>
            </SignedIn>
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
