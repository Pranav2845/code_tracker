// src/components/ui/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../AppIcon';

function Footer({ variant = 'default' }) {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Support', path: '/support' },
    { name: 'Contact', path: '/contact' }
  ];
  
  const socialLinks = [
    { name: 'GitHub', icon: 'Github', url: 'https://github.com' },
    { name: 'Twitter', icon: 'Twitter', url: 'https://twitter.com' },
    { name: 'LinkedIn', icon: 'Linkedin', url: 'https://linkedin.com' }
  ];
  
  if (variant === 'minimal') {
    return (
      <footer className="bg-surface border-t border-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-text-secondary">
              &copy; {currentYear} CodeTracker. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-2 sm:mt-0">
              {footerLinks.slice(0, 2).map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }
  
  return (
    <footer className="bg-surface border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-white mr-2">
                <Icon name="Code" size={18} />
              </div>
              <span className="font-display font-semibold text-xl text-text-primary">
                CodeTracker
              </span>
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              Track your coding progress across multiple platforms, analyze your strengths and weaknesses, 
              and improve your problem-solving skills with personalized insights.
            </p>
            <div className="mt-4 flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                  aria-label={link.name}
                >
                  <Icon name={link.icon} size={20} />
                </a>
              ))}
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/documentation" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link to="/api" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  API
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-text-secondary">
            &copy; {currentYear} CodeTracker. All rights reserved.
          </p>
          <p className="mt-2 md:mt-0 text-sm text-text-tertiary">
            Made with <span className="text-error">❤</span> for developers
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;