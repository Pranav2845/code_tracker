// src/components/ui/Footer.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

function Footer() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  // Pages where footer should be fixed
  const fixedRoutes = ['/platform-connection', '/gemini', '/profile', '/settings'];
  const isFixed = fixedRoutes.includes(location.pathname);

  const footerLinks = [
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Support', path: '/support' },
    { name: 'Contact', path: '/contact' },
  ];

  const socialLinks = [
    { name: 'GitHub', icon: 'Github', url: 'https://github.com/Pranav2845' },
    { name: 'Twitter', icon: 'Twitter', url: 'https://twitter.com' },
    { name: 'LinkedIn', icon: 'Linkedin', url: 'https://www.linkedin.com/in/pranav-pandey001/' },
  ];

  // Full width inner container
  const inner = 'w-full px-6 lg:px-12';

  return (
    <footer
      className={`bg-surface border-t border-border ${
        isFixed ? 'fixed bottom-0 left-0 right-0 z-40 backdrop-blur-sm/25' : ''
      }`}
      role="contentinfo"
    >
      {/* Top gradient divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border/70 to-transparent" />

      <div
        className={[
          inner,
          'py-4 md:py-5',
          'grid gap-4 md:gap-6',
          'md:grid-cols-[1.2fr_1fr_1.2fr]',
          'items-center',
          isFixed
            ? 'bg-surface/80 backdrop-blur-sm shadow-[0_-6px_16px_rgba(0,0,0,0.20)]'
            : '',
        ].join(' ')}
      >
        {/* Left: Brand + tagline */}
        <div className="flex items-start md:items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white shadow-sm">
            <Icon name="Code" size={18} />
          </div>
          <div className="max-w-md">
            <div className="font-semibold text-text-primary leading-none">
              CodeTracker
            </div>
            <p className="text-xs md:text-sm text-text-secondary mt-1">
              Track progress across platforms, analyze strengths, and grow with actionable
              insights.
            </p>
          </div>
        </div>

        {/* Middle: navigation links + tagline */}
        <div className="flex flex-col items-center justify-center gap-2">
          <nav
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm"
            aria-label="Footer navigation"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-text-secondary hover:text-text-primary hover:underline underline-offset-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-sm px-1"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Professional tagline */}
          <div className="text-xs text-text-tertiary text-center">
            Stay updated with new features and coding insights — follow us on{' '}
            <a
              href="https://github.com/Pranav2845"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub
            </a>
            ,{' '}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Twitter
            </a>{' '}
            &{' '}
            <a
              href="https://www.linkedin.com/in/pranav-pandey001/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              LinkedIn
            </a>.
          </div>
        </div>

        {/* Right: socials + meta */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="flex gap-2.5">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                className="group inline-flex items-center justify-center w-9 h-9 rounded-full border border-border/70 text-text-secondary hover:text-text-primary hover:border-border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                title={link.name}
              >
                <Icon
                  name={link.icon}
                  size={18}
                  className="transition-transform group-hover:-translate-y-0.5"
                />
              </a>
            ))}
          </div>

          <div className="text-[11px] md:text-xs text-text-tertiary">
            © {currentYear}{' '}
            <span className="text-text-secondary">CodeTracker</span>. All
            rights reserved.
          </div>
          <div className="text-[11px] md:text-xs text-text-tertiary">
            Made with <span className="text-error" aria-hidden>❤</span> for developers
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
