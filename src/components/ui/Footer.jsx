// src/components/ui/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../AppIcon';

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Support', path: '/support' },
    { name: 'Contact', path: '/contact' }
  ];

  const socialLinks = [
    { name: 'GitHub', icon: 'Github', url: 'https://github.com/Pranav2845' },
    { name: 'Twitter', icon: 'Twitter', url: 'https://twitter.com' },
    { name: 'LinkedIn', icon: 'Linkedin', url: 'https://www.linkedin.com/in/pranav-pandey001/' }
  ];

  return (
    <footer className="bg-surface border-t border-border py-3">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Left: Brand + tagline */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary text-white">
              <Icon name="Code" size={16} />
            </div>
            <span className="font-semibold text-base text-text-primary">CodeTracker</span>
          </div>
          <p className="text-sm text-text-secondary leading-snug">
            Track your coding progress across multiple platforms, analyze your strengths and weaknesses, 
            and improve your problem-solving skills with personalized insights.
          </p>
        </div>

        {/* Center: navigation links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {footerLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right: socials + copyright + made with love */}
        <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
          <div className="flex gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <Icon name={link.icon} size={18} />
              </a>
            ))}
          </div>
          <p className="text-xs text-text-secondary">
            © {currentYear} CodeTracker. All rights reserved.
          </p>
          <p className="text-xs text-text-tertiary">
            Made with <span className="text-error">❤</span> for developers
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
