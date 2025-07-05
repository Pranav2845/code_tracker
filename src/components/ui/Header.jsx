// src/components/ui/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import useTheme from '../../hooks/useTheme';

function Header({ variant = 'default' }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
   const [isDark, setIsDark] = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { name: 'Platform Connection', path: '/platform-connection', icon: 'Link' },
    { name: 'Topic Analysis', path: '/topic-analysis', icon: 'BarChart2' },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleProfileMenu = () => setIsProfileMenuOpen(o => !o);
  const closeProfileMenu = () => setIsProfileMenuOpen(false);

  function handleSignOut() {
    // 1) clear token
     sessionStorage.removeItem('token');
    // 2) close the dropdown
    setIsProfileMenuOpen(false);
    // 3) send them back to login
    navigate('/login', { replace: true });
  }

  return (
    <header className="bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between ${variant === 'compact' ? 'h-14' : 'h-16'}`}>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-2 focus:bg-primary focus:text-white focus:z-50">
            Skip to content
          </a>

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-white mr-2">
                <Icon name="Code" size={18} />
              </div>
              <span className={`font-display font-semibold text-text-primary ${variant === 'compact' ? 'text-lg' : 'text-xl'}`}>
                CodeTracker
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-4">
            {navigation.map(item => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background'
                }`}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center">
            {/* Notifications */}
            <button
              type="button"
              className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background"
              aria-label="View notifications"
            >
              <Icon name="Bell" size={20} />
            </button>

            {/* Theme toggle */}
            <button
              type="button"
              className="p-2 ml-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background"
              aria-label="Toggle dark mode"
              onClick={() => setIsDark(d => !d)}
            >
              <Icon name={isDark ? 'Moon' : 'Sun'} size={20} />
            </button>

            {/* Profile dropdown */}
            <div className="relative ml-3">
              <button
                type="button"
                className="flex items-center space-x-2 p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background"
                aria-haspopup="true"
                aria-expanded={isProfileMenuOpen}
                onClick={toggleProfileMenu}
              >
                <span className="sr-only">Open user menu</span>
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-medium">
                  PP
                </div>
                {variant !== 'compact' && (
                  <>
                    <span className="text-sm font-medium text-text-primary hidden lg:block">Pranav Pandey</span>
                    <Icon name="ChevronDown" size={16} className="hidden lg:block" />
                  </>
                )}
              </button>

              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-surface border border-border ring-1 ring-black ring-opacity-5 z-10 animate-scale-in"
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

            {/* Mobile menu button */}
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
      </div>

      {/* Mobile nav */}
      <div className="md:hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigation.map(item => (
            <Link
              key={item.name}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(item.path)
                  ? 'bg-primary-50 text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background'
              }`}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              <div className="flex items-center">
                <Icon name={item.icon} size={18} className="mr-2" />
                {item.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Header;
